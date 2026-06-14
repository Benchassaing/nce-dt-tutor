-- ============================================
-- SUPABASE STORAGE SETUP FOR NCE DT TUTOR
-- Run this in Supabase SQL Editor (Storage section)
-- ============================================

-- 1. Create storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'nce-uploads',
  'nce-uploads',
  true,  -- public bucket for easy access
  52428800,  -- 50 MB limit
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Create storage policies

-- Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nce-uploads'
  AND auth.role() = 'authenticated'
);

-- Policy: Allow public read access (for serving PDFs)
CREATE POLICY "Public read access for PDFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'nce-uploads');

-- Policy: Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'nce-uploads'
  AND auth.uid() = owner
);

-- Policy: Allow admins to manage all
CREATE POLICY "Admins full access"
ON storage.objects FOR ALL
USING (
  bucket_id = 'nce-uploads'
  AND auth.jwt() ->> 'role' = 'admin'
);

-- ============================================
-- ALTERNATIVE: Using Supabase Dashboard (Recommended)
-- ============================================
/*
1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: nce-uploads
4. Public bucket: ✓ Yes
5. File size limit: 50 MB
6. Allowed MIME types: application/pdf
7. Click "Create"

Then create policies:
1. Go to Policies tab in Storage
2. Create policy: "Upload" → INSERT → authenticated users
3. Create policy: "Read" → SELECT → public
4. Create policy: "Delete" → DELETE → authenticated users (owner check)
*/

-- ============================================
-- VERIFICATION
-- ============================================
-- Check bucket exists:
-- SELECT * FROM storage.buckets WHERE id = 'nce-uploads';

-- Check policies:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects';