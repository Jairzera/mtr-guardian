
-- 1. waste_costs table
CREATE TABLE public.waste_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  waste_class text NOT NULL,
  cost_per_kg numeric NOT NULL DEFAULT 0,
  transport_cost numeric NOT NULL DEFAULT 0,
  contract_reference text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own waste_costs" ON public.waste_costs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own waste_costs" ON public.waste_costs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waste_costs" ON public.waste_costs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own waste_costs" ON public.waste_costs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_waste_costs_updated_at BEFORE UPDATE ON public.waste_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. destination_cost column on waste_manifests
ALTER TABLE public.waste_manifests ADD COLUMN IF NOT EXISTS destination_cost numeric;

-- 3. managed_companies table
CREATE TABLE public.managed_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  cnpj text NOT NULL DEFAULT '',
  razao_social text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  last_activity_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own managed_companies" ON public.managed_companies FOR SELECT USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can insert own managed_companies" ON public.managed_companies FOR INSERT WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Users can update own managed_companies" ON public.managed_companies FOR UPDATE USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can delete own managed_companies" ON public.managed_companies FOR DELETE USING (auth.uid() = owner_user_id);

-- 4. usage_metrics table
CREATE TABLE public.usage_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  managed_company_id uuid REFERENCES public.managed_companies(id) ON DELETE SET NULL,
  period date NOT NULL,
  active_cnpjs integer NOT NULL DEFAULT 0,
  mtrs_emitted integer NOT NULL DEFAULT 0,
  api_calls integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage_metrics" ON public.usage_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage_metrics" ON public.usage_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
