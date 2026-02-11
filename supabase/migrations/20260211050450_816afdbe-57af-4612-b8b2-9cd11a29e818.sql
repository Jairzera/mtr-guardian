
-- Create storage bucket for MTR documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('mtr_documents', 'mtr_documents', true);

-- Policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'mtr_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: anyone can read (public bucket)
CREATE POLICY "Public read access to mtr_documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'mtr_documents');

-- Policy: users can delete their own documents
CREATE POLICY "Users can delete their own documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'mtr_documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
