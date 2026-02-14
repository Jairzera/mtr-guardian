CREATE OR REPLACE FUNCTION public.get_seller_contacts(seller_ids uuid[])
RETURNS TABLE(user_id uuid, phone text, razao_social text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT cs.user_id, cs.phone, cs.razao_social
  FROM public.company_settings cs
  INNER JOIN public.marketplace_listings ml 
    ON ml.user_id = cs.user_id
  WHERE cs.user_id = ANY(seller_ids)
    AND ml.status = 'active';
$$;