

# Plano de Correcao: Marketplace, Receber Carga e Mapa do Destinador

## Problema 1: Anuncios do Gerador nao aparecem para o Destinador

**Causa raiz**: O filtro no frontend (`src/pages/Mercado.tsx` linha 168-169) exclui anuncios onde `user_id !== user?.id`. Como o Dev Mode usa a mesma conta, o anuncio proprio e filtrado. Alem disso, mesmo em producao com contas diferentes, a logica esta correta, mas para o Destinador o titulo deveria ser "Mercado de Oportunidades" mostrando TODOS os anuncios de terceiros.

**Correcao**: Ajustar o filtro para que no modo `receiver` sejam exibidos TODOS os anuncios ativos (sem filtrar por user_id), ja que em producao o destinador e outro usuario. Para testes com dev mode, isso tambem resolve o problema.

## Problema 2: Fluxo "Receber Carga" com etapa de Validacao

**Situacao atual**: A pagina `ReceberCarga.tsx` busca MTRs existentes no banco e faz a validacao direta, mudando o status para `completed` imediatamente.

**O que o usuario quer**: O Destinador deve CADASTRAR manualmente os dados da carga recebida (tipo de residuo, peso, transportador). Esses dados vao para uma area de "staging". Depois, na tela "Validar Carga", os dados cadastrados pelo Destinador sao cruzados com o anuncio do Gerador. So apos a validacao o status muda para `COMPLETED`.

**Correcao em 2 etapas**:

1. **Receber Carga (`/receber-carga`)**: Transformar em formulario de cadastro onde o Destinador digita: tipo de residuo, peso na balanca, transportador, e observacoes. Ao salvar, cria um registro temporario com status `aguardando_validacao`.

2. **Validar Carga (`/validar-carga`)**: Listar as cargas com status `aguardando_validacao`. Mostrar lado a lado: dados do Destinador vs dados do MTR original do Gerador. Botao "Confirmar" muda status para `completed`.

**Alteracao no banco**: Adicionar coluna `receiver_id` na tabela `waste_manifests` para vincular o destinador a carga, e uma policy RLS que permita o receiver ler/atualizar manifestos onde ele e o receiver. Alternativamente, criar uma tabela separada `received_shipments` para o staging.

**Abordagem escolhida**: Usar a tabela `waste_manifests` existente, adicionando:
- Coluna `receiver_id` (uuid, nullable) para identificar o destinador
- Ajustar RLS para permitir que o receiver atualize manifestos destinados a ele
- Status flow: `enviado` -> `em_transito` -> `aguardando_validacao` -> `completed`

## Problema 3: Mapa removido do menu do Destinador

**Causa raiz**: No `AppSidebar.tsx` (linha 23-28) e `BottomNav.tsx` (linha 45-49), o Mapa so aparece para o perfil `generator`.

**Correcao**: Adicionar o link do Mapa (`/mapa`) de volta nos menus do Destinador, tanto na Sidebar quanto na Bottom Nav.

---

## Resumo das alteracoes

| Arquivo | Alteracao |
|---|---|
| **Migracao SQL** | Adicionar coluna `receiver_id` na `waste_manifests` + policy RLS para receiver |
| `src/pages/Mercado.tsx` | Remover filtro `user_id !== user?.id` para receivers (mostrar todos os anuncios) |
| `src/pages/ReceberCarga.tsx` | Reescrever como formulario de cadastro de carga recebida (sem buscar MTRs) |
| `src/pages/Recebimento.tsx` | Reescrever como tela de validacao cruzada (dados do Destinador vs Gerador) |
| `src/components/layout/AppSidebar.tsx` | Adicionar `{ to: "/mapa", label: "Mapa", icon: MapPin }` no array `receiverItems` |
| `src/components/layout/BottomNav.tsx` | Adicionar link do Mapa para o perfil `receiver` |

## Detalhes tecnicos

### Migracao SQL
```sql
ALTER TABLE public.waste_manifests ADD COLUMN IF NOT EXISTS receiver_id uuid;

-- Permitir que receivers vejam manifestos destinados a eles
CREATE POLICY "Receivers can view assigned manifests"
ON public.waste_manifests FOR SELECT TO authenticated
USING (receiver_id = auth.uid());

-- Permitir que receivers atualizem manifestos destinados a eles
CREATE POLICY "Receivers can update assigned manifests"
ON public.waste_manifests FOR UPDATE TO authenticated
USING (receiver_id = auth.uid());
```

### Fluxo Receber Carga (novo)
O formulario tera campos: Codigo MTR (input texto), Tipo de Residuo, Peso na Balanca, Transportador. Ao salvar, os dados ficam com status `aguardando_validacao`.

### Fluxo Validar Carga (novo)
Lista cargas com status `aguardando_validacao`. Cada card mostra uma comparacao visual:
- Lado esquerdo: "Dados do Destinador" (peso real, tipo informado)
- Lado direito: "Dados do Gerador" (peso declarado, tipo original do MTR)
- Indicador de divergencia se houver diferenca > 0.5kg
- Botao "Aprovar e Concluir" que muda status para `completed`

