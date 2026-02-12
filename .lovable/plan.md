

# Correcao do Motivo da Pendencia - Backend e Frontend

## Problema Atual
- A coluna `rejection_reason` nao existe na tabela `waste_manifests`
- Os tooltips com motivos sao gerados via hash no frontend (dados ficticios)
- Tooltips nao funcionam em dispositivos moveis (toque)

## Plano de Implementacao

### Passo 1 - Migrar banco de dados
Adicionar coluna `rejection_reason` (text, nullable) na tabela `waste_manifests`.

```text
ALTER TABLE waste_manifests ADD COLUMN rejection_reason text;
```

### Passo 2 - Popular dados de teste
Atualizar os 2 registros existentes com status "pendente" para incluir motivos reais:
- Registro `29c7c29a...`: "Falta assinatura do motorista"
- Registro `6b0c0975...`: "Peso divergente da balanca"

### Passo 3 - Atualizar MTRList.tsx

**Remover:**
- Arrays `pendingReasons` e `riskReasons`
- Funcao `getReasonByHash`
- Componente `StatusBadgeWithTooltip` com tooltip
- Imports de `Tooltip`, `TooltipContent`, `TooltipTrigger`

**Adicionar:**
- Import do componente `Dialog` (ja existe em `src/components/ui/dialog.tsx`)
- Estado `selectedReason` para controlar o modal
- Novo componente `StatusBadgeClickable` que:
  - Renderiza o Badge com um icone `Info` (tamanho pequeno) dentro do badge para status "pendente" e "risco"
  - Ao clicar, abre um Dialog com titulo "Detalhes da Pendencia" e o texto de `rejection_reason`
  - Para status "conformidade", o badge nao e clicavel
  - Aplica `cursor-pointer` nos badges clicaveis

**Dialog:**
- Titulo: "Detalhes da Pendencia"
- Conteudo: texto do `rejection_reason` com destaque visual (fundo amarelo/vermelho sutil)
- Botao: "Entendi" para fechar

### Passo 4 - Atualizar interface MTRItem
Adicionar `rejection_reason` ao tipo `MTRItem` e a query do Supabase (no select).

### Passo 5 - Mobile e Desktop
O componente `StatusBadgeClickable` funciona identicamente em ambas as views (card mobile e tabela desktop), pois usa Dialog em vez de Tooltip.

### Detalhes Tecnicos

**Arquivos a modificar:**
- `src/pages/MTRList.tsx` - remover tooltips, adicionar dialog clicavel, atualizar query e tipo
- Migracao SQL para adicionar coluna

**Arquivos sem alteracao:**
- `src/components/ui/dialog.tsx` - ja existe e esta pronto para uso

