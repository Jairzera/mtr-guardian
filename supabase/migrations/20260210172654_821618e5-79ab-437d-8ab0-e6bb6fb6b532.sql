
-- Create waste_manifests table
CREATE TABLE public.waste_manifests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('conformidade', 'pendente', 'risco')),
  waste_class TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  transporter_name TEXT NOT NULL,
  destination_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waste_manifests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own manifests
CREATE POLICY "Users can view their own manifests"
ON public.waste_manifests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manifests"
ON public.waste_manifests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manifests"
ON public.waste_manifests FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manifests"
ON public.waste_manifests FOR DELETE
USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_waste_manifests_updated_at
BEFORE UPDATE ON public.waste_manifests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
