

# Correção RBAC: 3 Fixes Criticos para o Perfil Destinador

## Resumo

Tres correções para garantir que o Destinador tenha uma experiência focada em compra e recebimento, sem acesso a funcionalidades de Gerador.

---

## 1. Mercado -- Renderização Condicional por Role

**Arquivo:** `src/pages/Mercado.tsx`

- Importar `useUserRole` no componente
- **Receiver (Destinador):**
  - Titulo muda para "Mercado de Oportunidades"
  - Subtitulo: "Encontre residuos disponiveis para compra"
  - Botao "Anunciar" e Dialog de criacao ficam **ocultos**
  - KPI "Vendedores" muda label para "Fornecedores"
  - Empty state mostra mensagem passiva (sem botao de criar anuncio)
- **Generator (Gerador):**
  - Mantém tudo como esta (titulo "Receita Verde", botao Anunciar, etc.)

---

## 2. Tela Recebimento -- Adicionar Busca por MTR

**Arquivo:** `src/pages/Recebimento.tsx`

- Adicionar campo de busca no topo: "Buscar por numero do MTR ou residuo"
- O campo filtra a lista de manifestos pendentes em tempo real (client-side filter no array `manifests`)
- Adicionar `animate-fade-in` e melhorar skeleton de loading
- A logica de validacao com pesagem e divergencia ja existe e sera mantida intacta

---

## 3. Bottom Nav -- Botao Central Condicional

**Arquivo:** `src/components/layout/BottomNav.tsx`

O botao central ja alterna entre "Scan" (generator) e "Validar" (receiver) com icones diferentes. Porem, a rota do receiver aponta para `/recebimento`.

- Confirmar que a rota `/recebimento` esta correta no link do botao central para receiver
- Manter o icone `PackageCheck` e label "Validar" (ja implementado)
- Nenhuma mudanca necessaria neste arquivo -- ja esta correto

---

## Detalhes Tecnicos

### Mercado.tsx -- Mudancas

```text
+import { useUserRole } from "@/hooks/useUserRole";

 const Mercado = () => {
+  const { role } = useUserRole();
   const { user } = useAuth();
   ...

   // Titulo condicional
-  <h1>Receita Verde</h1>
+  <h1>{role === "receiver" ? "Mercado de Oportunidades" : "Receita Verde"}</h1>

   // Botao Anunciar: so para generator
+  {role === "generator" && (
     <Dialog ...> ... </Dialog>
+  )}

   // Empty state: sem botao de acao para receiver
   <EmptyState
     ...
-    actionLabel="Anunciar Residuo"
-    onAction={() => setDialogOpen(true)}
+    actionLabel={role === "generator" ? "Anunciar Residuo" : undefined}
+    onAction={role === "generator" ? () => setDialogOpen(true) : undefined}
   />
```

### Recebimento.tsx -- Mudancas

```text
+const [searchQuery, setSearchQuery] = useState("");

+// Filtro client-side
+const filteredManifests = manifests.filter((m) =>
+  m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
+  m.waste_class.toLowerCase().includes(searchQuery.toLowerCase()) ||
+  m.transporter_name.toLowerCase().includes(searchQuery.toLowerCase())
+);

 // Novo campo de busca antes da tabela
+<div className="relative">
+  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
+  <Input
+    placeholder="Buscar por numero MTR, residuo ou transportador..."
+    className="pl-10"
+    value={searchQuery}
+    onChange={(e) => setSearchQuery(e.target.value)}
+  />
+</div>

 // Usar filteredManifests no lugar de manifests na tabela e KPIs
```

### BottomNav.tsx

Nenhuma alteracao necessaria -- o componente ja implementa a logica condicional correta com `role === "generator"` vs `role === "receiver"`.

---

## Arquivos Modificados

| Arquivo | Tipo de Mudanca |
|---|---|
| `src/pages/Mercado.tsx` | Renderizacao condicional por role |
| `src/pages/Recebimento.tsx` | Campo de busca + filtro client-side |

