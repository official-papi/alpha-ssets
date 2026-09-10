-- ==============================================================================
-- ALPHA ASSETS - 10-MINUTE TEST PLAN & DYNAMIC PAYOUT ENGINE (v6)
-- File: supabase/migration_add_10min_test_plan_v6.sql
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Update process_investment_rpc to dynamically use payout_interval_hours
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
    v_interval_hours NUMERIC := 24;
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
        v_interval_hours := COALESCE(v_plan.payout_interval_hours, 24);
    ELSE
        SELECT id INTO v_target_plan_id FROM public.investment_plans WHERE is_active = true LIMIT 1;
        v_daily_rate := 0.035;
        v_repeat_time := 30;
        v_interval_hours := 24;
    END IF;

    v_payout_per_period := p_amount * v_daily_rate;
    v_next_payout := NOW() + (v_interval_hours * INTERVAL '1 hour');

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
        v_repeat_time, 0, v_next_payout, 'active'::investment_status
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


-- 1. Ensure next_payout_at column permits nulls or retains timestamp on completion
ALTER TABLE public.user_investments ALTER COLUMN next_payout_at DROP NOT NULL;
UPDATE public.user_investments SET next_payout_at = NOW() WHERE next_payout_at IS NULL;

-- 2. Update process_investment_payouts_rpc to dynamically use plan interval with enum cast
CREATE OR REPLACE FUNCTION public.process_investment_payouts_rpc()
RETURNS JSONB AS $$
DECLARE
    v_inv RECORD;
    v_count INTEGER := 0;
    v_new_bal NUMERIC;
    v_trx_ref TEXT;
    v_new_paid INTEGER;
    v_is_completed BOOLEAN;
    v_interval NUMERIC;
BEGIN
    FOR v_inv IN
        SELECT ui.*, p.interest_wallet, ip.payout_interval_hours, ip.capital_back
        FROM public.user_investments ui
        JOIN public.profiles p ON p.id = ui.user_id
        LEFT JOIN public.investment_plans ip ON ip.id = ui.plan_id
        WHERE ui.status = 'active'
          AND ui.next_payout_at <= NOW()
          AND ui.paid_periods < ui.total_payout_periods
        FOR UPDATE OF ui
    LOOP
        v_new_paid := v_inv.paid_periods + 1;
        v_is_completed := (v_new_paid >= v_inv.total_payout_periods);
        v_interval := COALESCE(v_inv.payout_interval_hours, 24);

        -- Credit user interest wallet
        UPDATE public.profiles
        SET interest_wallet = interest_wallet + v_inv.payout_per_period,
            updated_at = NOW()
        WHERE id = v_inv.user_id
        RETURNING interest_wallet INTO v_new_bal;

        -- Update investment period counter & next payout timestamp
        UPDATE public.user_investments
        SET paid_periods = v_new_paid,
            total_profit_earned = COALESCE(total_profit_earned, 0) + v_inv.payout_per_period,
            next_payout_at = CASE WHEN v_is_completed THEN NOW() ELSE NOW() + (v_interval * INTERVAL '1 hour') END,
            status = CASE WHEN v_is_completed THEN 'completed'::investment_status ELSE 'active'::investment_status END,
            updated_at = NOW()
        WHERE id = v_inv.id;

        -- Log interest payout transaction ledger
        v_trx_ref := 'ROI-' || upper(substring(md5(random()::text) from 1 for 10));
        INSERT INTO public.transactions (
            user_id, type, wallet, amount, charge, post_balance, description, trx_ref
        ) VALUES (
            v_inv.user_id, 'interest_payout'::transaction_type, 'interest_wallet', v_inv.payout_per_period, 0.00,
            v_new_bal, 'ROI payout period ' || v_new_paid || '/' || v_inv.total_payout_periods, v_trx_ref
        );

        -- Return capital if investment plan completed and capital_back enabled
        IF v_is_completed AND COALESCE(v_inv.capital_back, true) THEN
            UPDATE public.profiles
            SET deposit_wallet = deposit_wallet + v_inv.invest_amount,
                updated_at = NOW()
            WHERE id = v_inv.user_id
            RETURNING deposit_wallet INTO v_new_bal;

            v_trx_ref := 'CAP-' || upper(substring(md5(random()::text) from 1 for 10));
            INSERT INTO public.transactions (
                user_id, type, wallet, amount, charge, post_balance, description, trx_ref
            ) VALUES (
                v_inv.user_id, 'admin_adjustment'::transaction_type, 'deposit_wallet', v_inv.invest_amount, 0.00,
                v_new_bal, 'Capital returned upon plan maturity completion', v_trx_ref
            );
        END IF;

        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Processed ' || v_count || ' ROI investment payouts.',
        'payouts_processed', v_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Upsert the 10-Minute High Capital Test Package (0.1667 hours = 10 mins)
UPDATE public.investment_plans 
SET payout_interval_hours = 0.1667,
    roi_percentage = 10.00,
    min_amount = 100000.00,
    max_amount = 100000000.00,
    total_payout_periods = 6,
    is_active = true
WHERE name = '10-Minute Test Plan';

INSERT INTO public.investment_plans 
(name, badge, description, min_amount, max_amount, roi_percentage, payout_interval_hours, total_payout_periods, capital_back, is_active)
SELECT 
  '10-Minute Test Plan', 
  '⚡ Test Mode', 
  'Temporary 10-minute payout testing package requiring high capital ($100,000+).', 
  100000.00, 
  100000000.00, 
  10.00, 
  0.1667,
  6,
  true, 
  true
WHERE NOT EXISTS (SELECT 1 FROM public.investment_plans WHERE name = '10-Minute Test Plan');


-- 4. IMMEDIATE RELEASE FOR ACTIVE TEST INVESTMENTS:
UPDATE public.user_investments
SET next_payout_at = NOW() - INTERVAL '1 minute'
WHERE status = 'active';

SELECT public.process_investment_payouts_rpc();
