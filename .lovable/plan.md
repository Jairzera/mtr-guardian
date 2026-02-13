

# Correcao do Bug no Mercado - Filtragem Inconsistente

## Problema Encontrado

Na pagina `src/pages/Mercado.tsx`, os KPIs e o estado vazio usam `listings.length` (todos os anuncios do banco), mas os cards sao filtrados por role:
- **Gerador**: ve apenas `item.user_id === user?.id` (seus proprios)
- **Destinador**: ve apenas `item.user_id !== user?.id` (de outros)

Isso causa discrepancia entre os numeros mostrados nos KPIs e os cards exibidos. O estado vazio tambem nunca aparece se existirem anuncios de outros usuarios.

## Solucao

Aplicar o filtro de role **antes** de calcular KPIs e checar estado vazio, usando `useMemo` para derivar a lista filtrada.

## Detalhes Tecnicos

### Arquivo: `src/pages/Mercado.tsx`

1. Adicionar `useMemo` aos imports
2. Criar uma lista filtrada derivada:

```tsx
const filteredListings = useMemo(() => {
  if (role === "receiver") {
    return listings.filter((item) => item.user_id !== user?.id);
  }
  return listings.filter((item) => item.user_id === user?.id);
}, [listings, role, user?.id]);
```

3. Substituir todas as referencias a `listings.length`, `listings.reduce(...)`, `listings.map(...)`, e `listings.filter(...)` no JSX por `filteredListings`

4. Remover o `.filter()` inline no grid de cards, ja que `filteredListings` ja esta filtrado

Isso garante que KPIs, estado vazio e cards usem exatamente o mesmo conjunto de dados filtrado por role.

