
-- Add 'finalized' to the status check constraint on waste_manifests
-- First drop existing constraint if any, then add updated one
DO $$
BEGIN
  -- Try to drop existing check constraint on status
  BEGIN
    ALTER TABLE public.waste_manifests DROP CONSTRAINT IF EXISTS waste_manifests_status_check;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

ALTER TABLE public.waste_manifests ADD CONSTRAINT waste_manifests_status_check
  CHECK (status IN ('pendente', 'conformidade', 'risco', 'enviado', 'em_transito', 'aguardando_validacao', 'received', 'completed', 'finalized'));
