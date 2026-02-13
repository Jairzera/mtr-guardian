CREATE OR REPLACE FUNCTION public.get_seller_contacts(seller_ids uuid[])
RETURNS TABLE(user_id uuid, phone text, razao_social text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cs.user_id, cs.phone, cs.razao_social
  FROM public.company_settings cs
  WHERE cs.user_id = ANY(seller_ids);
$$;