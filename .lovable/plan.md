
## Implementação da Funcionalidade de Recebimento (Receipt Validation)

### Análise da Situação Atual
1. ✅ A rota `/recebimento` já existe e funciona bem
2. ✅ O `BottomNav.tsx` já roteia corretamente para `/recebimento` para receivers
3. ✅ A tela `Recebimento.tsx` tem busca, lista e modal de validação
4. ❌ **Problema crítico**: A tabela `waste_manifests` não possui a coluna `received_weight` para registrar o peso real recebido
5. ⚠️ **Melhorias necessárias**: 
   - Adicionar coluna `received_weight` (numeric, nullable)
   - Atualizar a lógica de validação para guardar peso real
   - Melhorar a interface para fazer busca individual por MTR (não apenas lista filtrada)

### Solução Técnica - 3 Etapas

#### **Etapa 1: Adicionar Coluna `received_weight` à Tabela**
- Executar migration SQL para adicionar coluna `received_weight` numeric nullable à tabela `waste_manifests`
- Isso permitirá registrar o peso real conferido na balança
- Atualizar o tipo TypeScript em `src/integrations/supabase/types.ts` (será feito automaticamente após migration)

#### **Etapa 2: Atualizar Lógica de Validação (`src/pages/Recebimento.tsx`)**
- Modificar o `validateMutation.mutationFn` para:
  - Salvar `received_weight` (peso real informado) junto com o status
  - Manter a lógica de divergência existente
  - Atualizar para status `'received'` em vez de `'concluido'` (mais semanticamente correto)
- Adicionar campo visível de "Peso Recebido" na modal de validação com visualização clara
- Melhorar a comparação: mostrar diferença absoluta e percentual

#### **Etapa 3: Melhorias de UX**
- Adicionar ícone de balança (Scale) para reforçar a ação de pesagem
- Adicionar validação de campo obrigatório para `received_weight`
- Mostrar aviso visual quando houver divergência > 0.5kg
- Adicionar toast de sucesso com detalhes: "Carga recebida: [peso_real]kg (Divergência: [diff]kg)"

### Detalhes Técnicos

**Migration SQL:**
```sql
ALTER TABLE public.waste_manifests
ADD COLUMN received_weight numeric;
```

**Atualização do UpdateMutation (`Recebimento.tsx`):**
```typescript
const { error } = await supabase
  .from("waste_manifests")
  .update({
    status: "received",
    received_weight: pesoReal,
    rejection_reason: divergente
      ? `Divergência: ${pesoReal}kg recebido vs ${selectedManifest?.weight_kg}kg declarado`
      : null,
  })
  .eq("id", id);
```

**Interface Type no modal:**
- Campo de input já existe (peso real)
- Botão "Confirmar Recebimento" já existe
- Apenas ajustar labels para melhor clareza

### Arquivos a Modificar
1. **supabase/migrations/** - Nova migration para adicionar `received_weight`
2. **src/integrations/supabase/types.ts** - Atualizar tipos (automático após migration)
3. **src/pages/Recebimento.tsx** - Atualizar lógica de validação para salvar peso real

### Fluxo Final de Validação
1. Receiver busca manifestos com status "enviado" ou "em_transito"
2. Clica "Validar" em um manifesto específico
3. Modal abre mostrando:
   - Dados do gerador e carga
   - **Peso Declarado** (peso_kg) em destaque
   - Campo **Peso Real na Balança** (novo input)
4. Sistema detecta divergência automática
5. Ao clicar "Confirmar Recebimento":
   - Atualiza status para "received"
   - Salva `received_weight` com o valor inserido
   - Registra divergência se houver
   - Exibe toast de sucesso
6. Manifesto sai da lista de pendentes

