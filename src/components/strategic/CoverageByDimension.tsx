"use client";

import { useMemo } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import Tooltip from "@/components/Tooltip";
import { useRevealed } from "@/components/dashboard/Reveal";
import { type StrategicData, dimensionCompleteness } from "@/lib/strategicData";
import { scoreColor } from "./colors";

/* Bloco 2 — Completude da recolha por dimensão.
   Para cada dimensão, que proporção dos seus indicadores é, em média, reportada
   pelas entidades. Usa a mesma escala de cor 0–100 do resto do dashboard:
   barras mais pálidas/curtas = sub-recolha. Dimensões sem indicadores definidos
   na Matriz aparecem à parte. */

const nf1 = (n: number) => n.toLocaleString("pt-PT", { maximumFractionDigits: 1 });

export default function CoverageByDimension({ data }: { data: StrategicData }) {
  const revealed = useRevealed();
  const rows = useMemo(() => dimensionCompleteness(data), [data]);

  const total = data.entities.length;

  return (
    <DashboardCard
      title="Completude da Recolha por Dimensão"
      subtitle="Proporção média dos indicadores de cada dimensão que as entidades reportam."
      help="Para cada dimensão, mede-se quantos dos seus indicadores (definidos na Matriz) estão a ser efetivamente reportados, em média entre as entidades. Segue a mesma escala de cor 0–100 do resto do dashboard; valores baixos indicam sub-recolha. As dimensões sem indicadores definidos na Matriz aparecem com a barra vazia."
    >
      <div className="flex flex-col gap-[16px]">
        {rows.map((r) => {
          const pct = r.pct;
          const noIndicators = pct == null;
          const low = pct != null && pct < 50;
          const tip = noIndicators ? (
            <>
              Ainda sem indicadores
              <br />
              definidos na Matriz
            </>
          ) : (
            <>
              Média {nf1(r.avgFilled)} de {r.totalIndicators} indicadores
              <br />
              {r.entitiesReporting}/{total} entidades reportam
            </>
          );
          return (
            <Tooltip key={r.id} label={tip}>
              <div className="flex flex-col gap-[5px] w-full">
                <div className="flex items-baseline justify-between gap-[8px]">
                  <span className={`text-[13px] font-semibold ${noIndicators ? "text-neutral-500" : "text-primary-900"}`}>
                    {r.name}
                    {low && (
                      <span className="ml-[8px] align-middle rounded-full bg-primary-200 px-[7px] py-[1px] text-[10px] font-bold text-primary-800">
                        sub-recolha
                      </span>
                    )}
                  </span>
                  <span className={`text-[13px] font-bold shrink-0 ${noIndicators ? "text-neutral-400" : "text-primary-900"}`}>
                    {noIndicators ? "—" : `${Math.round(pct)}%`}
                  </span>
                </div>
                <div className="relative h-[14px] w-full rounded-full bg-primary-100 border border-primary-200 overflow-hidden">
                  {!noIndicators && (
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                      style={{ width: revealed ? `${Math.max(pct, 1.5)}%` : "0%", background: scoreColor(pct) }}
                    />
                  )}
                </div>
              </div>
            </Tooltip>
          );
        })}
      </div>
    </DashboardCard>
  );
}
