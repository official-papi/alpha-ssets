-- ==============================================================================
-- ALPHA ASSETS - RESET PLANS TO BASIC & PREMIUM ONLY (v10)
-- File: supabase/migration_reset_plans_v10_basic_premium.sql
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- STEP 1: Delete past test investments referencing old plan IDs to satisfy Foreign Key constraints
DELETE FROM public.user_investments;

-- STEP 2: Clear old investment plans
DELETE FROM public.investment_plans;

-- STEP 3: Seed ONLY the 2 Official Investment Packages: Basic and Premium
INSERT INTO public.investment_plans 
(name, badge, description, min_amount, max_amount, roi_percentage, payout_interval_hours, total_payout_periods, capital_back, is_active)
VALUES 
(
  'Basic Plan', 
  'Starter Tier', 
  'Automated AI quantitative trading with smart multi-sig escrow protection, 3.5% weekly returns, and 100% principal returned at maturity.', 
  200.00, 
  4999.00, 
  3.50, 
  168, 
  8, 
  true, 
  true
),
(
  'Premium Plan', 
  'Most Popular', 
  'High-frequency AI priority execution, segregated institutional escrow custody, 7.0% weekly returns, and full principal returned at maturity.', 
  5000.00, 
  1000000.00, 
  7.00, 
  168, 
  16, 
  true, 
  true
);
