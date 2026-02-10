
-- Create waste_codes_ibama reference table (Lista Brasileira de Resíduos - IN 13/2012)
CREATE TABLE public.waste_codes_ibama (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  class TEXT NOT NULL,
  requires_special_transport BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waste_codes_ibama ENABLE ROW LEVEL SECURITY;

-- Reference data: all authenticated users can read
CREATE POLICY "Authenticated users can view waste codes"
ON public.waste_codes_ibama
FOR SELECT
TO authenticated
USING (true);

-- Seed: 10 resíduos industriais mais comuns
INSERT INTO public.waste_codes_ibama (code, description, class, requires_special_transport) VALUES
  ('17 04 05', 'Sucata de Ferro e Aço', 'Não Perigoso - Classe II B', false),
  ('13 02 05', 'Óleo Lubrificante Usado ou Contaminado', 'Perigoso - Classe I', true),
  ('15 01 01', 'Embalagens de Papel e Papelão', 'Não Perigoso - Classe II B', false),
  ('16 06 01', 'Baterias Chumbo-Ácido', 'Perigoso - Classe I', true),
  ('19 08 05', 'Lodo de Estação de Tratamento de Efluentes', 'Perigoso - Classe I', true),
  ('08 01 11', 'Restos de Tintas e Vernizes com Solventes', 'Perigoso - Classe I', true),
  ('17 02 03', 'Plástico Industrial', 'Não Perigoso - Classe II B', false),
  ('15 01 03', 'Madeira de Pallets e Embalagens', 'Não Perigoso - Classe II A', false),
  ('06 01 01', 'Soluções Ácidas Residuais', 'Perigoso - Classe I', true),
  ('17 02 02', 'Vidro Industrial', 'Não Perigoso - Classe II B', false);
