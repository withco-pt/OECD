"use client";

import { useMemo } from "react";
import { AgoraIcon, type AgoraIconName } from "@/components/icons/AgoraIcon";
import { type DashboardData, formatPeriod } from "@/lib/dashboardData";

/* ─────────────────────────────────────────────────────────────
   Bloco 8 — Qualidade e cobertura dos dados.
   Painel compacto de rodapé: quantos dados existem, que
   indicadores/serviços estão cobertos e qual o período mais
   recente com medições.
   ───────────────────────────────────────────────────────────── */

export default function DataQualityBlock({ data }: { data: DashboardData }) {
  const stats = useMemo(() => {
    const indicatorsWithData = new Set(data.rows.map((r) => r.indicator_id)).size;
    const servicesWithData = new Set(data.rows.map((r) => r.service_id)).size;
    const servicesWithout = data.services.length - servicesWithData;
    let latest: { y: number; m: number } | null = null;
    for (const r of data.rows) {
      const m = r.month ?? 0;
      if (!latest || r.year > latest.y || (r.year === latest.y && m > latest.m)) latest = { y: r.year, m };
    }
    return {
      total: data.rows.length,
      indicatorsWithData,
      totalIndicators: data.indicators.length,
      servicesWithout: Math.max(0, servicesWithout),
      latest: latest ? formatPeriod(latest.y, latest.m || null) : null,
    };
  }, [data]);

  const items: { icon: AgoraIconName; label: string; value: string }[] = [
    { icon: "list", label: "Medições registadas", value: String(stats.total) },
    {
      icon: "bar-chart",
      label: "Indicadores com dados",
      value: `${stats.indicatorsWithData} de ${stats.totalIndicators}`,
    },
    {
      icon: "alert-triangle",
      label: "Serviços sem medições",
      value: String(stats.servicesWithout),
    },
    { icon: "refresh-ccw", label: "Dados mais recentes", value: stats.latest ?? "—" },
  ];

  return (
    <section className="bg-primary-100 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.1)] px-[16px] py-[12px]">
      <div className="flex flex-wrap items-center gap-x-[40px] gap-y-[8px]">
        <h2 className="text-[14px] font-bold text-primary-900">Cobertura de Dados</h2>
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-[8px]">
            <AgoraIcon name={it.icon} className="size-[16px] text-primary-600 shrink-0" />
            <span className="text-[13px] text-primary-800">{it.label}:</span>
            <span className="text-[13px] font-bold text-primary-900">{it.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
