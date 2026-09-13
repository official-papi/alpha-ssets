-- ==============================================================================
-- ALPHA ASSETS - UNIFIED ADMIN ROLES & ROW LEVEL SECURITY (RLS) FIX (v7)
-- File: supabase/migration_fix_admin_roles_and_rls_v7.sql
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Create a non-recursive, Security Definer function to check admin role
-- This checks BOTH public.profiles.role = 'admin' AND user_metadata / app_metadata.
-- Because it is SECURITY DEFINER, it runs with superuser privileges and NEVER triggers
-- infinite recursion on the public.profiles table.
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

-- Grant execution to authenticated & anon roles
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon, service_role;


-- 2. Create RPC function for safely promoting/demoting staff with full metadata sync
CREATE OR REPLACE FUNCTION public.admin_set_user_role_rpc(
    p_user_id UUID,
    p_role public.user_role
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Verify that the caller is an admin
    IF NOT public.is_admin() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Unauthorized: Only administrators can manage roles.');
    END IF;

    -- Update profiles table
    UPDATE public.profiles
    SET role = p_role, updated_at = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Target user profile not found.');
    END IF;

    -- Synchronize auth.users metadata so JWT claims and session tokens match
    UPDATE auth.users
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(p_role::text)
    ),
    raw_app_meta_data = jsonb_set(
        COALESCE(raw_app_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(p_role::text)
    )
    WHERE id = p_user_id;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'User role successfully updated to ' || p_role::text
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_user_role_rpc(UUID, public.user_role) TO authenticated;


-- 3. Automatic trigger to keep auth.users metadata in sync if profiles.role is modified directly
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_auth()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        UPDATE auth.users
        SET raw_user_meta_data = jsonb_set(
            COALESCE(raw_user_meta_data, '{}'::jsonb),
            '{role}',
            to_jsonb(NEW.role::text)
        ),
        raw_app_meta_data = jsonb_set(
            COALESCE(raw_app_meta_data, '{}'::jsonb),
            '{role}',
            to_jsonb(NEW.role::text)
        )
        WHERE id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_profile_role_to_auth ON public.profiles;
CREATE TRIGGER trg_sync_profile_role_to_auth
    AFTER UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role_to_auth();


-- 4. Update profile sensitive columns protection trigger to allow admin actions
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- If trigger is invoked by standard authenticated user direct API update
    IF (current_user = 'authenticated' OR current_user = 'anon') THEN
        -- Allow admins to update or bypass
        IF NOT public.is_admin() THEN
            IF OLD.deposit_wallet IS DISTINCT FROM NEW.deposit_wallet OR
               OLD.interest_wallet IS DISTINCT FROM NEW.interest_wallet OR
               OLD.role IS DISTINCT FROM NEW.role THEN
                RAISE EXCEPTION 'Unauthorized attempt to modify financial balances or roles.';
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_sensitive_columns ON public.profiles;
CREATE TRIGGER trg_protect_profile_sensitive_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_sensitive_columns();


-- 5. Backfill all existing admin accounts so their auth.users metadata matches
UPDATE auth.users u
SET raw_user_meta_data = jsonb_set(
    COALESCE(u.raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
),
raw_app_meta_data = jsonb_set(
    COALESCE(u.raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
)
FROM public.profiles p
WHERE p.id = u.id AND p.role = 'admin';


-- ══════════════════════════════════════════════════════════════════════════════
-- 6. UNIFIED RLS POLICIES ACROSS ALL TABLES (Using public.is_admin())
-- ══════════════════════════════════════════════════════════════════════════════

-- Profiles Table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR auth.uid() = referred_by
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users and admins can update profile" ON public.profiles;
CREATE POLICY "Users and admins can update profile" ON public.profiles
    FOR UPDATE USING (
        auth.uid() = id
        OR public.is_admin()
    );

-- Deposits Table
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own deposits" ON public.deposits;
CREATE POLICY "Users can view own deposits" ON public.deposits
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can create deposits" ON public.deposits;
CREATE POLICY "Users can create deposits" ON public.deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update deposits" ON public.deposits;
CREATE POLICY "Admins can update deposits" ON public.deposits
    FOR UPDATE USING (
        public.is_admin()
        OR auth.uid() = user_id
    );

-- Withdrawals Table
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" ON public.withdrawals
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can create withdrawals" ON public.withdrawals;
CREATE POLICY "Users can create withdrawals" ON public.withdrawals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update withdrawals" ON public.withdrawals;
CREATE POLICY "Admins can update withdrawals" ON public.withdrawals
    FOR UPDATE USING (
        public.is_admin()
    );

-- Transactions Table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Admins can manage transactions" ON public.transactions;
CREATE POLICY "Admins can manage transactions" ON public.transactions
    FOR ALL USING (
        public.is_admin()
    );

-- Wallet Transactions Table (if present)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wallet_transactions') THEN
        ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users view own wallet transactions" ON public.wallet_transactions;
        CREATE POLICY "Users view own wallet transactions" ON public.wallet_transactions
            FOR SELECT USING (
                auth.uid() = user_id
                OR public.is_admin()
            );

        DROP POLICY IF EXISTS "Admins insert wallet transactions" ON public.wallet_transactions;
        CREATE POLICY "Admins insert wallet transactions" ON public.wallet_transactions
            FOR ALL USING (
                auth.uid() = user_id
                OR public.is_admin()
            );
    END IF;
END $$;

-- User Investments Table
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own investments" ON public.user_investments;
CREATE POLICY "Users can view own investments" ON public.user_investments
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can insert own investments" ON public.user_investments;
CREATE POLICY "Users can insert own investments" ON public.user_investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage user_investments" ON public.user_investments;
CREATE POLICY "Admins can manage user_investments" ON public.user_investments
    FOR ALL USING (
        public.is_admin()
    );

-- Investment Plans Table
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public plans are viewable by everyone" ON public.investment_plans;
CREATE POLICY "Public plans are viewable by everyone" ON public.investment_plans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage investment_plans" ON public.investment_plans;
CREATE POLICY "Admins can manage investment_plans" ON public.investment_plans
    FOR ALL USING (
        public.is_admin()
    ) WITH CHECK (
        public.is_admin()
    );

-- KYC Requests Table
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own kyc requests" ON public.kyc_requests;
CREATE POLICY "Users view own kyc requests" ON public.kyc_requests
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users create kyc requests" ON public.kyc_requests;
CREATE POLICY "Users create kyc requests" ON public.kyc_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins full access kyc requests" ON public.kyc_requests;
CREATE POLICY "Admins full access kyc requests" ON public.kyc_requests
    FOR ALL USING (
        public.is_admin()
    );

-- KYC Settings Table
ALTER TABLE public.kyc_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access kyc settings" ON public.kyc_settings;
CREATE POLICY "Admins full access kyc settings" ON public.kyc_settings
    FOR ALL USING (
        public.is_admin()
    );

-- Site Settings Table
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public site settings read" ON public.site_settings;
CREATE POLICY "Public site settings read" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins full access site settings" ON public.site_settings;
CREATE POLICY "Admins full access site settings" ON public.site_settings
    FOR ALL USING (
        public.is_admin()
    );

-- Gateways Table
ALTER TABLE public.gateways ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public gateways read" ON public.gateways;
CREATE POLICY "Public gateways read" ON public.gateways FOR SELECT USING (status = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access gateways" ON public.gateways;
CREATE POLICY "Admins full access gateways" ON public.gateways
    FOR ALL USING (
        public.is_admin()
    );

-- Withdraw Methods Table
ALTER TABLE public.withdraw_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public withdraw methods read" ON public.withdraw_methods;
CREATE POLICY "Public withdraw methods read" ON public.withdraw_methods FOR SELECT USING (status = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access withdraw methods" ON public.withdraw_methods;
CREATE POLICY "Admins full access withdraw methods" ON public.withdraw_methods
    FOR ALL USING (
        public.is_admin()
    );

-- Referral Levels Table
ALTER TABLE public.referral_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public referral levels read" ON public.referral_levels;
CREATE POLICY "Public referral levels read" ON public.referral_levels FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access referral levels" ON public.referral_levels;
CREATE POLICY "Admins full access referral levels" ON public.referral_levels
    FOR ALL USING (
        public.is_admin()
    );

-- Referral Commissions Table
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own referral commissions" ON public.referral_commissions;
CREATE POLICY "Users can view own referral commissions" ON public.referral_commissions
    FOR SELECT USING (
        auth.uid() = referrer_id
        OR public.is_admin()
    );

-- Blogs & Categories Table
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public blogs read" ON public.blogs;
CREATE POLICY "Public blogs read" ON public.blogs FOR SELECT USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access blogs" ON public.blogs;
CREATE POLICY "Admins full access blogs" ON public.blogs
    FOR ALL USING (
        public.is_admin()
    );

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public blog categories read" ON public.blog_categories;
CREATE POLICY "Public blog categories read" ON public.blog_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins full access blog categories" ON public.blog_categories;
CREATE POLICY "Admins full access blog categories" ON public.blog_categories
    FOR ALL USING (
        public.is_admin()
    );

-- Notifications Table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" ON public.notifications
    FOR SELECT USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications;
CREATE POLICY "Users update own notifications" ON public.notifications
    FOR UPDATE USING (
        auth.uid() = user_id
        OR public.is_admin()
    );
