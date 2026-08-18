-- ==============================================================================
-- HYIP MAX INVESTMENT PLATFORM - SUPABASE EXTENDED SCHEMA (schema_extended.sql)
-- Multi-Level Referrals, Gateways, Withdrawal Methods, KYC, Site Settings & Atomic RPCs
-- ==============================================================================

-- 1. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE kyc_status AS ENUM ('unverified', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE referral_commission_type AS ENUM ('deposit', 'invest', 'interest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'HYIP Max Platform',
    site_email TEXT DEFAULT 'admin@hyipmax.com',
    currency_symbol TEXT DEFAULT '$',
    currency_code TEXT DEFAULT 'USD',
    logo_url TEXT,
    favicon_url TEXT,
    maintenance_mode BOOLEAN DEFAULT false,
    kyc_mandatory BOOLEAN DEFAULT false,
    two_fa_mandatory BOOLEAN DEFAULT false,
    signup_bonus NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row_settings CHECK (id = 1)
);

-- Seed Default Settings
INSERT INTO public.site_settings (id, site_name, currency_symbol, currency_code)
VALUES (1, 'HYIP Max Platform', '$', 'USD')
ON CONFLICT (id) DO NOTHING;

-- 3. KYC REQUESTS & SETTINGS
CREATE TABLE IF NOT EXISTS public.kyc_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL, -- e.g. 'National ID', 'Passport', 'Driver License'
    document_number TEXT,
    document_front_url TEXT NOT NULL,
    document_back_url TEXT,
    address_proof_url TEXT,
    status kyc_status DEFAULT 'pending',
    admin_feedback TEXT,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.kyc_settings (
    id INT PRIMARY KEY DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    required_documents JSONB DEFAULT '["National ID / Passport", "Proof of Address"]'::jsonb,
    CONSTRAINT single_row_kyc_settings CHECK (id = 1)
);

INSERT INTO public.kyc_settings (id, is_required) VALUES (1, true) ON CONFLICT (id) DO NOTHING;

-- 4. PAYMENT GATEWAYS TABLE (Automatic & Manual)
CREATE TABLE IF NOT EXISTS public.gateways (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE, -- e.g. 'usdt_trc20', 'bitcoin', 'bank_transfer', 'stripe'
    is_automatic BOOLEAN DEFAULT false,
    min_limit NUMERIC(15, 2) NOT NULL DEFAULT 10.00,
    max_limit NUMERIC(15, 2) NOT NULL DEFAULT 10000.00,
    fixed_charge NUMERIC(15, 2) DEFAULT 0.00,
    percent_charge NUMERIC(5, 2) DEFAULT 0.00,
    rate NUMERIC(15, 4) DEFAULT 1.0000, -- Exchange rate relative to base USD
    currency TEXT DEFAULT 'USD',
    wallet_address TEXT, -- For manual crypto deposits
    instructions TEXT, -- Payment instructions for user
    credentials JSONB DEFAULT '{}'::jsonb, -- API keys for automatic gateways
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Gateways
INSERT INTO public.gateways (name, code, is_automatic, min_limit, max_limit, wallet_address, instructions)
VALUES 
('USDT (TRC20)', 'usdt_trc20', false, 20.00, 50000.00, 'T9yD14Nj9j7x8kL2m1n0PqRsTuVwXyZ3aB', 'Send exact USDT TRC20 amount to the wallet address and paste your TxHash below.'),
('Bitcoin (BTC)', 'bitcoin', false, 50.00, 100000.00, 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', 'Transfer BTC amount to wallet address and provide Transaction ID.'),
('Bank Wire Transfer', 'bank_wire', false, 100.00, 250000.00, 'IBAN: US98765432109876543210', 'Transfer funds via SWIFT/Bank wire and upload deposit receipt.')
ON CONFLICT (code) DO NOTHING;

-- 5. WITHDRAWAL METHODS TABLE
CREATE TABLE IF NOT EXISTS public.withdraw_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    min_limit NUMERIC(15, 2) NOT NULL DEFAULT 10.00,
    max_limit NUMERIC(15, 2) NOT NULL DEFAULT 5000.00,
    fixed_charge NUMERIC(15, 2) DEFAULT 0.00,
    percent_charge NUMERIC(5, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    required_fields JSONB DEFAULT '["Wallet Address or Bank Account Details"]'::jsonb,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Withdrawal Methods
INSERT INTO public.withdraw_methods (name, code, min_limit, max_limit, fixed_charge, percent_charge)
VALUES 
('USDT TRC20 Payout', 'usdt_trc20_w', 10.00, 10000.00, 1.00, 0.50),
('Bitcoin Payout', 'bitcoin_w', 25.00, 25000.00, 2.00, 1.00),
('Bank Account Transfer', 'bank_transfer_w', 50.00, 50000.00, 5.00, 1.50)
ON CONFLICT (code) DO NOTHING;

-- 6. MULTI-LEVEL REFERRAL COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.referral_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level INT NOT NULL UNIQUE,
    commission_percent NUMERIC(5, 2) NOT NULL, -- e.g. 5.00 for 5%
    type referral_commission_type DEFAULT 'deposit',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Referral Levels (Level 1: 5%, Level 2: 3%, Level 3: 1%)
INSERT INTO public.referral_levels (level, commission_percent, type)
VALUES 
(1, 5.00, 'deposit'),
(2, 3.00, 'deposit'),
(3, 1.00, 'deposit')
ON CONFLICT (level) DO NOTHING;

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL means global admin notification
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'info', -- 'info', 'success', 'warning', 'danger'
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BLOGS & CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
    cover_image TEXT,
    excerpt TEXT,
    content TEXT NOT NULL,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ATOMIC STORED PROCEDURES (RPCs) FOR FINANCIAL INTEGRITY
-- ==============================================================================

-- A. PROCESS INVESTMENT RPC (Atomically deduct deposit_wallet and create investment)
CREATE OR REPLACE FUNCTION public.process_investment_rpc(
    p_user_id UUID,
    p_plan_id UUID,
    p_amount NUMERIC
) RETURNS JSONB AS $$
DECLARE
    v_deposit_balance NUMERIC;
    v_plan RECORD;
    v_payout_per_period NUMERIC;
    v_next_payout TIMESTAMPTZ;
    v_investment_id UUID;
    v_trx_ref TEXT;
BEGIN
    -- Check user deposit wallet balance
    SELECT deposit_wallet INTO v_deposit_balance FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    IF v_deposit_balance IS NULL OR v_deposit_balance < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Insufficient deposit wallet balance.');
    END IF;

    -- Fetch investment plan details
    SELECT * INTO v_plan FROM public.investment_plans WHERE id = p_plan_id AND is_active = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Investment plan is not active or found.');
    END IF;

    IF p_amount < v_plan.min_amount OR p_amount > v_plan.max_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'Investment amount is outside plan limits.');
    END IF;

    -- Calculate payout amount per period
    v_payout_per_period := (p_amount * v_plan.roi_percentage) / 100.0;
    v_next_payout := NOW() + (v_plan.payout_interval_hours || ' hours')::INTERVAL;
    v_trx_ref := 'INV-' || upper(substring(md5(random()::text) from 1 for 10));

    -- 1. Deduct Deposit Wallet
    UPDATE public.profiles
    SET deposit_wallet = deposit_wallet - p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- 2. Create User Investment
    INSERT INTO public.user_investments (
        user_id, plan_id, invest_amount, payout_per_period,
        total_payout_periods, paid_periods, status, next_payout_at
    ) VALUES (
        p_user_id, p_plan_id, p_amount, v_payout_per_period,
        v_plan.total_payout_periods, 0, 'active', v_next_payout
    ) RETURNING id INTO v_investment_id;

    -- 3. Record Transaction Ledger
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        p_user_id, 'invest', 'deposit_wallet', p_amount, 0.00,
        (v_deposit_balance - p_amount), 'Investment in ' || v_plan.name, v_trx_ref
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Investment created successfully!',
        'investment_id', v_investment_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- B. APPROVE DEPOSIT RPC (Atomically credit deposit wallet, process referrals, and update deposit status)
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


-- G. REQUEST WITHDRAWAL RPC (Atomically holds balance and creates withdrawal request)
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
        user_id, amount, charge, net_amount, method_name, account_details, status
    ) VALUES (
        p_user_id, p_amount, v_charge, v_net_amount, p_method_name, p_account_details, 'pending'
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



-- C. REJECT DEPOSIT RPC
CREATE OR REPLACE FUNCTION public.reject_deposit_rpc(
    p_deposit_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Rejected by admin'
) RETURNS JSONB AS $$
DECLARE
    v_deposit RECORD;
BEGIN
    SELECT * INTO v_deposit FROM public.deposits WHERE id = p_deposit_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Deposit record not found.');
    END IF;

    IF v_deposit.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Deposit request is already processed.');
    END IF;

    UPDATE public.deposits
    SET status = 'rejected',
        admin_feedback = p_feedback,
        updated_at = NOW()
    WHERE id = p_deposit_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_deposit.user_id, 'Deposit Rejected', 'Your deposit request of $' || v_deposit.amount || ' was rejected: ' || p_feedback, 'danger');

    RETURN jsonb_build_object('success', true, 'message', 'Deposit rejected successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- D. APPROVE WITHDRAWAL RPC
CREATE OR REPLACE FUNCTION public.approve_withdrawal_rpc(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Withdrawal processed successfully'
) RETURNS JSONB AS $$
DECLARE
    v_withdraw RECORD;
BEGIN
    SELECT * INTO v_withdraw FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal record not found.');
    END IF;

    IF v_withdraw.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal request is already processed.');
    END IF;

    UPDATE public.withdrawals
    SET status = 'approved',
        admin_feedback = p_feedback,
        updated_at = NOW()
    WHERE id = p_withdrawal_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_withdraw.user_id, 'Withdrawal Approved', 'Your withdrawal request of $' || v_withdraw.net_amount || ' via ' || v_withdraw.method_name || ' has been processed.', 'success');

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal approved successfully.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- E. REJECT WITHDRAWAL RPC (Refunds interest wallet balance)
CREATE OR REPLACE FUNCTION public.reject_withdrawal_rpc(
    p_withdrawal_id UUID,
    p_admin_id UUID,
    p_feedback TEXT DEFAULT 'Rejected by admin'
) RETURNS JSONB AS $$
DECLARE
    v_withdraw RECORD;
    v_new_balance NUMERIC;
    v_trx_ref TEXT;
BEGIN
    SELECT * INTO v_withdraw FROM public.withdrawals WHERE id = p_withdrawal_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal record not found.');
    END IF;

    IF v_withdraw.status != 'pending' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Withdrawal request is already processed.');
    END IF;

    -- Update withdrawal status
    UPDATE public.withdrawals
    SET status = 'rejected',
        admin_feedback = p_feedback,
        updated_at = NOW()
    WHERE id = p_withdrawal_id;

    -- Refund interest_wallet
    UPDATE public.profiles
    SET interest_wallet = interest_wallet + v_withdraw.amount,
        updated_at = NOW()
    WHERE id = v_withdraw.user_id
    RETURNING interest_wallet INTO v_new_balance;

    -- Record transaction refund ledger
    v_trx_ref := 'REF-' || upper(substring(md5(random()::text) from 1 for 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        v_withdraw.user_id, 'admin_adjustment', 'interest_wallet', v_withdraw.amount, 0.00,
        v_new_balance, 'Withdrawal rejected & refunded: ' || p_feedback, v_trx_ref
    );

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_withdraw.user_id, 'Withdrawal Rejected', 'Your withdrawal request of $' || v_withdraw.amount || ' was rejected and refunded: ' || p_feedback, 'danger');

    RETURN jsonb_build_object('success', true, 'message', 'Withdrawal rejected and balance refunded.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- F. ADMIN ADJUST BALANCE RPC
CREATE OR REPLACE FUNCTION public.admin_adjust_balance_rpc(
    p_user_id UUID,
    p_target_wallet wallet_type,
    p_action TEXT, -- 'add' or 'subtract'
    p_amount NUMERIC,
    p_remark TEXT DEFAULT 'Admin balance adjustment'
) RETURNS JSONB AS $$
DECLARE
    v_current_bal NUMERIC;
    v_new_bal NUMERIC;
    v_trx_ref TEXT;
BEGIN
    IF p_target_wallet = 'deposit_wallet' THEN
        SELECT deposit_wallet INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    ELSE
        SELECT interest_wallet INTO v_current_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
    END IF;

    IF v_current_bal IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'User profile not found.');
    END IF;

    IF p_action = 'subtract' AND v_current_bal < p_amount THEN
        RETURN jsonb_build_object('success', false, 'message', 'User balance is insufficient for subtraction.');
    END IF;

    IF p_action = 'add' THEN
        v_new_bal := v_current_bal + p_amount;
    ELSE
        v_new_bal := v_current_bal - p_amount;
    END IF;

    IF p_target_wallet = 'deposit_wallet' THEN
        UPDATE public.profiles SET deposit_wallet = v_new_bal, updated_at = NOW() WHERE id = p_user_id;
    ELSE
        UPDATE public.profiles SET interest_wallet = v_new_bal, updated_at = NOW() WHERE id = p_user_id;
    END IF;

    v_trx_ref := 'ADM-' || upper(substring(md5(random()::text) from 1 for 10));
    INSERT INTO public.transactions (
        user_id, type, wallet, amount, charge, post_balance, description, trx_ref
    ) VALUES (
        p_user_id, 'admin_adjustment', p_target_wallet, p_amount, 0.00,
        v_new_bal, p_remark, v_trx_ref
    );

    RETURN jsonb_build_object('success', true, 'message', 'Balance updated successfully.', 'new_balance', v_new_bal);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ==============================================================================
-- RLS POLICIES FOR NEW TABLES
-- ==============================================================================
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdraw_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Public View Policies
CREATE POLICY "Public site settings read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public gateways read" ON public.gateways FOR SELECT USING (status = true);
CREATE POLICY "Public withdraw methods read" ON public.withdraw_methods FOR SELECT USING (status = true);
CREATE POLICY "Public referral levels read" ON public.referral_levels FOR SELECT USING (is_active = true);
CREATE POLICY "Public blogs read" ON public.blogs FOR SELECT USING (is_published = true);
CREATE POLICY "Public blog categories read" ON public.blog_categories FOR SELECT USING (true);

-- User Policies
CREATE POLICY "Users view own kyc requests" ON public.kyc_requests FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users create kyc requests" ON public.kyc_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Admin Full Access Policies
CREATE POLICY "Admins full access site settings" ON public.site_settings FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access gateways" ON public.gateways FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access withdraw methods" ON public.withdraw_methods FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access referral levels" ON public.referral_levels FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access kyc requests" ON public.kyc_requests FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access kyc settings" ON public.kyc_settings FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access blogs" ON public.blogs FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Admins full access blog categories" ON public.blog_categories FOR ALL USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
