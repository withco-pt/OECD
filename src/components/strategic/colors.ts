/* Sistema de cor do Panorama Estratégico — ÚNICO e global.
   Regra: todo o valor de qualidade/completude 0–100 é codificado pela mesma
   escala sequencial (`scoreColor`), explicada por uma única legenda transversal
   (o card "Escala de cor" na barra de KPIs). Magnitudes que não são 0–100
   (valores médios brutos) usam uma cor neutra da marca (`BAR_NEUTRAL`). Não há
   paletas categóricas por entidade — as entidades são identificadas por
   nome/logótipo.

   Escala: vermelho (0) → amarelo (50) → verde (100). Sem valor = cinza. */

/** Cor neutra da marca para barras de magnitude (valores que não são 0–100). */
export const BAR_NEUTRAL = "#0338a2";

/** Cinza para "sem valor / sem dados". */
const NO_DATA = "#e2e6ec";

// Paragens da rampa vermelho → amarelo → verde (t = 0, 0.25, 0.5, 0.75, 1).
const STOPS: [number, number, number][] = [
  [215, 48, 39], // 0     vermelho
  [252, 141, 89], // 25   laranja
  [254, 214, 90], // 50   amarelo
  [145, 207, 96], // 75   verde claro
  [26, 152, 80], // 100   verde
];

function rgbAt(score: number): [number, number, number] {
  const t = Math.max(0, Math.min(1, score / 100));
  const seg = t * (STOPS.length - 1);
  const i = Math.min(Math.floor(seg), STOPS.length - 2);
  const f = seg - i;
  return STOPS[i].map((a, k) => Math.round(a + (STOPS[i + 1][k] - a) * f)) as [number, number, number];
}

/** Escala sequencial 0–100 → vermelho → amarelo → verde. `null` = sem valor (cinza). */
export function scoreColor(score: number | null): string {
  if (score == null) return NO_DATA;
  const [r, g, b] = rgbAt(score);
  return `rgb(${r}, ${g}, ${b})`;
}

// Luminância relativa (WCAG) para escolher texto claro vs. escuro por contraste.
function relLuminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

const DARK_TEXT = "#14210d";
const DARK_TEXT_LUM = relLuminance([20, 33, 13]);

/** Texto legível sobre a cor da escala — escolhe branco ou escuro pelo maior contraste. */
export function scoreTextColor(score: number | null): string {
  if (score == null) return "#5b6675";
  const lum = relLuminance(rgbAt(score));
  const contrastWhite = 1.05 / (lum + 0.05);
  const contrastDark = (lum + 0.05) / (DARK_TEXT_LUM + 0.05);
  return contrastWhite >= contrastDark ? "#ffffff" : DARK_TEXT;
}
