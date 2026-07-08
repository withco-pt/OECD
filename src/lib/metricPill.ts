// Mapeia o tipo de métrica (value_type) para o pill do card de indicador:
// rótulo curto + ícone Ágora. Os ícones agrupam por família (o conjunto
// Ágora não tem glifos únicos por tipo); o rótulo dá o tipo específico.
import type { AgoraIconName } from "@/components/icons/AgoraIcon";

export type MetricPill = { label: string; icon: AgoraIconName };

export function metricPill(valueType?: string | null, metricText?: string | null): MetricPill {
  const m = (metricText ?? "").toLowerCase();
  switch (valueType) {
    case "likert_1_5":
      return { label: "Likert 1–5", icon: "bar-chart" };
    case "scale_1_10":
      return { label: "Escala 1–10", icon: "bar-chart" };
    case "nps":
      return { label: "NPS", icon: "bar-chart" };
    case "categorical_sim_nao":
      return { label: "Sim/Não", icon: "check-circle" };
    case "categorical_agendamento":
      return { label: "Agendamento", icon: "check-circle" };
    case "integer":
      return { label: "Contagem", icon: "bar-chart" };
    case "decimal":
      if (m.includes("tempo")) return { label: "Tempo", icon: "bar-chart" };
      if (m.includes("rácio") || m.includes("racio")) return { label: "Rácio", icon: "bar-chart" };
      return { label: "Contagem", icon: "bar-chart" };
    case "text":
      return { label: "Texto", icon: "document" };
    default: {
      // Fallback: usar o prefixo do texto da escala (antes do parêntese).
      const prefix = (metricText ?? "").split("(")[0].trim();
      return { label: prefix || "Métrica", icon: "bar-chart" };
    }
  }
}
