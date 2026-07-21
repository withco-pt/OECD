"use client";

import { useMemo, useState } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { useRevealed } from "@/components/dashboard/Reveal";
import EmptyChartState from "@/components/EmptyChartState";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import {
  type StrategicData,
  sharedIndicators,
  indicatorAcrossEntities,
} from "@/lib/strategicData";
import { scoreColor, BAR_NEUTRAL } from "./colors";

/* Bloco 3 — Comparação por indicador partilhado.
   Escolhe-se um indicador reportado por várias entidades e compara-se o
   desempenho entre elas (score normalizado 0–100 quando aplicável, senão
   o valor médio bruto). */

export default function SharedIndicatorCompare({ data }: { data: StrategicData }) {
  const revealed = useRevealed();
  const shared = useMemo(() => sharedIndicators(data), [data]);
  const [selectedId, setSelectedId] = useState<string>(() => {
    // arranca num indicador normalizável (comparação mais justa) reportado por mais entidades
    const firstScorable = shared.find((s) => s.scorable);
    return (firstScorable ?? shared[0])?.id ?? "";
  });

  const selected = shared.find((s) => s.id === selectedId);
  const entityName = useMemo(() => new Map(data.entities.map((e) => [e.short, e.name])), [data]);

  const ranked = useMemo(() => {
    if (!selectedId) return { scorable: false, items: [] as { entityShort: string; value: number | null; n: number }[], max: 0 };
    const { scorable, values } = indicatorAcrossEntities(data, selectedId);
    const max = Math.max(...values.map((v) => v.value ?? 0), scorable ? 100 : 0);
    const items = [...values].sort((a, b) => {
      if (a.value == null && b.value == null) return 0;
      if (a.value == null) return 1;
      if (b.value == null) return -1;
      return b.value - a.value;
    });
    return { scorable, items, max };
  }, [data, selectedId]);

  if (!shared.length) {
    return (
      <DashboardCard title="Comparação por Indicador Partilhado" subtitle="Desempenho das entidades num mesmo indicador.">
        <div className="h-[220px] flex items-center justify-center">
          <EmptyChartState title="Sem indicadores partilhados" description="Ainda não há indicadores reportados por mais do que uma entidade." />
        </div>
      </DashboardCard>
    );
  }

  const fmt = (v: number, scorable: boolean) => (scorable ? `${Math.round(v)}` : v.toFixed(1));

  return (
    <DashboardCard
      title="Comparação por Indicador Partilhado"
      subtitle={
        selected?.scorable
          ? "Score normalizado 0–100 por entidade (ponderado pelo nº de respostas)."
          : "Valor médio por entidade (ponderado pelo nº de respostas)."
      }
      help="A lista inclui apenas indicadores reportados por duas ou mais entidades. Indicadores em escalas (Likert, NPS, 1–10, Sim/Não) são convertidos para 0–100 para comparação justa; os restantes mostram o valor médio bruto."
    >
      <div className="flex flex-col gap-[14px]">
        {/* Seletor de indicador */}
        <label className="flex flex-col gap-[4px]">
          <span className="text-[12px] font-semibold text-primary-800">Indicador</span>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none rounded-[8px] border border-primary-300 bg-white px-[12px] py-[9px] pr-[36px] text-[14px] text-primary-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {shared.map((s) => (
                <option key={s.id} value={s.id}>
                  {`${s.description} · ${s.priorityName} (${s.entitiesReporting} entidades)`}
                </option>
              ))}
            </select>
            <AgoraIcon name="chevron-down" className="pointer-events-none absolute right-[12px] top-1/2 -translate-y-1/2 size-[16px] text-primary-600" />
          </div>
        </label>

        {/* Barras ordenadas */}
        <div className="flex flex-col gap-[10px]">
          {ranked.items.map((it, order) => {
            const color = ranked.scorable ? scoreColor(it.value) : BAR_NEUTRAL;
            const frac =
              it.value == null || ranked.max <= 0
                ? 0
                : ranked.scorable
                ? it.value / 100
                : it.value / ranked.max;
            return (
              <div key={it.entityShort} className="flex items-center gap-[10px]">
                <span className="w-[112px] shrink-0 text-[13px] text-primary-900 truncate" title={entityName.get(it.entityShort)}>
                  {entityName.get(it.entityShort)}
                </span>
                <div className="relative h-[22px] flex-1 rounded-[6px] bg-primary-200/70 overflow-hidden">
                  {it.value != null ? (
                    <div
                      className="absolute inset-y-0 left-0 rounded-[6px] transition-[width] duration-700 ease-out motion-reduce:transition-none"
                      style={{
                        width: revealed ? `${Math.max(frac * 100, 2)}%` : "0%",
                        background: color,
                        transitionDelay: `${order * 70}ms`,
                      }}
                    />
                  ) : null}
                </div>
                <span
                  className={`w-[58px] shrink-0 text-right text-[13px] font-bold ${it.value == null ? "text-neutral-400" : "text-primary-900"}`}
                  title={it.value == null ? "sem dados" : undefined}
                >
                  {it.value == null ? "—" : fmt(it.value, ranked.scorable)}
                  {it.value != null && ranked.scorable ? <span className="text-[11px] font-semibold text-primary-600">/100</span> : null}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}
