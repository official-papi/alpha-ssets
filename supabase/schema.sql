-- ==============================================================================
-- HYIP MAX INVESTMENT PLATFORM - SUPABASE POSTGRESQL DATABASE SCHEMA
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('deposit', 'withdraw', 'invest', 'interest_payout', 'referral_commission', 'admin_adjustment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE wallet_type AS ENUM ('deposit_wallet', 'interest_wallet');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE investment_status AS ENUM ('active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    username TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    
    -- Wallets & Balances
    deposit_wallet NUMERIC(15, 2) DEFAULT 0.00 CHECK (deposit_wallet >= 0),
    interest_wallet NUMERIC(15, 2) DEFAULT 0.00 CHECK (interest_wallet >= 0),
    
    -- Referral System
    referral_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
    referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Status & Metadata
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INVESTMENT PLANS TABLE
CREATE TABLE IF NOT EXISTS public.investment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    badge TEXT DEFAULT 'Popular',
    description TEXT,
    min_amount NUMERIC(15, 2) NOT NULL DEFAULT 10.00,
    max_amount NUMERIC(15, 2) NOT NULL DEFAULT 1000.00,
    fixed_amount NUMERIC(15, 2) DEFAULT NULL, -- NULL means range min-max
    roi_percentage NUMERIC(5, 2) NOT NULL, -- e.g., 5.5 for 5.5%
    payout_interval_hours INT NOT NULL DEFAULT 24, -- Hourly (1) or Daily (24)
    total_payout_periods INT NOT NULL, -- e.g., 30 times
    capital_back BOOLEAN DEFAULT true, -- Whether principal is returned at completion
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.investment_plans(id) ON DELETE RESTRICT,
    invest_amount NUMERIC(15, 2) NOT NULL,
    payout_per_period NUMERIC(15, 2) NOT NULL,
    total_payout_periods INT NOT NULL,
    paid_periods INT DEFAULT 0,
    total_profit_earned NUMERIC(15, 2) DEFAULT 0.00,
    status investment_status DEFAULT 'active',
    next_payout_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    wallet wallet_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    charge NUMERIC(15, 2) DEFAULT 0.00,
    post_balance NUMERIC(15, 2) NOT NULL,
    description TEXT NOT NULL,
    trx_ref TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DEPOSITS TABLE
CREATE TABLE IF NOT EXISTS public.deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    charge NUMERIC(15, 2) DEFAULT 0.00,
    final_amount NUMERIC(15, 2) NOT NULL,
    gateway_name TEXT NOT NULL,
    trx_id TEXT UNIQUE NOT NULL,
    proof_url TEXT,
    status request_status DEFAULT 'pending',
    admin_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WITHDRAWALS TABLE
CREATE TABLE IF NOT EXISTS public.withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    charge NUMERIC(15, 2) DEFAULT 0.00,
    net_amount NUMERIC(15, 2) NOT NULL,
    method_name TEXT NOT NULL,
    account_details JSONB NOT NULL,
    status request_status DEFAULT 'pending',
    admin_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. REFERRAL COMMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.referral_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    level INT DEFAULT 1,
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- SEED INITIAL INVESTMENT PLANS
-- ==============================================================================
INSERT INTO public.investment_plans (name, badge, description, min_amount, max_amount, roi_percentage, payout_interval_hours, total_payout_periods, capital_back, is_active)
VALUES 
('Regular Package', 'Starter Tier', '2.5% weekly return with principal returned at maturity.', 500.00, 2000.00, 2.50, 168, 8, true, true),
('Silver Package', 'Growth Tier', '4.0% weekly return with multi-tier affiliate earnings.', 3000.00, 5000.00, 4.00, 168, 12, true, true),
('Gold Package', 'Most Popular', '6.0% weekly return with dedicated account management.', 10000.00, 20000.00, 6.00, 168, 16, true, true),
('VIP Package', 'High Yield', '10.0% weekly return with custom vault storage & 24/7 support.', 50000.00, 200000.00, 10.00, 168, 24, true, true),
('Ultimate Package', 'Executive Tier', '12.0% weekly return with institutional cold custody & private wealth advisory.', 500000.00, 3000000.00, 12.00, 168, 36, true, true),
('Elites Package', 'Exclusive Tier', '15.5% weekly return. In elite packages you can get a loan from the company to buy a house and pay in installments.', 5000000.00, 20000000.00, 15.50, 168, 52, true, true)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substring(md5(random()::text) from 1 for 4)),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- Investment Plans: Anyone can view active plans; Admins can manage all
DROP POLICY IF EXISTS "Public plans are viewable by everyone" ON public.investment_plans;
CREATE POLICY "Public plans are viewable by everyone" ON public.investment_plans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage investment_plans" ON public.investment_plans;
CREATE POLICY "Admins can manage investment_plans" ON public.investment_plans
    FOR ALL USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    ) WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Profiles: Users can view and update their own profile; Admins view all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Investments: Users view their own investments
DROP POLICY IF EXISTS "Users can view own investments" ON public.user_investments;
CREATE POLICY "Users can view own investments" ON public.user_investments
    FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can insert own investments" ON public.user_investments;
CREATE POLICY "Users can insert own investments" ON public.user_investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: Users view their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Deposits & Withdrawals: Users view and submit requests
DROP POLICY IF EXISTS "Users can view own deposits" ON public.deposits;
CREATE POLICY "Users can view own deposits" ON public.deposits
    FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can create deposits" ON public.deposits;
CREATE POLICY "Users can create deposits" ON public.deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
    FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Users can create withdrawals" ON public.withdrawals;
CREATE POLICY "Users can create withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);
