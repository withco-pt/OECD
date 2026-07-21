"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import StrategicKpis from "@/components/strategic/StrategicKpis";
import DimensionHeatmap from "@/components/strategic/DimensionHeatmap";
import CoverageByDimension from "@/components/strategic/CoverageByDimension";
import SharedIndicatorCompare from "@/components/strategic/SharedIndicatorCompare";
import CollectionMaturity from "@/components/strategic/CollectionMaturity";
import { fetchStrategicData, type StrategicData } from "@/lib/strategicData";

export default function PanoramaPage() {
  const [data, setData] = useState<StrategicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const d = await fetchStrategicData();
        if (!active) return;
        setData(d);
      } catch (err) {
        console.error("[panorama] erro ao carregar dados:", err);
        if (!active) return;
        setLoadError(true);
        setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "rgb(247,248,250)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "rgb(3,74,216)", padding: "40px 0 48px" }}>
        <div className="absolute right-[-40px] top-[-40px] opacity-10 pointer-events-none">
          <svg width="240" height="240" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="130" cy="130" r="100" stroke="white" strokeWidth="40" opacity="0.6" />
            <circle cx="130" cy="130" r="50" stroke="white" strokeWidth="20" opacity="0.4" />
          </svg>
        </div>
        <div className="max-w-[1120px] mx-auto px-[32px] relative z-[1]">
          <Link
            href="/entrada"
            className="inline-flex items-center gap-[6px] text-white/90 hover:text-white text-[14px] font-semibold mb-[16px]"
          >
            <AgoraIcon name="chevron-left" className="size-[16px]" />
            Voltar à seleção de entidade
          </Link>
          <h1 className="text-white font-bold" style={{ fontSize: 32, lineHeight: 1.15, margin: 0 }}>
            Panorama Estratégico
          </h1>
          <p className="text-white/85 mt-[8px]" style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 720 }}>
            Comparação de desempenho entre entidades participantes e leitura da maturidade da recolha de dados.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-[1120px] mx-auto px-[32px] py-[32px]">
        {loading ? (
          <div className="text-center py-[80px] text-primary-400 text-[16px]">A carregar panorama…</div>
        ) : loadError ? (
          <div className="text-center py-[80px]">
            <p className="text-danger-700 text-[16px] font-semibold">Não foi possível carregar os dados.</p>
            <p className="text-primary-400 text-[14px] mt-[4px]">Verifique a ligação e tente novamente.</p>
          </div>
        ) : !data || data.entities.length === 0 ? (
          <div className="text-center py-[80px] text-primary-400 text-[16px]">Não há entidades para comparar.</div>
        ) : (
          <div className="flex flex-col gap-[24px]">
            <StrategicKpis data={data} />
            <DimensionHeatmap data={data} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-[24px] items-start">
              <CoverageByDimension data={data} />
              <SharedIndicatorCompare data={data} />
            </div>
            <CollectionMaturity data={data} />

            <p className="text-[12px] text-primary-400 text-center pt-[8px]">
              Dados agregados ao nível de cada entidade (todos os serviços, sem segmentação por canal). Scores normalizados para escala 0–100.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
