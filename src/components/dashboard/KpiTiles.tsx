"use client";

import { useMemo } from "react";
import { AgoraIcon, type AgoraIconName } from "@/components/icons/AgoraIcon";
import Reveal from "./Reveal";
import {
  type DashboardData,
  type MeasurementRow,
  isAggRow,
  wavg,
  sumCategories,
  formatPeriod,
} from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 1 — KPIs da entidade.
   Satisfação global (1–10) · NPS · Taxa de resolução · Respostas
   · Serviços · Conformidade. Deltas mês-a-mês quando existem
   pelo menos dois meses de dados.
   ───────────────────────────────────────────────────────────── */

type Kpi = {
  label: string;
  icon: AgoraIconName;
  value: string | null;
  unit?: string;
  sub?: string;
  delta?: { text: string; good: boolean } | null;
};

function aggRowsFor(data: DashboardData, etlKey: string, channel: string | null): MeasurementRow[] {
  const ind = data.indicators.find((i) => i.etlKey === etlKey);
  if (!ind) return [];
  return data.rows.filter((r) => r.indicator_id === ind.id && isAggRow(r, channel));
}

/** Delta entre o último mês e o anterior (média ponderada), se existirem ≥2 meses. */
function monthDelta(rows: MeasurementRow[]): { text: string; good: boolean } | null {
  const monthly = rows.filter((r) => r.month != null);
  const keys = [...new Set(monthly.map((r) => `${r.year}-${String(r.month).padStart(2, "0")}`))].sort();
  if (keys.length < 2) return null;
  const [prevKey, lastKey] = keys.slice(-2);
  const of = (k: string) => wavg(monthly.filter((r) => `${r.year}-${String(r.month).padStart(2, "0")}` === k));
  const prev = of(prevKey);
  const last = of(lastKey);
  if (!prev || !last) return null;
  const d = last.avg - prev.avg;
  if (Math.abs(d) < 0.05) return { text: "estável vs mês anterior", good: true };
  const [y, m] = prevKey.split("-").map(Number);
  return {
    text: `${d > 0 ? "▲" : "▼"} ${Math.abs(d).toFixed(1)} vs ${formatPeriod(y, m)}`,
    good: d > 0,
  };
}

export default function KpiTiles({ data, selectedChannel }: { data: DashboardData; selectedChannel: string | null }) {
  const kpis = useMemo<Kpi[]>(() => {
    // Satisfação global (escala 1–10)
    const csatRows = aggRowsFor(data, "ux_csat", selectedChannel);
    const csat = wavg(csatRows);

    // NPS — recalculado a partir das contagens somadas (mais correto do que média de médias)
    const npsRows = aggRowsFor(data, "ux_nps", selectedChannel);
    const npsCats = sumCategories(npsRows);
    const npsTotal = (npsCats["Promotores"] ?? 0) + (npsCats["Passivos"] ?? 0) + (npsCats["Detratores"] ?? 0);
    const nps = npsTotal > 0 ? (((npsCats["Promotores"] ?? 0) - (npsCats["Detratores"] ?? 0)) / npsTotal) * 100 : null;

    // Taxa de resolução ("A situação ficou resolvida?")
    const resRows = aggRowsFor(data, "ux_resolved", selectedChannel);
    const resCats = sumCategories(resRows);
    const resTotal = (resCats["Sim"] ?? 0) + (resCats["Não"] ?? 0);
    const resolved = resTotal > 0 ? ((resCats["Sim"] ?? 0) / resTotal) * 100 : null;

    // Conformidade — % de respostas "conformes" em todos os critérios de compliance.
    // Por defeito "Sim" é a resposta conforme, mas target_direction='below' inverte
    // a polaridade para indicadores cuja resposta desejada é "Não" (ver migration 042).
    const compInds = data.indicators.filter((i) => i.typeOfIndicator === "compliance");
    let compliant = 0;
    let compTotal = 0;
    for (const ind of compInds) {
      const cats = sumCategories(data.rows.filter((r) => r.indicator_id === ind.id));
      const sim = cats["Sim"] ?? 0;
      const nao = cats["Não"] ?? 0;
      compliant += ind.targetDirection === "below" ? nao : sim;
      compTotal += sim + nao;
    }
    const compliance = compTotal > 0 ? (compliant / compTotal) * 100 : null;

    // "Matriz adotada" ainda não é preenchido em nenhuma entidade; até lá,
    // o sinal com significado real é quantos serviços já têm medições.
    const comMedicoes = data.services.filter((s) => s.hasMeasurements).length;

    return [
      {
        label: "Satisfação Global",
        icon: "award",
        value: csat ? csat.avg.toFixed(1) : null,
        unit: "/10",
        sub: csat ? `${csat.n} respostas` : undefined,
        delta: monthDelta(csatRows),
      },
      {
        label: "NPS",
        icon: "like",
        value: nps != null ? `${nps > 0 ? "+" : ""}${Math.round(nps)}` : null,
        sub: npsTotal > 0 ? `${npsTotal} respostas` : undefined,
      },
      {
        label: "Taxa de Resolução",
        icon: "check-circle",
        value: resolved != null ? Math.round(resolved).toString() : null,
        unit: "%",
        sub: resTotal > 0 ? `${resTotal} respostas` : undefined,
      },
      {
        label: "Respostas ao Questionário",
        icon: "list",
        value: csat ? String(csat.n) : null,
        sub: "satisfação global",
      },
      {
        label: "Serviços",
        icon: "book-open",
        value: String(data.services.length),
        sub: `${comMedicoes} com medições`,
      },
      {
        label: "Conformidade",
        icon: "document",
        value: compliance != null ? Math.round(compliance).toString() : null,
        unit: "%",
        sub: compTotal > 0 ? `${compTotal} critérios avaliados` : undefined,
      },
    ];
  }, [data, selectedChannel]);

  return (
    <div className="grid grid-cols-3 xl:grid-cols-6 gap-[16px]">
      {kpis.map((k, i) => (
        <Reveal
          key={k.label}
          delay={i * 80}
          className="bg-primary-100 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.1)] p-[16px] flex flex-col gap-[8px]"
        >
          <div className="flex items-center gap-[6px]">
            <AgoraIcon name={k.icon} className="size-[16px] text-primary-600 shrink-0" />
            <span className="text-[13px] font-semibold text-primary-800 leading-[16px]">{k.label}</span>
          </div>
          {k.value != null ? (
            <>
              {/* mt-auto encosta o valor e a label ao fundo, alinhando os cartões entre si */}
              <div className="flex items-baseline gap-[2px] mt-auto">
                <span className="text-[32px] font-bold text-primary-900 leading-[36px]">{k.value}</span>
                {k.unit && <span className="text-[16px] font-semibold text-primary-700">{k.unit}</span>}
              </div>
              <div className="flex flex-col gap-[2px]">
                {k.delta && (
                  <span className={`text-[12px] font-semibold ${k.delta.good ? "text-success-600" : "text-danger-800"}`}>
                    {k.delta.text}
                  </span>
                )}
                {k.sub && <span className="text-[12px] text-primary-700">{k.sub}</span>}
              </div>
            </>
          ) : (
            <span className="text-[14px] text-neutral-700 py-[8px] mt-auto">Sem dados</span>
          )}
        </Reveal>
      ))}
    </div>
  );
}
