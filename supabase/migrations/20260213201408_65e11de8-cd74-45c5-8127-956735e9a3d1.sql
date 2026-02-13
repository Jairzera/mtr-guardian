
-- Restrict has_role to only allow checking own role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to check their own role
  IF _user_id != auth.uid() THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Restrict get_user_role to only allow checking own role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to check their own role
  IF _user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  
  RETURN (
    SELECT role FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
  );
END;
$$;
