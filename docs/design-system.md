# Ágora Design System — Referência

Sistema de design oficial da plataforma. Fonte da verdade: ficheiro Figma
**"ADS _ A - Ágora Design System"** (`fileKey: 7jo43i7vgaC2nVGOkqHLIh`),
página **Color Styles** (node `1-741`).

Os valores abaixo foram extraídos diretamente das *paint styles* do ficheiro Figma.
A implementação vive em [`src/app/globals.css`](../src/app/globals.css) como tokens
Tailwind v4 (`@theme inline`). **Não editar valores manualmente** — resincronizar a
partir do Figma se o DS mudar.

---

## Cores

### Base

| Token | Hex | Tailwind |
|---|---|---|
| White | `#ffffff` | `*-white` |
| Black | `#000000` | `*-black` |

### Primary — ações primárias (botões, links)

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#fafcff` | | 500 | `#1a65fa` |
| 100 | `#f2f6ff` | | 600 | `#034ad8` |
| 200 | `#e5eeff` | | 700 | `#0338a2` |
| 300 | `#bbd1fd` | | 800 | `#002b82` |
| 400 | `#5f93fc` | | 900 | `#021c51` |

### Secondary — ações e fundos secundários

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#f5fbff` | | 500 | `#1ca3fc` |
| 100 | `#ebf6ff` | | 600 | `#1993e3` |
| 200 | `#e3f4ff` | | 700 | `#1682ca` |
| 300 | `#cceaff` | | 800 | `#12669e` |
| 400 | `#a0d8fe` | | 900 | `#0d4c75` |

### Neutral — superfícies, divisores, bordas

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#f7f8fa` | | 500 | `#9ca6b8` |
| 100 | `#f1f3f8` | | 600 | `#8893aa` |
| 200 | `#e1e4ea` | | 700 | `#64718b` |
| 300 | `#cdd2dc` | | 800 | `#475164` |
| 400 | `#bac0cc` | | 900 | `#2b363c` |

### Informative — feedback informativo

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#e5f6ff` | | 500 | `#0079bf` |
| 100 | `#e5f6ff` | | 600 | `#00598c` |
| 200 | `#a5deff` | | 700 | `#0b486b` |
| 300 | `#77ceff` | | 800 | `#083752` |
| 400 | `#49bcff` | | 900 | `#00121c` |

### Success — feedback positivo

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#e5fff6` | | 500 | `#008558` |
| 100 | `#c2f2e2` | | 600 | `#00724c` |
| 200 | `#7accb1` | | 700 | `#005539` |
| 300 | `#36b289` | | 800 | `#013926` |
| 400 | `#1f9970` | | 900 | `#001c13` |

### Warning — feedback de aviso

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#fff9e5` | | 500 | `#fbcb3c` |
| 100 | `#fff2cc` | | 600 | `#fbbb3c` |
| 200 | `#ffe699` | | 700 | `#f2a222` |
| 300 | `#ffe28c` | | 800 | `#b06112` |
| 400 | `#ffd966` | | 900 | `#80460d` |

### Danger — feedback negativo / ações perigosas

| Escala | Hex | | Escala | Hex |
|---|---|---|---|---|
| 50 | `#fef1f2` | | 500 | `#de2d3b` |
| 100 | `#fee1e3` | | 600 | `#d12332` |
| 200 | `#fec8cc` | | 700 | `#c41826` |
| 300 | `#fca6ad` | | 800 | `#b20917` |
| 400 | `#f8727d` | | 900 | `#86131d` |

### Focus — cor de foco acessível (fundos claros e escuros)

| Token | Hex | Tailwind |
|---|---|---|
| Focus | `#f408fc` | `*-focus` |

### Text — tokens semânticos de texto

| Token | Hex | Equivalente | Tailwind |
|---|---|---|---|
| White | `#ffffff` | High Contrast White | `text-text-white` |
| Light | `#9ca6b8` | Neutral 500 | `text-text-light` |
| Medium | `#64718b` | Neutral 700 | `text-text-medium` |
| Dark | `#2b363c` | Neutral 900 | `text-text-dark` |
| Primary | `#034ad8` | Primary 600 | `text-text-primary` |
| Primary Dark | `#021c51` | Primary 900 | `text-text-primary-dark` |
| Link | `#034ad8` | Primary 600 | `text-text-link` |
| Link Visited | `#7d02de` | — | `text-text-link-visited` |

### Data Visualization

| Token | Hex | Tailwind |
|---|---|---|
| Blue | `#1a65fa` | `*-dataviz-blue` |
| Green | `#a0ea00` | `*-dataviz-green` |
| Purple | `#4f00bd` | `*-dataviz-purple` |
| Yellow | `#fcd13a` | `*-dataviz-yellow` |

---

## Como usar

As cores são tokens Tailwind v4 definidos em `@theme inline` em
[`src/app/globals.css`](../src/app/globals.css). Usar via classes utilitárias:

```html
<button class="bg-primary-600 text-white hover:bg-primary-700">Confirmar</button>
<div class="bg-neutral-50 border border-neutral-200 text-text-dark">…</div>
<span class="text-success-500">Concluído</span>
```

> O Tailwind v4 só emite a *utility* CSS para os tokens efetivamente usados no
> código. Tokens definidos mas ainda não aplicados (ex.: `bg-success-500`,
> `text-focus`) só geram CSS quando forem usados num componente.

---

## Notas de implementação

- **Tipografia:** Noto Sans (`--font-sans`), carregada via Google Fonts em `globals.css`.
- **Cache do Turbopack:** ao alterar tokens em `globals.css`, pode ser necessário
  limpar `.next` por completo (`rm -rf .next`) e reiniciar o dev server — o
  Turbopack por vezes serve o CSS compilado em cache.
- **Gradientes / overlays:** o Figma define ainda estilos de *overlay* (backdrop,
  filtros, gradientes L-R/R-L) que não estão implementados nesta fase. Adicionar
  quando algum ecrã os exigir.

---

## Ícones

Fonte de design: Figma **"ADS _ 05 - Ícones e Imagens"**
(`fileKey: 4Li3GRV2F33JYnIgx6F4c4`). O set Ágora completo tem **174 ícones**
em duas variantes (`line` e `solid`) + 5 "other".

### Implementação

Os ícones usados na plataforma foram extraídos do pacote oficial
`@ama-pt/agora-design-system` (v3.7.0, variante **line**) para um registry local,
**sem adicionar dependência de runtime**:

- [`src/components/icons/agora-icons.generated.ts`](../src/components/icons/agora-icons.generated.ts)
  — registry auto-gerado (viewBox + conteúdo SVG) dos ícones em uso. **Não editar à mão.**
- [`src/components/icons/AgoraIcon.tsx`](../src/components/icons/AgoraIcon.tsx)
  — componente wrapper.

```tsx
import { AgoraIcon } from "@/components/icons/AgoraIcon";

<AgoraIcon name="search" className="size-[14px] text-primary-600" />
<AgoraIcon name="like" size={22} />
```

- Os SVGs usam `fill="currentColor"` → a cor segue a `color` do elemento
  (classes `text-*`).
- Tamanho via classe (`size-[14px]`) ou prop `size={n}` (px). Por defeito `1em`.
- `title="..."` torna o ícone acessível (`role="img"`); sem `title` é decorativo
  (`aria-hidden`).

### Mapeamento (lucide-react → Ágora line)

A camada de ícones UI usava `lucide-react`. Foi **totalmente substituída** por
ícones Ágora. Dependência `lucide-react` removida.

| lucide | Ágora | | lucide | Ágora |
|---|---|---|---|---|
| AlertCircle | `alert-circle` | | Info | `info-mark` |
| AlertTriangle | `alert-triangle` | | Layers | `layers-menu` |
| ArrowLeftRight | `refresh-ccw` | | LifeBuoy | `help-support` |
| ArrowRight | `arrow-right` | | Lightbulb | `award` |
| ArrowUpAZ | `sort-alpha-down` | | List | `list` |
| BarChart3 | `bar-chart` | | LogOut | `log-out` |
| Bell | `bell` | | RefreshCw | `refresh-ccw` |
| BookOpen | `book-open` | | Search | `search` |
| CheckCircle2 | `check-circle` | | Share2 | `share` |
| ChevronDown/Up/Left/Right | `chevron-*` | | Wrench | `hardware-settings` |
| Copy | `copy` | | X | `x` |
| Download | `download` | | XCircle | `x-circle` |
| FileText | `document` | | Heart | `like` |
| Gauge | `bar-chart` (filtro "Métrica") | | Headphones | `help-support` |

> Mapeamentos contextuais notáveis: `Gauge`→`bar-chart` (filtro Métrica),
> `Lightbulb`→`award` (renderiza como lâmpada — secção "Como Inovar?"),
> `Wrench`→`hardware-settings` (secção "Ferramentas").

### Pendente (não migrado)

SVGs custom em `public/icons/` ainda **não** convertidos — requerem decisão/validação no Figma:

- **Badges de estado** em `IndicatorCard` (`icon-alert-circle`, `icon-x-circle`,
  `icon-alert-triangle`, `icon-heart`): têm equivalente Ágora direto, mas são
  badges coloridos — migração altera aparência, validar primeiro.
- **Bespoke** (`icon-pt`, `icon-score`): sem equivalente 1:1 no set Ágora.
- **Ilustrações de prioridade temática** (`satisfacao`, `acessibilidade`, …):
  ilustrações de conceito, sem correspondência direta no set de ícones.

### Resincronizar

Para acrescentar ícones: `npm pack @ama-pt/agora-design-system`, extrair, e
re-gerar o registry a partir do `index.mjs` (mapa `agora-line-<name>` → ficheiro),
renderizando cada componente com `fill="currentColor"`.

---

## Histórico

- **2026-06-30** — Substituída a paleta parcial inicial (valores genéricos do
  Tailwind + lacunas) pela escala Ágora completa 50–900 de todas as famílias,
  extraída do Figma.
- **2026-06-30** — Migrada a camada de ícones UI de `lucide-react` para o set
  Ágora (variante line), via registry local + componente `AgoraIcon`.
  Dependência `lucide-react` removida.
