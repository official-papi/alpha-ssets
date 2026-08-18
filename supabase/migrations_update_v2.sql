-- ==============================================================================
-- HYIP MAX INCREMENTAL MIGRATION SCRIPT (migrations_update_v2.sql)
-- Run this script in your Supabase SQL Editor to apply new RPCs and features
-- without conflicting with schema.sql or schema_extended.sql.
-- ==============================================================================

-- ADD QR_CODE_URL COLUMN TO GATEWAYS TABLE
ALTER TABLE public.gateways ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- 1. UPDATED DEPOSIT APPROVAL RPC WITH AUTOMATIC MULTI-LEVEL REFERRAL COMMISSIONS
CREATE OR REPLACE FUNCTION public.approve_deposit_rpc(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Approved by admin'
) RETURNS JSONB AS $$
DECLARE
    v_deposit RECORD;
    v_new_balance NUMERIC;
    v_trx_ref TEXT;
    v_current_referrer UUID;
    v_lvl RECORD;
    v_comm_amount NUMERIC;
    v_ref_trx_ref TEXT;
    v_ref_post_bal NUMERIC;
BEGIN
    SELECT * INTO v_deposit FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Deposit record not found.');
    END IF;

    IF v_deposit.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Deposit request is already processed.');
    END IF;

    -- Update deposit status
    UPDATE public.deposits
    SET status = 'approved',
        admin_feedback = p_feedback,
        updated_at = NOW()
    WHERE id = p_deposit_id;

    -- Credit user deposit wallet
    UPDATE public.profiles
    SET deposit_wallet = deposit_wallet + v_deposit.final_amount,
        updated_at = NOW()
    WHERE id = v_deposit.user_id
    RETURNING deposit_wallet INTO v_new_balance;

    -- Record transaction ledger
    v_trx_ref := 'DEP-' || upper(substring(md5(random()::text) from 1 for 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        v_deposit.user_id, 'deposit', 'deposit_wallet', v_deposit.final_amount, v_deposit.charge,
        v_new_balance, 'Deposit approved via ' || v_deposit.gateway_name, v_trx_ref
    );

    -- Create notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_deposit.user_id, 'Deposit Approved', 'Your deposit of $' || v_deposit.final_amount || ' via ' || v_deposit.gateway_name || ' has been approved.', 'success');

    -- Multi-Level Referral Bonus Distribution
    BEGIN
        SELECT referred_by INTO v_current_referrer FROM public.profiles WHERE id = v_deposit.user_id;

        FOR v_lvl IN SELECT * FROM public.referral_levels WHERE is_active = true ORDER BY level ASC LOOP
            EXIT WHEN v_current_referrer IS NULL;

            v_comm_amount := (v_deposit.final_amount * v_lvl.commission_percent) / 100.0;

            IF v_comm_amount > 0 THEN
                -- Credit referrer interest_wallet
                UPDATE public.profiles
                SET interest_wallet = interest_wallet + v_comm_amount, updated_at = NOW()
                WHERE id = v_current_referrer
                RETURNING interest_wallet INTO v_ref_post_bal;

                -- Record referral commission log
                INSERT INTO public.referral_commissions (referrer_id, referee_id, level, amount, description)
                VALUES (v_current_referrer, v_deposit.user_id, v_lvl.level, v_comm_amount, 'Deposit commission Level ' || v_lvl.level);

                -- Record transaction ledger for referrer
                v_ref_trx_ref := 'REF-' || upper(substring(md5(random()::text) from 1 for 10));
                INSERT INTO public.transactions (
                    user_id, type, wallet, amount, charge, post_balance, description, trx_ref
                ) VALUES (
                    v_current_referrer, 'referral_commission', 'interest_wallet', v_comm_amount, 0.00,
                    v_ref_post_bal, 'Referral commission Level ' || v_lvl.level || ' from deposit', v_ref_trx_ref
                );
            END IF;

            -- Move up to next upline referrer
            SELECT referred_by INTO v_current_referrer FROM public.profiles WHERE id = v_current_referrer;
        END LOOP;
    EXCEPTION
        WHEN OTHERS THEN NULL; -- Graceful fallback
    END;

    RETURN jsonb_build_object('success', true, 'message', 'Deposit approved successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. ALTER TABLE WITHDRAWALS ADD WALLET_TYPE COLUMN
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS wallet_type wallet_type DEFAULT 'interest_wallet';

-- NEW ATOMIC WITHDRAWAL REQUEST RPC (HOLDS BALANCE INSTANTLY & TRACKS WALLET TYPE)
CREATE OR REPLACE FUNCTION public.request_withdrawal_rpc(
    p_user_id UUID,
    p_wallet_type wallet_type,
    p_amount NUMERIC,
    p_method_name TEXT,
    p_account_details JSONB
) RETURNS JSONB AS $$
DECLARE
    v_current_bal NUMERIC;
    v_charge NUMERIC := 0.00;
    v_net_amount NUMERIC;
    v_method RECORD;
    v_withdrawal_id UUID;
    v_trx_ref TEXT;
BEGIN
    SELECT * INTO v_method FROM public.withdraw_methods WHERE name = p_method_name AND status = true;
    IF FOUND THEN
        v_charge := COALESCE(v_method.fixed_charge, 0) + ((p_amount * COALESCE(v_method.percent_charge, 0)) / 100.0);
    END IF;

    v_net_amount := p_amount - v_charge;
    IF v_net_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal amount after charge must be greater than zero.');
    END IF;

    IF p_wallet_type = 'deposit_wallet' THEN
        SELECT deposit_wallet INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    ELSE
        SELECT interest_wallet INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    END IF;

    IF v_current_bal IS NULL OR v_current_bal < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient wallet balance for withdrawal.');
    END IF;

    -- Deduct/hold amount from user wallet
    IF p_wallet_type = 'deposit_wallet' THEN
        UPDATE public.profiles SET deposit_wallet = deposit_wallet - p_amount, updated_at = NOW() WHERE id = p_user_id;
    ELSE
        UPDATE public.profiles SET interest_wallet = interest_wallet - p_amount, updated_at = NOW() WHERE id = p_user_id;
    END IF;

    INSERT INTO public.withdrawals (
        user_id, amount, charge, net_amount, method_name, account_details, wallet_type, status
    ) VALUES (
        p_user_id, p_amount, v_charge, v_net_amount, p_method_name, p_account_details, p_wallet_type, 'pending'
    ) RETURNING id INTO v_withdrawal_id;

    v_trx_ref := 'WTH-' || upper(substring(md5(random()::text) from 1 for 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        p_user_id, 'withdraw', p_wallet_type, p_amount, v_charge,
        (v_current_bal - p_amount), 'Withdrawal requested via ' || p_method_name, v_trx_ref
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Withdrawal request submitted successfully.',
        'withdrawal_id', v_withdrawal_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- UPDATED REJECT WITHDRAWAL RPC (REFUNDS TO ORIGINAL WALLET)
CREATE OR REPLACE FUNCTION public.reject_withdrawal_rpc(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Rejected by admin'
) RETURNS JSONB AS $$
DECLARE
    v_withdraw RECORD;
    v_new_balance NUMERIC;
    v_trx_ref TEXT;
    v_target_wallet wallet_type;
BEGIN
    SELECT * INTO v_withdraw FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal record not found.');
    END IF;

    IF v_withdraw.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal request is already processed.');
    END IF;

    v_target_wallet := COALESCE(v_withdraw.wallet_type, 'interest_wallet'::wallet_type);

    UPDATE public.withdrawals
    SET status = 'rejected',
        admin_feedback = p_feedback,
        updated_at = NOW()
    WHERE id = p_withdrawal_id;

    IF v_target_wallet = 'deposit_wallet' THEN
        UPDATE public.profiles
        SET deposit_wallet = deposit_wallet + v_withdraw.amount, updated_at = NOW()
        WHERE id = v_withdraw.user_id
        RETURNING deposit_wallet INTO v_new_balance;
    ELSE
        UPDATE public.profiles
        SET interest_wallet = interest_wallet + v_withdraw.amount, updated_at = NOW()
        WHERE id = v_withdraw.user_id
        RETURNING interest_wallet INTO v_new_balance;
    END IF;

    v_trx_ref := 'REF-' || upper(substring(md5(random()::text) from 1 for 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        v_withdraw.user_id, 'admin_adjustment', v_target_wallet, v_withdraw.amount, 0.00,
        v_new_balance, 'Withdrawal request rejected - refunded to ' || v_target_wallet, v_trx_ref
    );

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal rejected and refunded successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- SEED 6 OFFICIAL INVESTMENT PACKAGES
INSERT INTO public.investment_plans (name, badge, description, min_amount, max_amount, roi_percentage, payout_interval_hours, total_payout_periods, capital_back, is_active)
VALUES 
('Regular Package', 'Starter Tier', '2.5% weekly return with principal returned at maturity.', 500.00, 2000.00, 2.50, 168, 8, true, true),
('Silver Package', 'Growth Tier', '4.0% weekly return with multi-tier affiliate earnings.', 3000.00, 5000.00, 4.00, 168, 12, true, true),
('Gold Package', 'Most Popular', '6.0% weekly return with dedicated account management.', 10000.00, 20000.00, 6.00, 168, 16, true, true),
('VIP Package', 'High Yield', '10.0% weekly return with custom vault storage & 24/7 support.', 50000.00, 200000.00, 10.00, 168, 24, true, true),
('Ultimate Package', 'Executive Tier', '12.0% weekly return with institutional cold custody & private wealth advisory.', 500000.00, 3000000.00, 12.00, 168, 36, true, true),
('Elites Package', 'Exclusive Tier', '15.5% weekly return. In elite packages you can get a loan from the company to buy a house and pay in installments.', 5000000.00, 20000000.00, 15.50, 168, 52, true, true)
ON CONFLICT DO NOTHING;


-- 3. ATOMIC INVESTMENT CREATION RPC (VALIDATES BALANCE, DEDUCTS WALLET, CREATES INVESTMENT)
CREATE OR REPLACE FUNCTION public.process_investment_rpc(
    p_user_id UUID,
    p_plan_id TEXT,
    p_amount NUMERIC,
    p_wallet_type wallet_type DEFAULT 'deposit_wallet'
) RETURNS JSONB AS $$
DECLARE
    v_current_bal NUMERIC;
    v_new_bal NUMERIC;
    v_plan RECORD;
    v_target_plan_id UUID;
    v_daily_rate NUMERIC;
    v_payout_per_period NUMERIC;
    v_repeat_time INTEGER := 30;
    v_next_payout TIMESTAMP;
    v_investment_id UUID;
    v_trx_ref TEXT;
BEGIN
    IF p_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Investment amount must be greater than zero.');
    END IF;

    IF p_wallet_type = 'deposit_wallet' THEN
        SELECT deposit_wallet INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    ELSE
        SELECT interest_wallet INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    END IF;

    IF v_current_bal IS NULL OR v_current_bal < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient wallet balance to create investment.');
    END IF;

    -- Look up plan by UUID or Name
    SELECT * INTO v_plan FROM public.investment_plans
    WHERE (id::text = p_plan_id OR name ILIKE '%' || p_plan_id || '%') AND is_active = true
    LIMIT 1;

    IF FOUND THEN
        v_target_plan_id := v_plan.id;
        v_daily_rate := v_plan.roi_percentage / 100.0;
        v_repeat_time := COALESCE(v_plan.total_payout_periods, 30);
    ELSE
        -- Fallback to first active plan in DB to satisfy Foreign Key
        SELECT id INTO v_target_plan_id FROM public.investment_plans WHERE is_active = true LIMIT 1;
        IF v_target_plan_id IS NULL THEN
            INSERT INTO public.investment_plans (name, roi_percentage, total_payout_periods, min_amount, max_amount)
            VALUES ('Starter Plan', 2.50, 30, 50.00, 500.00) RETURNING id INTO v_target_plan_id;
        END IF;
        v_daily_rate := 0.035;
        v_repeat_time := 30;
    END IF;

    v_payout_per_period := p_amount * v_daily_rate;
    v_next_payout := NOW() + INTERVAL '1 day';

    -- Deduct balance atomically
    IF p_wallet_type = 'deposit_wallet' THEN
        UPDATE public.profiles
        SET deposit_wallet = deposit_wallet - p_amount, updated_at = NOW()
        WHERE id = p_user_id
        RETURNING deposit_wallet INTO v_new_bal;
    ELSE
        UPDATE public.profiles
        SET interest_wallet = interest_wallet - p_amount, updated_at = NOW()
        WHERE id = p_user_id
        RETURNING interest_wallet INTO v_new_bal;
    END IF;

    -- Insert active user investment
    INSERT INTO public.user_investments (
        user_id, plan_id, invest_amount, payout_per_period,
        total_payout_periods, paid_periods, next_payout_at, status
    ) VALUES (
        p_user_id, v_target_plan_id, p_amount, v_payout_per_period,
        v_repeat_time, 0, v_next_payout, 'active'
    ) RETURNING id INTO v_investment_id;

    -- Log transaction ledger
    v_trx_ref := 'INV-' || upper(substring(md5(random()::text) from 1 for 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        p_user_id, 'invest', p_wallet_type, p_amount, 0.00,
        v_new_bal, 'Investment created in package (' || COALESCE(v_plan.name, 'Starter Plan') || ')', v_trx_ref
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Investment created successfully.',
        'investment_id', v_investment_id,
        'new_balance', v_new_bal
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. AUTOMATED ROI PAYOUT ENGINE RPC (PROCESSES MATURED PAYOUTS)
CREATE OR REPLACE FUNCTION public.process_investment_payouts_rpc()
RETURNS JSONB AS $$
DECLARE
    v_inv RECORD;
    v_count INTEGER := 0;
    v_new_bal NUMERIC;
    v_trx_ref TEXT;
    v_new_paid INTEGER;
    v_is_completed BOOLEAN;
BEGIN
    FOR v_inv IN
        SELECT ui.*, p.interest_wallet
        FROM public.user_investments ui
        JOIN public.profiles p ON p.id = ui.user_id
        WHERE ui.status = 'active'
          AND ui.next_payout_at <= NOW()
          AND ui.paid_periods < ui.total_payout_periods
        FOR UPDATE OF ui
    LOOP
        v_new_paid := v_inv.paid_periods + 1;
        v_is_completed := (v_new_paid >= v_inv.total_payout_periods);

        -- Credit user interest wallet
        UPDATE public.profiles
        SET interest_wallet = interest_wallet + v_inv.payout_per_period,
            updated_at = NOW()
        WHERE id = v_inv.user_id
        RETURNING interest_wallet INTO v_new_bal;

        -- Update investment period counter & status
        UPDATE public.user_investments
        SET paid_periods = v_new_paid,
            next_payout_at = CASE WHEN v_is_completed THEN NULL ELSE NOW() + INTERVAL '1 day' END,
            status = CASE WHEN v_is_completed THEN 'completed' ELSE 'active' END,
            updated_at = NOW()
        WHERE id = v_inv.id;

        -- Log interest payout transaction ledger
        v_trx_ref := 'ROI-' || upper(substring(md5(random()::text) from 1 for 10));
        INSERT INTO public.transactions (
            user_id, type, wallet, amount, charge, post_balance, description, trx_ref
        ) VALUES (
            v_inv.user_id, 'interest_payout', 'interest_wallet', v_inv.payout_per_period, 0.00,
            v_new_bal, 'ROI payout period ' || v_new_paid || '/' || v_inv.total_payout_periods, v_trx_ref
        );

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Processed ' || v_count || ' ROI investment payouts.',
        'payouts_processed', v_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. PROFILE WALLET & ROLE TAMPERING PREVENTION TRIGGER
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If trigger is invoked by standard authenticated user direct API update
    IF (current_user = 'authenticated' OR current_user = 'anon') THEN
        IF OLD.deposit_wallet IS DISTINCT FROM NEW.deposit_wallet OR
           OLD.interest_wallet IS DISTINCT FROM NEW.interest_wallet OR
           OLD.role IS DISTINCT FROM NEW.role THEN
            RAISE EXCEPTION 'Unauthorized attempt to modify financial balances or roles.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_sensitive_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_sensitive_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();



-- 6. SUPABASE STORAGE BUCKET HELPER INSTRUCTIONS
-- In your Supabase Dashboard -> Storage, ensure the following public buckets are created:
--   a) deposit-proofs (Public)
--   b) kyc-documents (Public / Authenticated read)

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. FIX RECURSIVE RLS POLICY ON profiles TABLE
-- The original "Users can view own profile" policy used:
--   (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
-- This causes infinite recursion in the middleware / server context.
-- Replace it with a non-recursive version using auth.uid() = id only,
-- relying on JWT claims (user_metadata.role) for admin checks in app code.
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop the old recursive policy
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Create a clean, non-recursive SELECT policy:
-- Users can always read their own row. Admin reads all rows.
-- For admin check we use (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role'
-- which reads from the JWT token itself (zero DB query, zero recursion).
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- ==============================================================================
-- 7. RLS POLICIES FOR FINANCIAL ENTITIES (Admin + User)
-- ==============================================================================

-- Deposits
DROP POLICY IF EXISTS "Users can view own deposits" ON public.deposits;
CREATE POLICY "Users can view own deposits" ON public.deposits
    FOR SELECT USING (
        auth.uid() = user_id
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Users can create deposits" ON public.deposits;
CREATE POLICY "Users can create deposits" ON public.deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update deposits" ON public.deposits;
CREATE POLICY "Admins can update deposits" ON public.deposits
    FOR UPDATE USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        OR auth.uid() = user_id
    );

-- Withdrawals
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
    FOR SELECT USING (
        auth.uid() = user_id
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Users can create withdrawals" ON public.withdrawals;
CREATE POLICY "Users can create withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can update withdrawals" ON public.withdrawals
    FOR UPDATE USING (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = user_id
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- User Investments
DROP POLICY IF EXISTS "Users can view own investments" ON public.user_investments;
CREATE POLICY "Users can view own investments" ON public.user_investments
    FOR SELECT USING (
        auth.uid() = user_id
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );




-- ==============================================================================
-- 7. PERFORMANCE INDEXES
-- Eliminates full table scans on the most frequent query patterns.
-- Safe to run multiple times (IF NOT EXISTS).
-- ==============================================================================

-- Dashboard: user_investments lookup by user
CREATE INDEX IF NOT EXISTS idx_user_investments_user_id
  ON public.user_investments(user_id);

-- Transactions history page: filter by user + sort by date
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_created
  ON public.transactions(user_id, created_at DESC);

-- Deposit history: filter by user + status (admin approvals filter on status)
CREATE INDEX IF NOT EXISTS idx_deposits_user_id_status
  ON public.deposits(user_id, status);

-- Withdrawals: filter by user + status
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id_status
  ON public.withdrawals(user_id, status);

-- Cron payout engine: only scans active investments due for payout
-- Partial index keeps this tiny and fast even with millions of completed rows
CREATE INDEX IF NOT EXISTS idx_user_investments_active_next_payout
  ON public.user_investments(next_payout_at)
  WHERE status = 'active';

-- Gateways: status filter (used on every deposit modal load)
CREATE INDEX IF NOT EXISTS idx_gateways_status
  ON public.gateways(status)
  WHERE status = true;

