// Estilos canónicos dos pills/badges de estado — fonte única de verdade.
// Tokens Ágora com contraste WCAG AA garantido (foreground sobre o respetivo
// fundo -100 e sobre branco). Ver docs/design-system.md → Pills de estado.
//
//   warning     (Dados Incompletos):            warning-900     sobre warning-100     = 6.72:1 ✓
//   danger      (Incumprimento Legal):           danger-800      sobre danger-100      = 5.81:1 ✓
//   secondary   (Mau Desempenho Operacional):    secondary-900   sobre secondary-100   = 8.85:1 ✓
//   informative (Mau Desempenho UX):             informative-800 sobre informative-100 = 10.7:1 ✓
export const PILL_STYLES = {
  warning:     { bg: "#fff2cc", color: "#80460d", border: "#ffe699" }, // warning-100     / warning-900     / warning-200
  danger:      { bg: "#fee1e3", color: "#b20917", border: "#fec8cc" }, // danger-100      / danger-800      / danger-200
  secondary:   { bg: "#ebf6ff", color: "#0d4c75", border: "#cceaff" }, // secondary-100   / secondary-900   / secondary-300
  informative: { bg: "#e5f6ff", color: "#083752", border: "#a5deff" }, // informative-100 / informative-800 / informative-200
} as const;

export type PillVariant = keyof typeof PILL_STYLES;
