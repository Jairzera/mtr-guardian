
ALTER TABLE public.waste_manifests
  ADD COLUMN IF NOT EXISTS physical_state text,
  ADD COLUMN IF NOT EXISTS packaging text,
  ADD COLUMN IF NOT EXISTS destination_company_name text,
  ADD COLUMN IF NOT EXISTS destination_cnpj text,
  ADD COLUMN IF NOT EXISTS destination_license text,
  ADD COLUMN IF NOT EXISTS driver_name text,
  ADD COLUMN IF NOT EXISTS vehicle_plate text,
  ADD COLUMN IF NOT EXISTS transport_date date;
