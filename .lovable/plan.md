
# Melhorias nos Cards do Mercado: Acoes por Perfil

## Visao Geral

Ajustar os cards de anuncios na pagina `/mercado` para que cada perfil tenha acoes distintas e claras:

- **Destinador (receiver)**: Icone de WhatsApp "Tenho Interesse" compacto no card (substituindo o botao full-width atual)
- **Gerador (generator)**: Dois icones pequenos abaixo do anuncio -- "Produto Vendido" e "Excluir" (com confirmacao)

## Alteracoes

### Arquivo: `src/pages/Mercado.tsx`

**1. Imports adicionais**
- Adicionar icones: `CheckCircle`, `Trash2` do lucide-react
- Importar `AlertDialog` e seus subcomponentes do shadcn para o dialog de confirmacao de exclusao

**2. Nova funcao: `handleMarkSold`**
- Atualiza o status do anuncio para `"sold"` no banco via `supabase.from("marketplace_listings").update({ status: "sold" }).eq("id", item.id)`
- Exibe toast de sucesso e recarrega a listagem

**3. Nova funcao: `handleDelete`**
- Deleta o anuncio via `supabase.from("marketplace_listings").delete().eq("id", item.id)`
- Exibe toast de sucesso e recarrega a listagem

**4. Redesign da area de acoes no card**

Para o **Destinador** (quando `!isOwn`):
- Substituir o botao full-width por um icone compacto de WhatsApp com tooltip "Tenho Interesse", posicionado no canto inferior do card
- Ao clicar, executa a mesma logica `handleInterest` existente

Para o **Gerador** (quando `isOwn`):
- Exibir uma linha com dois icones pequenos:
  - Icone `CheckCircle` com texto "Vendido" -- ao clicar, chama `handleMarkSold`
  - Icone `Trash2` com texto "Excluir" -- ao clicar, abre um `AlertDialog` perguntando "Tem certeza que deseja excluir este anuncio?" com botoes "Cancelar" e "Excluir"

---

## Detalhes Tecnicos

### Estrutura do card (area de acoes)

```text
+------------------------------------------+
| Material           Valor Estimado        |
| 500 kg . Sao Paulo                       |
| R$ 3,75/kg                               |
| Empresa XYZ                              |
|                                          |
| [Se receiver]:                           |
|   (icone WhatsApp) Tenho Interesse       |
|                                          |
| [Se generator e isOwn]:                  |
|   (CheckCircle) Vendido  (Trash2) Excluir|
+------------------------------------------+
```

### AlertDialog de confirmacao
Usa os componentes `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` ja disponiveis no projeto (`src/components/ui/alert-dialog.tsx`).

### Atualizacao de status
- `handleMarkSold`: `UPDATE marketplace_listings SET status = 'sold' WHERE id = ?` -- o anuncio sai da listagem pois o fetch filtra por `status = 'active'`
- `handleDelete`: `DELETE FROM marketplace_listings WHERE id = ?` -- RLS ja garante que so o dono pode deletar
