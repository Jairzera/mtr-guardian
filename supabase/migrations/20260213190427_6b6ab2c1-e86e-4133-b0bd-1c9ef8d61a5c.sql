
-- Add receiver_id column to waste_manifests
ALTER TABLE public.waste_manifests ADD COLUMN IF NOT EXISTS receiver_id uuid;

-- Allow receivers to view manifests assigned to them
CREATE POLICY "Receivers can view assigned manifests"
ON public.waste_manifests FOR SELECT TO authenticated
USING (receiver_id = auth.uid());

-- Allow receivers to update manifests assigned to them
CREATE POLICY "Receivers can update assigned manifests"
ON public.waste_manifests FOR UPDATE TO authenticated
USING (receiver_id = auth.uid());
