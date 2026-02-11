

## Plano: Conectar CicloMTR ao Supabase (Storage + Database + Base Regulatoria)

Este plano elimina todos os dados fictícios e conecta o sistema ao backend real do Supabase em 3 frentes.

---

### Objetivo 1: Upload Real de Fotos (Supabase Storage)

**Migração SQL** -- Criar bucket `mtr_documents` com politicas RLS:
- Bucket publico para leitura das URLs
- Politicas de INSERT, SELECT e DELETE restritas ao `auth.uid()` do usuario
- Path pattern: `{user_id}/{timestamp}_{filename}`

**Alteracao em `NewManifest.tsx`**:
- No `handleFileChange`, alem de gerar o preview local com `createObjectURL`, armazenar o `File` em estado
- Apos o usuario confirmar no Passo 3, fazer upload real via `supabase.storage.from('mtr_documents').upload()`
- Obter a URL publica com `getPublicUrl()`

---

### Objetivo 2: Salvar e Listar MTRs Reais (Database)

**Alteracao em `NewManifest.tsx` (funcao `handleConfirm`)**:
- Obter `user.id` via `useAuth()`
- Fazer upload da foto para o bucket
- Executar `supabase.from('waste_manifests').insert()` com os campos: `user_id`, `waste_class`, `weight_kg`, `transporter_name`, `destination_type`, `photo_url`, `status: 'pendente'`
- Exibir erro via toast em caso de falha; avancar para Passo 4 em caso de sucesso

**Reescrita de `MTRList.tsx`**:
- Remover todo o `mockData`
- Usar `useEffect` + `supabase.from('waste_manifests').select('*').order('created_at', { ascending: false })` para buscar dados reais
- Mapear o campo `status` para os badges existentes (conformidade/pendente/risco)
- Exibir estado de loading (skeleton) e estado vazio ("Nenhum MTR registrado ainda.")

---

### Objetivo 3: Expandir Base Regulatoria (30+ codigos IBAMA/FEAM/CETESB)

**Script de INSERT** (via ferramenta de dados, nao migracao) adicionando ~25 novos codigos cobrindo:

| Categoria | Exemplos |
|---|---|
| Metalurgia/Mecanica | Borras de usinagem, sucatas metalicas mistas, fluidos de corte |
| Construcao/Demolicao | Entulho Classe A/B/C, gesso, amianto (Classe I) |
| Textil/Quimico | Estopas contaminadas, solventes halogenados/nao-halogenados |
| Gerais | Lampadas fluorescentes, EPIs contaminados, lixo eletronico (REEE), pilhas |

Os codigos seguirao a estrutura da Lista Brasileira de Residuos Solidos (IN 13/2012) e serao inseridos com `ON CONFLICT (code) DO NOTHING` para evitar duplicatas.

O dropdown `WasteCodeSelect` ja busca da tabela ordenado por `code` -- nenhuma alteracao necessaria nesse componente.

---

### Resumo Tecnico de Arquivos Afetados

| Arquivo | Tipo de Alteracao |
|---|---|
| Migracao SQL (novo) | Criar bucket `mtr_documents` + politicas RLS de storage |
| INSERT SQL (dados) | ~25 novos codigos de residuos na `waste_codes_ibama` |
| `src/pages/NewManifest.tsx` | Upload real + INSERT no banco + uso de `useAuth` |
| `src/pages/MTRList.tsx` | SELECT real do Supabase, remocao de mock, estado vazio |

### Dependencias
- O usuario precisa estar autenticado (ja implementado) para que o RLS funcione
- O bucket sera criado via migracao SQL automatica

