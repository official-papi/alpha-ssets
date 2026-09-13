-- ==============================================================================
-- ALPHA ASSETS - RLS POLICY FIX FOR ADMIN IMPERSONATION (v8)
-- File: supabase/migration_fix_impersonation_rls_v8.sql
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Ensure public.is_admin() helper is up-to-date and non-recursive
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    false
  ) OR (
    COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
  ) OR (
    COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;

-- 2. Deposits Table: Allow both own user AND admin to create deposits
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users and admins can create deposits" ON public.deposits;
CREATE POLICY "Users and admins can create deposits" ON public.deposits
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Users can view own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Users and admins can view deposits" ON public.deposits;
CREATE POLICY "Users and admins can view deposits" ON public.deposits
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 3. Withdrawals Table: Allow both own user AND admin to create withdrawals
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users and admins can create withdrawals" ON public.withdrawals;
CREATE POLICY "Users and admins can create withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
DROP POLICY IF EXISTS "Users and admins can view withdrawals" ON public.withdrawals;
CREATE POLICY "Users and admins can view withdrawals" ON public.withdrawals
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 4. User Investments Table: Allow both own user AND admin to insert investments
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users and admins can insert investments" ON public.user_investments;
CREATE POLICY "Users and admins can insert investments" ON public.user_investments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Users can view own investments" ON public.user_investments;
DROP POLICY IF EXISTS "Users and admins can view investments" ON public.user_investments;
CREATE POLICY "Users and admins can view investments" ON public.user_investments
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 5. KYC Requests Table: Allow both own user AND admin to create KYC requests
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users create kyc requests" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users and admins can create kyc requests" ON public.kyc_requests;
CREATE POLICY "Users and admins can create kyc requests" ON public.kyc_requests
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

DROP POLICY IF EXISTS "Users view own kyc requests" ON public.kyc_requests;
DROP POLICY IF EXISTS "Users and admins can view kyc requests" ON public.kyc_requests;
CREATE POLICY "Users and admins can view kyc requests" ON public.kyc_requests
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

-- 6. Wallet Transactions Table (if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallet_transactions') THEN
        ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users view own wallet transactions" ON public.wallet_transactions;
        DROP POLICY IF EXISTS "Users and admins view wallet transactions" ON public.wallet_transactions;
        CREATE POLICY "Users and admins view wallet transactions" ON public.wallet_transactions
            FOR SELECT USING (
                auth.uid() = user_id
                OR public.is_admin()
                OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            );

        DROP POLICY IF EXISTS "Admins insert wallet transactions" ON public.wallet_transactions;
        DROP POLICY IF EXISTS "Users and admins insert wallet transactions" ON public.wallet_transactions;
        CREATE POLICY "Users and admins insert wallet transactions" ON public.wallet_transactions
            FOR INSERT WITH CHECK (
                auth.uid() = user_id
                OR public.is_admin()
                OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
            );
    END IF;
END $$;
