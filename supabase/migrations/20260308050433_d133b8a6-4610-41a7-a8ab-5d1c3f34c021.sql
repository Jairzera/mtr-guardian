-- Add 'consultant' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'consultant';

-- Update assign_user_role to allow updating existing role (ON CONFLICT UPDATE)
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id) DO UPDATE SET role = _role;
END;
$$;