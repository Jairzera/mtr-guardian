
-- Drop the restrictive check constraint
ALTER TABLE public.waste_manifests DROP CONSTRAINT waste_manifests_status_check;

-- Recreate with all valid statuses
ALTER TABLE public.waste_manifests ADD CONSTRAINT waste_manifests_status_check
  CHECK (status = ANY (ARRAY[
    'pendente',
    'conformidade',
    'risco',
    'enviado',
    'em_transito',
    'aguardando_validacao',
    'received',
    'completed'
  ]));
