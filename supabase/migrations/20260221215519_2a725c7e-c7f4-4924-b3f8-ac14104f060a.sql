
-- Create cdfs table
CREATE TABLE public.cdfs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cdf_number TEXT NOT NULL,
  generator_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  issue_date DATE NOT NULL,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'VALID',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cdf_id to waste_manifests
ALTER TABLE public.waste_manifests ADD COLUMN cdf_id UUID REFERENCES public.cdfs(id);

-- Enable RLS
ALTER TABLE public.cdfs ENABLE ROW LEVEL SECURITY;

-- Generators can view CDFs where they are the generator
CREATE POLICY "Generators can view their CDFs"
  ON public.cdfs FOR SELECT
  USING (auth.uid() = generator_id);

-- Receivers can view CDFs where they are the receiver
CREATE POLICY "Receivers can view their CDFs"
  ON public.cdfs FOR SELECT
  USING (auth.uid() = receiver_id);

-- Authenticated users can insert CDFs (for sync flow)
CREATE POLICY "Authenticated users can insert CDFs"
  ON public.cdfs FOR INSERT
  WITH CHECK (auth.uid() = generator_id OR auth.uid() = receiver_id);

-- Users can update their own CDFs
CREATE POLICY "Generators can update their CDFs"
  ON public.cdfs FOR UPDATE
  USING (auth.uid() = generator_id);

-- Trigger for updated_at
CREATE TRIGGER update_cdfs_updated_at
  BEFORE UPDATE ON public.cdfs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
