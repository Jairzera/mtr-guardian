
-- Add trial/subscription columns to company_settings
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS trial_start_date timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial';

-- Update existing rows to have trial_start_date set
UPDATE public.company_settings
SET trial_start_date = created_at,
    subscription_status = 'trial'
WHERE trial_start_date IS NULL;

-- Add a plan column for future use
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'standard';
