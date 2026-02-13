
-- Fix 1: Remove self-service role INSERT/UPDATE policies (privilege escalation)
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Users can update their own role" ON public.user_roles;

-- Create a SECURITY DEFINER function for safe role assignment (only if no role exists)
CREATE OR REPLACE FUNCTION public.assign_user_role(_user_id uuid, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Add unique constraint on user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_key'
  ) THEN
    ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Fix 2: Make mtr_documents bucket private
UPDATE storage.buckets SET public = false WHERE id = 'mtr_documents';

-- Drop public read policy
DROP POLICY IF EXISTS "Public read access to mtr_documents" ON storage.objects;

-- Add owner-only read policy
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'mtr_documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
