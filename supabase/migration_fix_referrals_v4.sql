-- ==============================================================================
-- ALPHA ASSETS - REFERRAL LINKING & DOWNLINE RLS FIX MIGRATION (v4)
-- File: supabase/migration_fix_referrals_v4.sql
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Update handle_new_user() trigger function to link referred_by on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_referrer_id UUID := NULL;
    v_ref_code TEXT;
BEGIN
    -- Extract referred_by_code from raw_user_meta_data
    v_ref_code := NEW.raw_user_meta_data->>'referred_by_code';

    IF v_ref_code IS NOT NULL AND v_ref_code != '' THEN
        -- Find referrer profile ID from referral_code
        SELECT id INTO v_referrer_id 
        FROM public.profiles 
        WHERE referral_code = v_ref_code 
        LIMIT 1;
    END IF;

    -- Create profile with referred_by foreign key set
    INSERT INTO public.profiles (id, email, full_name, username, avatar_url, role, referred_by)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substring(md5(random()::text) from 1 for 4)),
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        v_referrer_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Update Row Level Security (RLS) Policy on profiles
-- Allows users to view their own profile, profiles of users they referred, or admins
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id
        OR auth.uid() = referred_by
        OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );


-- 3. Retroactive Backfill for existing users who registered with a referral code
UPDATE public.profiles p
SET referred_by = r.id
FROM auth.users u
JOIN public.profiles r ON r.referral_code = (u.raw_user_meta_data->>'referred_by_code')
WHERE p.id = u.id
  AND p.referred_by IS NULL
  AND u.raw_user_meta_data->>'referred_by_code' IS NOT NULL;
