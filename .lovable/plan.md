

# Auditoria: Funcionalidades Impossíveis por Limitação da API SINIR

## Problemas Identificados

### 1. Cofre de CDFs (`/cofre-cdf`) — Sincronização Automática de CDFs
**Problema**: O botao "Sincronizar com Orgao Ambiental" sugere que o sistema puxa CDFs do SINIR. A API **nao disponibiliza** endpoint para emitir ou descarregar CDFs. O destinador deve gerar o CDF manualmente no portal do governo.

**Acao**: Reformular a pagina. Remover o botao de sincronizacao com SINIR. Transformar o Cofre de CDFs num repositorio de upload manual onde o destinador faz upload do PDF do CDF que ele baixou do portal do governo. O sistema vincula esse PDF aos MTRs correspondentes.

### 2. Pagina Certificados (`/certificados`) — CDFs Falsos Gerados Localmente
**Problema**: A pagina gera numeros de CDF fictícios (`CDF-2026/0001`) a partir de manifestos completed. Esses NAO sao certificados oficiais do governo. Isso pode confundir o usuario e gerar problemas de compliance.

**Acao**: Remover a pagina `/certificados` e consolidar tudo no Cofre de CDFs reformulado. Ou transformar em "Comprovantes Internos" com nomenclatura clara que nao simule um documento oficial.

### 3. `sync-sinir` Edge Function — Referencia a `cdfs_synced`
**Problema**: A UI do CDFVault referencia `data?.cdfs_synced` mas a funcao `sync-sinir` atual ja nao sincroniza CDFs (so baixa PDFs de MTRs). Inconsistencia menor, mas o botao ainda dá a entender que busca CDFs do governo.

**Acao**: Renomear a acao de sync para "Baixar PDFs de MTRs pendentes" em vez de "Sincronizar com Orgao Ambiental".

### 4. MTRList — Botao "Excluir" Manifesto
**Problema**: O botao de exclusao deleta o manifesto do banco local, mas nao cancela no SINIR (endpoint indisponível). Se o MTR ja foi emitido no governo, ele continuara existindo la. O usuario pode pensar que cancelou o MTR oficial.

**Acao**: Adicionar aviso claro de que a exclusao e apenas local. Se o MTR tiver `mtr_number` (foi emitido no SINIR), mostrar alerta explicando que o cancelamento oficial deve ser feito no portal do governo, com link direto.

### 5. `generateCDFPdf` (`cdfPdfUtils.ts`) — Gera PDFs com aparencia oficial
**Problema**: A funcao gera PDFs formatados como se fossem CDFs oficiais. Pode induzir o usuario a pensar que e um documento valido.

**Acao**: Renomear para "Comprovante Interno CicloMTR" e adicionar marca d'agua/disclaimer no PDF: "Este documento NAO substitui o CDF oficial emitido pelo orgao ambiental."

---

## Plano de Implementacao

### Arquivo: `src/pages/CDFVault.tsx`
- Remover botao "Sincronizar com Orgao Ambiental" que chama `sync-sinir`
- Adicionar botao "Upload de CDF Oficial" para o usuario fazer upload do PDF que baixou do portal
- Adicionar banner informativo: "O CDF oficial deve ser emitido e baixado no portal do SINIR. Faca o upload aqui para manter seu cofre juridico organizado."
- Manter a listagem de CDFs existentes (os que foram uploaded manualmente)

### Arquivo: `src/pages/Certificados.tsx`
- Remover a pagina ou renomear para "Comprovantes Internos"
- Adicionar disclaimer claro de que nao sao documentos oficiais
- Alternativa: redirecionar `/certificados` para `/cofre-cdf`

### Arquivo: `src/pages/MTRList.tsx`
- No dialog de exclusao, se o MTR tiver sido emitido no SINIR (`mtr_number` existe), adicionar aviso: "Este MTR foi emitido no SINIR. A exclusao aqui nao cancela o documento no portal do governo. Para cancelar oficialmente, acesse mtr.sinir.gov.br."

### Arquivo: `src/lib/cdfPdfUtils.ts`
- Adicionar texto "COMPROVANTE INTERNO — Nao substitui o CDF oficial" no cabecalho/rodape do PDF

### Arquivo: `supabase/functions/sync-sinir/index.ts`
- Manter a funcionalidade de baixar PDFs de MTRs pendentes (isso e valido via `/downloadManifesto`)
- Renomear contexto de uso na UI para "Baixar PDFs pendentes"

### Arquivo: `src/components/layout/AppSidebar.tsx`
- Avaliar se manter ambas as entradas "Certificados" e "Cofre de CDFs" ou consolidar em uma so

### Resumo de Remocoes/Ajustes

| Funcionalidade | Status Atual | Acao |
|---|---|---|
| Sync CDFs do SINIR | Impossível (API bloqueada) | Remover sync, converter para upload manual |
| Gerar CDFs automaticos | Impossível (API bloqueada) | Remover geracao, adicionar disclaimer |
| Cancelar MTR via API | Impossível (endpoint indisponível) | Adicionar aviso no dialog de exclusao |
| Baixar PDF de MTR emitido | Funcional (`/downloadManifesto`) | Manter |
| Emitir MTR (`/salvarManifestoLote`) | Funcional | Manter |
| Receber MTR (`/receberManifestoLote`) | Funcional | Manter |
| Listas oficiais (residuos, classes) | Funcional | Manter |
| Consultar historico retroativo | Impossível | Ja tratado na arquitetura atual |

