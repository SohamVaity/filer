-- Supabase Table Setup for Filer
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new

-- 1. Create the uploaded_files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  original_files TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id ON uploaded_files(user_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_created_at ON uploaded_files(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- 4. Create policy: Users can only view their own files
CREATE POLICY "Users can view own files"
  ON uploaded_files
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Create policy: Users can insert their own files
CREATE POLICY "Users can insert own files"
  ON uploaded_files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Create policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
  ON uploaded_files
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create storage bucket for user files (run in SQL or create via dashboard)
-- Go to Storage -> Create bucket named "user-files" with Public = true
-- Or run this if you have permissions:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('user-files', 'user-files', true);

-- 8. Storage policies for user-files bucket
CREATE POLICY "Users can upload to their own folder"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-files');

CREATE POLICY "Users can delete their own files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'user-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
