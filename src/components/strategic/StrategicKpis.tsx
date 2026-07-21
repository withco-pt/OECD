"use client";

import { useMemo } from "react";
import { AgoraIcon, type AgoraIconName } from "@/components/icons/AgoraIcon";
import Reveal from "@/components/dashboard/Reveal";
import {
  type StrategicData,
  coverageMatrix,
  sharedIndicators,
} from "@/lib/strategicData";
import { scoreColor } from "./colors";

/* KPIs de topo do Panorama — enquadramento do conjunto. */

type Kpi = { label: string; icon: AgoraIconName; value: string; sub?: string };

export default function StrategicKpis({ data }: { data: StrategicData }) {
  const kpis = useMemo<Kpi[]>(() => {
    const nEntities = data.entities.length;
    const nDims = data.priorities.length;

    // Dimensões com dados em ≥1 entidade
    const cov = coverageMatrix(data);
    const dimsWithData = new Set<string>();
    for (const key of cov.keys()) dimsWithData.add(key.split("::")[1]);

    // Cobertura global: nº de células (entidade×dimensão) recolhidas / total
    const filledCells = cov.size;
    const totalCells = nEntities * nDims;
    const coveragePct = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;

    const shared = sharedIndicators(data).length;

    return [
      { label: "Entidades", icon: "book-open", value: String(nEntities), sub: "participantes" },
      {
        label: "Dimensões com dados",
        icon: "layers-menu",
        value: `${dimsWithData.size}/${nDims}`,
        sub: "da Matriz",
      },
      { label: "Indicadores partilhados", icon: "bar-chart", value: String(shared), sub: "reportados por ≥2 entidades" },
      {
        label: "Cobertura global",
        icon: "check-circle",
        value: `${coveragePct}%`,
        sub: `${filledCells} de ${totalCells} pares entidade×dimensão`,
      },
    ];
  }, [data]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-[16px]">
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
          <div className="flex items-baseline gap-[2px] mt-auto">
            <span className="text-[32px] font-bold text-primary-900 leading-[36px]">{k.value}</span>
          </div>
          {k.sub && <span className="text-[12px] text-primary-700">{k.sub}</span>}
        </Reveal>
      ))}

      {/* Legenda de cor única e transversal a todos os gráficos */}
      <Reveal
        delay={kpis.length * 80}
        className="bg-primary-100 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.1)] p-[16px] flex flex-col gap-[8px]"
      >
        <div className="flex items-center gap-[6px]">
          <AgoraIcon name="info-mark" className="size-[16px] text-primary-600 shrink-0" />
          <span className="text-[13px] font-semibold text-primary-800 leading-[16px]">Escala de cor</span>
        </div>
        <div className="flex flex-col gap-[6px] mt-auto">
          <div
            className="h-[12px] w-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${scoreColor(0)}, ${scoreColor(25)}, ${scoreColor(50)}, ${scoreColor(75)}, ${scoreColor(100)})` }}
          />
          <div className="flex items-center justify-between text-[11px] font-semibold text-primary-700">
            <span>0 · fraco</span>
            <span>100 · forte</span>
          </div>
          <div className="flex items-center gap-[6px] text-[11px] text-primary-600">
            <span className="inline-block h-[11px] w-[11px] rounded-[3px] shrink-0" style={{ background: scoreColor(null) }} />
            sem dados
          </div>
        </div>
      </Reveal>
    </div>
  );
}
