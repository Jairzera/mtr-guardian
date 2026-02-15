
-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  manifest_id UUID NOT NULL REFERENCES public.waste_manifests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_url TEXT NOT NULL,
  received_date DATE NOT NULL,
  received_weight NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create cdf-files storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('cdf-files', 'cdf-files', false);

CREATE POLICY "Users can upload cdf files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cdf-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own cdf files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cdf-files' AND auth.uid()::text = (storage.foldername(name))[1]);
