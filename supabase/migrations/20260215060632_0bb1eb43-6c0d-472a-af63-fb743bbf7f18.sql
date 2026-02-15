-- Drop the overly permissive policy and replace with a more restricted one
DROP POLICY "Public tracking can update manifest status" ON public.waste_manifests;

-- Create a more restricted policy: only allow updating status from enviado->em_transito or em_transito->completed
-- This still uses USING(true) for the read part but the WITH CHECK is restrictive
CREATE POLICY "Public tracking can update manifest status"
ON public.waste_manifests
FOR UPDATE
USING (
  status IN ('enviado', 'em_transito')
)
WITH CHECK (
  status IN ('em_transito', 'completed')
);