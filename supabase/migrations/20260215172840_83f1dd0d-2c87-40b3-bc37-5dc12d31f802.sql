
-- Update public tracking policy to allow transitioning to aguardando_validacao
DROP POLICY IF EXISTS "Public tracking can update manifest status" ON public.waste_manifests;

CREATE POLICY "Public tracking can update manifest status"
ON public.waste_manifests
FOR UPDATE
USING (status = ANY (ARRAY['enviado'::text, 'em_transito'::text]))
WITH CHECK (status = ANY (ARRAY['em_transito'::text, 'aguardando_validacao'::text, 'completed'::text]));
