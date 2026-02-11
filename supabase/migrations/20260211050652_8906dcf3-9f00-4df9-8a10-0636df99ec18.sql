
-- Add unique constraint on code if not exists (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'waste_codes_ibama_code_key'
  ) THEN
    ALTER TABLE public.waste_codes_ibama ADD CONSTRAINT waste_codes_ibama_code_key UNIQUE (code);
  END IF;
END $$;

INSERT INTO waste_codes_ibama (code, description, class, requires_special_transport) VALUES
('12 01 01', 'Aparas e limalhas de metais ferrosos', 'Classe II A - Não Inerte', false),
('12 01 05', 'Aparas e limalhas de metais não ferrosos', 'Classe II A - Não Inerte', false),
('12 01 09', 'Emulsões e soluções de usinagem sem halogêneos', 'Classe I - Perigoso', true),
('12 01 10', 'Emulsões e soluções de usinagem com halogêneos', 'Classe I - Perigoso', true),
('12 01 12', 'Ceras e gorduras usadas', 'Classe I - Perigoso', true),
('13 01 10', 'Óleos hidráulicos minerais não clorados', 'Classe I - Perigoso', true),
('13 02 06', 'Óleos lubrificantes sintéticos', 'Classe I - Perigoso', true),
('16 01 17', 'Sucatas metálicas ferrosas mistas', 'Classe II B - Inerte', false),
('12 01 14', 'Borras de usinagem (lamas de retífica)', 'Classe I - Perigoso', true),
('17 01 01', 'Entulho Classe A - Concreto, argamassa, blocos', 'Classe II B - Inerte', false),
('17 01 02', 'Entulho Classe B - Madeira, plástico, papel, metal', 'Classe II A - Não Inerte', false),
('17 01 03', 'Entulho Classe C - Gesso e derivados', 'Classe II A - Não Inerte', false),
('17 06 05', 'Materiais contendo amianto (fibrocimento)', 'Classe I - Perigoso', true),
('17 08 01', 'Tintas e vernizes secos (sem solvente)', 'Classe II A - Não Inerte', false),
('17 09 03', 'Resíduos de construção contendo substâncias perigosas', 'Classe I - Perigoso', true),
('04 02 09', 'Resíduos têxteis contaminados (estopas com óleo)', 'Classe I - Perigoso', true),
('07 01 01', 'Solventes halogenados usados', 'Classe I - Perigoso', true),
('07 01 04', 'Solventes não halogenados usados', 'Classe I - Perigoso', true),
('19 08 12', 'Lodos de ETE industrial', 'Classe II A - Não Inerte', false),
('19 08 14', 'Lodos de ETE industrial com substâncias perigosas', 'Classe I - Perigoso', true),
('20 01 21', 'Lâmpadas fluorescentes e de vapor de mercúrio', 'Classe I - Perigoso', true),
('20 01 35', 'Equipamentos elétricos e eletrônicos (REEE)', 'Classe I - Perigoso', true),
('15 02 02', 'EPIs contaminados (luvas, máscaras, aventais)', 'Classe I - Perigoso', true),
('20 01 33', 'Pilhas e acumuladores (baterias)', 'Classe I - Perigoso', true),
('18 01 03', 'Resíduos de serviço de saúde (RSS) - Grupo A', 'Classe I - Perigoso', true),
('16 05 06', 'Reagentes químicos de laboratório', 'Classe I - Perigoso', true),
('15 01 10', 'Embalagens contaminadas com resíduos perigosos', 'Classe I - Perigoso', true)
ON CONFLICT (code) DO NOTHING;
