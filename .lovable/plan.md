

# Plano: Auditoria Inteligente ABC + Modelo Elástico Pay-per-CNPJ

Dois diferenciais competitivos para o pré-lançamento do CicloMTR.

---

## Funcionalidade 1: Controle Econômico ABC (Curva ABC Fiscal-Financeira)

### Conceito
Permitir que o analista cadastre custos por tipo de resíduo (custo/kg de destinação, taxa de transporte) nos manifestos. A plataforma cruza automaticamente esses dados com os volumes, gerando uma Curva ABC que revela quais resíduos concentram custo desproporcional ao volume.

### Mudanças no Banco de Dados
Nova tabela `waste_costs` para armazenar dados contratuais:

```text
waste_costs
├── id (uuid, PK)
├── user_id (uuid, FK auth.users)
├── waste_class (text)           -- Classe do resíduo
├── cost_per_kg (numeric)        -- Custo unitário destinação (R$/kg)
├── transport_cost (numeric)     -- Taxa transporte (R$/viagem ou R$/kg)
├── contract_reference (text)    -- Referência contrato (opcional)
├── created_at / updated_at
```

Adição de coluna `destination_cost` (numeric, nullable) na tabela `waste_manifests` para registrar custo efetivo por MTR.

RLS: cada usuário gerencia apenas seus próprios registros.

### Nova Página: `/controle-abc`
- **KPIs no topo**: Custo total no período, Custo médio por tonelada, Nº classes de resíduo
- **Gráfico Curva ABC**: Gráfico de barras + linha acumulada (Recharts). Eixo X = classes de resíduo ordenadas por custo. Barras = % do custo total. Linha = % acumulada.
- **Tabela resumo**: Classe | Volume (ton) | % Volume | Custo Total (R$) | % Custo | Classificação (A/B/C)
- **Insight automático**: Card destacando resíduos Classe A (ex: "Lâmpadas industriais: 2% do volume, 45% do custo")
- **Filtro por período** (mês/trimestre/ano)

### Formulário de Custos
- Modal acessível na página ABC para cadastrar custo/kg por classe de resíduo
- Campo opcional `destination_cost` adicionado ao formulário de Novo Manifesto (ReviewFormSection)

### Integração
- Hook `useABCAnalysis` que busca manifestos + custos e calcula a curva
- Rota no sidebar do gerador entre "Auditoria" e "Mercado"
- Exportação PDF/CSV do relatório ABC

---

## Funcionalidade 2: Modelo Elástico Pay-per-CNPJ

### Conceito
Expandir a estrutura de billing para que consultorias/engenharias possam gerenciar múltiplos CNPJs (filiais de clientes) com cobrança elástica baseada no uso real.

### Mudanças no Banco de Dados
Nova tabela `managed_companies` (multi-CNPJ):

```text
managed_companies
├── id (uuid, PK)
├── owner_user_id (uuid)       -- Consultoria/gestor principal
├── cnpj (text)
├── razao_social (text)
├── is_active (boolean, default true)
├── last_activity_at (timestamptz)
├── created_at
```

Nova tabela `usage_metrics` (metering):

```text
usage_metrics
├── id (uuid, PK)
├── user_id (uuid)
├── managed_company_id (uuid, nullable)
├── period (date)              -- Primeiro dia do mês
├── active_cnpjs (integer)     -- CNPJs com atividade no mês
├── mtrs_emitted (integer)
├── api_calls (integer)
├── created_at
```

### Atualização na Página de Pricing
- Adicionar seção "Para Consultorias" com o modelo elástico
- Mostrar faixas de preço por CNPJ ativo (ex: 1-5 CNPJs: R$X/CNPJ, 6-20: R$Y/CNPJ)
- Badge "Pague apenas pelos CNPJs ativos" como diferencial

### Painel Multi-CNPJ (Configurações)
- Nova aba "Filiais / CNPJs" nas Configurações (visível para planos Avançado+)
- Lista de CNPJs gerenciados com status ativo/inativo
- Botão adicionar novo CNPJ
- Indicador de uso mensal por CNPJ

### Dashboard de Uso
- Seção no Dashboard mostrando "CNPJs ativos este mês" e "consumo da faixa"
- Barra de progresso visual da faixa elástica

---

## Resumo Técnico

| Item | Tipo | Escopo |
|------|------|--------|
| Tabela `waste_costs` | Migration | Nova tabela + RLS |
| Coluna `destination_cost` em `waste_manifests` | Migration | ALTER TABLE |
| Tabela `managed_companies` | Migration | Nova tabela + RLS |
| Tabela `usage_metrics` | Migration | Nova tabela + RLS |
| Página `/controle-abc` | Frontend | Nova página + rota + sidebar |
| Hook `useABCAnalysis` | Frontend | Lógica de cálculo da curva |
| Modal cadastro custos | Frontend | Componente |
| Campo custo no NewManifest | Frontend | Edição ReviewFormSection |
| Aba Multi-CNPJ em Configurações | Frontend | Nova aba |
| Seção elástica em Pricing | Frontend | Edição |
| KPI CNPJs ativos no Dashboard | Frontend | Edição |

Prioridade de implementação: Controle ABC primeiro (diferencial imediato com dados que já existem), depois Multi-CNPJ (requer mais infraestrutura de billing).

