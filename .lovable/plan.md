

# Limpeza de Interface do Destinador

## Problema

O `receiverItems` na Sidebar ainda inclui itens irrelevantes para o Destinador:
- **ESG** (linha 29) - irrelevante para receiver
- **Mapa** (linha 28) - nao solicitado na lista final
- **Certificados** (linha 30) - nao solicitado na lista final
- **Recebimento** (linha 25) - redundante com "Validar Carga"

O usuario quer que o Destinador veja **apenas**: Dashboard, Mercado, Validar Carga, Configuracoes.

## Alteracoes

### 1. Sidebar (`src/components/layout/AppSidebar.tsx`)

Reduzir o array `receiverItems` para apenas 4 itens:

```tsx
const receiverItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mercado", label: "Mercado", icon: Store },
  { to: "/validar-carga", label: "Validar Carga", icon: ClipboardCheck },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];
```

Remover os icones nao utilizados do import (`Leaf`, `MapPin`, `ShieldCheck`, `PackageCheck`) se nao forem usados pelo `generatorItems`.

### 2. Bottom Nav (`src/components/layout/BottomNav.tsx`)

A bottom nav mobile ja esta quase correta, mas inclui "Mapa" para ambos os perfis. Ajustar para que o receiver veja apenas:
- Home (Dashboard)
- Mercado
- Validar (botao central - ja correto)
- Configuracoes (Perfil)

Substituir o link "Mapa" por logica condicional: mostrar "Mapa" apenas para generator, e para receiver nao mostrar (ja tem 4 itens + botao central = 5 slots completos sem Mapa).

### 3. Protecao de Rota (nenhuma alteracao necessaria)

As rotas `/esg`, `/mapa`, `/certificados` continuam existindo no `App.tsx` para o Gerador. O Destinador simplesmente nao tera acesso via navegacao. Nao e necessario bloquear por rota neste momento.

