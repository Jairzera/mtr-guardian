
-- Add tracking_token column for secure public tracking
ALTER TABLE public.waste_manifests ADD COLUMN IF NOT EXISTS tracking_token text;

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_waste_manifests_tracking_token ON public.waste_manifests (tracking_token) WHERE tracking_token IS NOT NULL;

-- Remove the unauthenticated public tracking update policy
DROP POLICY IF EXISTS "Public tracking can update manifest status" ON public.waste_manifests;
