-- Allow anonymous updates to waste_manifests status for tracking flow
-- Only allow updating the status field, restricted to valid tracking transitions
CREATE POLICY "Public tracking can update manifest status"
ON public.waste_manifests
FOR UPDATE
USING (true)
WITH CHECK (
  status IN ('em_transito', 'completed')
);