-- Create licenses table
CREATE TABLE public.licenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  managed_company_id uuid REFERENCES public.managed_companies(id) ON DELETE CASCADE,
  document_name text NOT NULL,
  issuing_body text NOT NULL DEFAULT '',
  expiration_date date NOT NULL,
  weight_limit_kg numeric NOT NULL DEFAULT 0,
  weight_used_kg numeric NOT NULL DEFAULT 0,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own licenses"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own licenses"
  ON public.licenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own licenses"
  ON public.licenses FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for license PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('license-files', 'license-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload license files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'license-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own license files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'license-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own license files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'license-files' AND auth.uid()::text = (storage.foldername(name))[1]);