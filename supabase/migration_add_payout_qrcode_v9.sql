-- ==============================================================================
-- MIGRATION V9: USER PAYOUT QR CODES & WITHDRAWAL DESTINATION ENHANCEMENTS
-- ==============================================================================

-- 1. Add payout settings and QR code columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS payout_qr_code_url TEXT,
  ADD COLUMN IF NOT EXISTS payout_address TEXT,
  ADD COLUMN IF NOT EXISTS payout_method TEXT;

-- 2. Add explicit qr_code_url column to withdrawals table for fast lookup
ALTER TABLE public.withdrawals 
  ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- 3. Create index for withdrawals with QR code
CREATE INDEX IF NOT EXISTS idx_withdrawals_qr_code ON public.withdrawals(user_id) WHERE qr_code_url IS NOT NULL;

-- 4. Storage Bucket Setup: payout-qrcodes
-- If storage.buckets exists, ensure the bucket is created
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payout-qrcodes',
    'payout-qrcodes',
    true,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- 5. Storage RLS Policies for payout-qrcodes
DROP POLICY IF EXISTS "Public can view payout QR codes" ON storage.objects;
CREATE POLICY "Public can view payout QR codes" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'payout-qrcodes');

DROP POLICY IF EXISTS "Authenticated users can upload payout QR codes" ON storage.objects;
CREATE POLICY "Authenticated users can upload payout QR codes" ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'payout-qrcodes' 
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Users can update own payout QR codes" ON storage.objects;
CREATE POLICY "Users can update own payout QR codes" ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'payout-qrcodes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

DROP POLICY IF EXISTS "Users can delete own payout QR codes" ON storage.objects;
CREATE POLICY "Users can delete own payout QR codes" ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'payout-qrcodes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
