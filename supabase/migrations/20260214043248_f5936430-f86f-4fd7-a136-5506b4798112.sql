
-- Drop all existing restrictive policies on waste_manifests
DROP POLICY IF EXISTS "Users can view their own manifests" ON public.waste_manifests;
DROP POLICY IF EXISTS "Receivers can view assigned manifests" ON public.waste_manifests;
DROP POLICY IF EXISTS "Users can create their own manifests" ON public.waste_manifests;
DROP POLICY IF EXISTS "Users can update their own manifests" ON public.waste_manifests;
DROP POLICY IF EXISTS "Receivers can update assigned manifests" ON public.waste_manifests;
DROP POLICY IF EXISTS "Users can delete their own manifests" ON public.waste_manifests;

-- Recreate as PERMISSIVE policies (default, uses OR logic between policies)
CREATE POLICY "Users can view their own manifests"
  ON public.waste_manifests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Receivers can view assigned manifests"
  ON public.waste_manifests FOR SELECT
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can create their own manifests"
  ON public.waste_manifests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manifests"
  ON public.waste_manifests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Receivers can update assigned manifests"
  ON public.waste_manifests FOR UPDATE
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own manifests"
  ON public.waste_manifests FOR DELETE
  USING (auth.uid() = user_id);
