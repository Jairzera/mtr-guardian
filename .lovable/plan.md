

# Correção de Visibilidade do Marketplace e Contato WhatsApp

## Diagnóstico

Analisei o banco de dados e o código frontend. O problema principal é:

- A tabela `marketplace_listings` ja tem uma policy `SELECT` com `USING (true)` -- qualquer usuario autenticado pode ler os anuncios. Isso esta correto.
- **O problema real**: a tabela `company_settings` tem policy `SELECT` restrita a `auth.uid() = user_id`. Quando o Destinador carrega o Mercado, o frontend tenta buscar `phone` e `razao_social` dos Geradores, mas o RLS bloqueia essa leitura cruzada. Resultado: `seller_phone` e `seller_name` chegam como `null`.
- O botao "Tenho Interesse" e a logica de WhatsApp ja existem no codigo (`handleInterest`). O fallback de "contato indisponivel" tambem ja existe. O problema e puramente de permissao no banco.

## Solucao

### 1. Criar uma View publica segura para dados de contato do marketplace

Em vez de abrir a tabela `company_settings` inteira para leitura cruzada (o que exporia CNPJ, endereco e outros dados sensiveis), vamos criar uma **view restrita** que expoe apenas os campos necessarios para o marketplace:

```sql
CREATE VIEW public.marketplace_seller_contacts
WITH (security_invoker = on) AS
SELECT user_id, phone, razao_social
FROM public.company_settings;
```

E adicionar uma policy na tabela `company_settings` que permite leitura dos campos via essa view indiretamente. Porem, como `security_invoker` ainda aplicaria o RLS da tabela base, a abordagem mais simples e segura e:

**Abordagem escolhida**: Criar uma **funcao RPC** `security definer` que busca phone e razao_social dado um array de user_ids. Isso bypassa o RLS de forma controlada, retornando apenas os campos publicos necessarios.

```sql
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
```

### 2. Atualizar o frontend (`src/pages/Mercado.tsx`)

Substituir a query direta a `company_settings` pela chamada RPC:

```tsx
// Antes (bloqueado pelo RLS):
const { data: settingsData } = await supabase
  .from("company_settings")
  .select("user_id, phone, razao_social")
  .in("user_id", userIds);

// Depois (funcao RPC que bypassa RLS de forma segura):
const { data: settingsData } = await supabase
  .rpc("get_seller_contacts", { seller_ids: userIds });
```

### 3. Fallback com email

Atualizar o `handleInterest` para mostrar o email do vendedor (via `auth.users` nao e acessivel, mas podemos buscar o email do usuario que criou o listing). Como nao temos acesso ao `auth.users`, vamos melhorar o fallback exibindo o nome da empresa e uma mensagem mais util no toast.

## Resumo das alteracoes

| Arquivo / Recurso | Alteracao |
|---|---|
| **Migracao SQL** | Criar funcao RPC `get_seller_contacts` |
| `src/pages/Mercado.tsx` | Trocar query `company_settings` por `supabase.rpc("get_seller_contacts")` |
| `src/pages/Mercado.tsx` | Melhorar mensagem de fallback no toast quando telefone ausente |

## Detalhes tecnicos

- A funcao usa `SECURITY DEFINER` para bypassar o RLS restritivo de `company_settings`
- Apenas `phone` e `razao_social` sao expostos -- CNPJ, endereco e responsavel permanecem protegidos
- A funcao aceita um array de UUIDs para eficiencia (uma unica chamada para todos os sellers)
- Nenhuma alteracao nas policies existentes de `company_settings` e necessaria

