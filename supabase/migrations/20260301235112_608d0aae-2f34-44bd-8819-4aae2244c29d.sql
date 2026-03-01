-- 1. CHECK constraints for numeric validation
ALTER TABLE public.marketplace_listings
  ADD CONSTRAINT quantity_valid CHECK (quantity >= 0 AND quantity <= 1000000);

ALTER TABLE public.marketplace_listings
  ADD CONSTRAINT price_per_kg_valid CHECK (price_per_kg IS NULL OR (price_per_kg >= 0 AND price_per_kg <= 1000000));

ALTER TABLE public.waste_manifests
  ADD CONSTRAINT weight_kg_valid CHECK (weight_kg >= 0 AND weight_kg <= 1000000);

ALTER TABLE public.waste_manifests
  ADD CONSTRAINT received_weight_valid CHECK (received_weight IS NULL OR (received_weight >= 0 AND received_weight <= 1000000));

-- 2. Receiver access policy on certificates
CREATE POLICY "Receivers can view certificates for their manifests"
ON public.certificates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.waste_manifests wm
    WHERE wm.id = certificates.manifest_id
    AND wm.receiver_id = auth.uid()
  )
);