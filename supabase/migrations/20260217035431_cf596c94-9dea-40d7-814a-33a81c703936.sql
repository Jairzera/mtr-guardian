
-- Add gov_token to company_settings for storing government API tokens
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS gov_token text DEFAULT '';

-- Add mtr_number and pdf_url to waste_manifests for government response data
ALTER TABLE public.waste_manifests
ADD COLUMN IF NOT EXISTS mtr_number text,
ADD COLUMN IF NOT EXISTS pdf_url text;

-- Update status check constraint to include 'issued'
ALTER TABLE public.waste_manifests DROP CONSTRAINT IF EXISTS waste_manifests_status_check;
ALTER TABLE public.waste_manifests ADD CONSTRAINT waste_manifests_status_check 
CHECK (status IN ('pendente', 'conformidade', 'risco', 'enviado', 'em_transito', 'aguardando_validacao', 'received', 'completed', 'issued'));
