-- ==============================================================================
-- ALPHA ASSETS - SAFE RESET & SEED 6 OFFICIAL INVESTMENT PACKAGES (v5)
-- File: supabase/migration_reset_plans_v5.sql
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- STEP 1: Delete past test investments referencing old plan IDs to satisfy Foreign Key constraints
DELETE FROM public.user_investments;

-- STEP 2: Clear old investment plans
DELETE FROM public.investment_plans;

-- STEP 3: Seed the 6 Official Investment Packages
INSERT INTO public.investment_plans 
(name, badge, description, min_amount, max_amount, roi_percentage, payout_interval_hours, total_payout_periods, capital_back, is_active)
VALUES 
('Regular Package', 'Starter Tier', '2.5% weekly return with principal returned at maturity.', 500.00, 2000.00, 2.50, 168, 8, true, true),
('Silver Package', 'Growth Tier', '4.0% weekly return with multi-tier affiliate earnings.', 3000.00, 5000.00, 4.00, 168, 12, true, true),
('Gold Package', 'Most Popular', '6.0% weekly return with dedicated account management.', 10000.00, 20000.00, 6.00, 168, 16, true, true),
('VIP Package', 'High Yield', '10.0% weekly return with custom vault storage & 24/7 support.', 50000.00, 200000.00, 10.00, 168, 24, true, true),
('Ultimate Package', 'Executive Tier', '12.0% weekly return with institutional cold custody & private wealth advisory.', 500000.00, 3000000.00, 12.00, 168, 36, true, true),
('Elites Package', 'Exclusive Tier', '15.5% weekly return. In elite packages you can get a loan from the company to buy a house and pay in installments.', 5000000.00, 20000000.00, 15.50, 168, 52, true, true);
