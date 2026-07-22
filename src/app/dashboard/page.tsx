"use client";

import { useEffect, useMemo, useState } from "react";
import { AgoraIcon } from "@/components/icons/AgoraIcon";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import EmptyChartState from "@/components/EmptyChartState";
import KpiTiles from "@/components/dashboard/KpiTiles";
import DimensionProfile from "@/components/dashboard/DimensionProfile";
import ServiceRanking from "@/components/dashboard/ServiceRanking";
import ChannelBlock from "@/components/dashboard/ChannelBlock";
import TrendBlock from "@/components/dashboard/TrendBlock";
import DistrictMapBlock from "@/components/dashboard/DistrictMapBlock";
import ComplianceGrid from "@/components/dashboard/ComplianceGrid";
import DataQualityBlock from "@/components/dashboard/DataQualityBlock";
import ServicesFilterBlock from "@/components/dashboard/ServicesFilterBlock";
import Reveal from "@/components/dashboard/Reveal";
import { fetchDashboardData, type DashboardData } from "@/lib/dashboardData";
import { entityLogo } from "@/lib/entityLogos";
import { useSelectedEntity } from "@/context/SelectedEntityContext";
import { useSelectedChannel } from "@/context/SelectedChannelContext";

export default function DashboardPage() {
  const { entity } = useSelectedEntity();
  const { selectedChannel } = useSelectedChannel();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Filtro local de serviço (independente do "serviço selecionado" global) —
  // reflete-se em todos os blocos do dashboard, exceto no card de contagem
  // de "Serviços com Medições", que continua a refletir a entidade inteira.
  const filteredData = useMemo(() => {
    if (!data || !selectedServiceId) return data;
    return {
      ...data,
      rows: data.rows.filter((r) => r.service_id === selectedServiceId),
      services: data.services.filter((s) => s.id === selectedServiceId),
    };
  }, [data, selectedServiceId]);

  useEffect(() => {
    if (!entity) return;
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(false);
      setSelectedServiceId(null);
      try {
        const d = await fetchDashboardData(entity.id);
        if (!active) return;
        setData(d);
      } catch (err) {
        console.error("[dashboard] erro ao carregar dados:", err);
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
  }, [entity]);

  return (
    <AppLayout hideSwapBar>
      <Reveal>
        <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 px-[28px] py-[26px] mb-[32px] shadow-[0px_8px_28px_rgba(2,28,81,0.20)]">
          {/* Marca de água decorativa (círculos concêntricos, como na página de entrada) */}
          <div className="absolute right-[-36px] top-[-46px] opacity-[0.12] pointer-events-none">
            <svg width="220" height="220" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="130" cy="130" r="100" stroke="white" strokeWidth="40" opacity="0.6" />
              <circle cx="130" cy="130" r="50" stroke="white" strokeWidth="20" opacity="0.4" />
            </svg>
          </div>

          <div className="relative z-[1] flex items-center gap-[20px]">
            {/* Distintivo com o logótipo da entidade */}
            <div className="flex items-center justify-center shrink-0 size-[72px] rounded-[14px] bg-white shadow-[0px_2px_8px_rgba(0,0,0,0.16)]">
              {entity && entityLogo(entity.id) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entityLogo(entity.id) as string}
                  alt={entity.name}
                  className="size-[52px] object-contain"
                />
              ) : (
                <span className="text-[20px] font-bold text-primary-800 tracking-[0.02em]">
                  {entity?.id.toUpperCase().slice(0, 3)}
                </span>
              )}
            </div>

            {/* Eyebrow + nome da entidade + área governamental */}
            <div className="flex flex-col gap-[4px] min-w-0">
              <div className="flex items-center gap-[8px]">
                <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-primary-300">
                  Dashboard
                </span>
                <HelpTooltip
                  size={16}
                  label="Visão geral do desempenho da entidade: satisfação dos utilizadores, perfil por dimensão, comparação entre serviços e canais, evolução temporal, distribuição geográfica e conformidade. Todos os valores são calculados a partir das medições registadas na plataforma."
                />
              </div>
              <h1 className="text-[34px] font-bold text-white leading-[1.12] truncate">
                {entity?.name}
              </h1>
              {entity?.area && (
                <span className="text-[15px] text-primary-200 leading-[1.3]">{entity.area}</span>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {loading ? (
        <div className="text-center py-[64px] text-primary-400 text-[16px]">A carregar o dashboard…</div>
      ) : loadError ? (
        <div className="flex flex-col items-center gap-[8px] py-[64px] text-danger-800">
          <AgoraIcon name="alert-triangle" className="size-[24px]" />
          <span className="text-[16px] font-semibold">Não foi possível carregar os dados do dashboard.</span>
          <span className="text-[14px] text-neutral-700">Verifique a ligação à base de dados e tente novamente.</span>
        </div>
      ) : !data || data.rows.length === 0 ? (
        <div className="py-[64px] flex items-center justify-center">
          <EmptyChartState
            title="Ainda não há medições para esta entidade"
            description="Assim que forem carregados dados de desempenho, o dashboard apresenta aqui a visão geral da entidade."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-[24px]">
          {/* Bloco 1 — KPIs */}
          <KpiTiles data={filteredData!} selectedChannel={selectedChannel} />

          {/* Bloco — Qualidade dos dados + filtro por serviço */}
          {/* z-index elevado: o dropdown do ServicesFilterBlock tem de ficar por
              cima do bloco seguinte, que de outra forma pintaria por cima dele
              (o Reveal cria o seu próprio contexto de empilhamento via transform). */}
          <Reveal className="relative z-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px] items-stretch">
              <DataQualityBlock data={filteredData!} />
              <ServicesFilterBlock
                data={data}
                selectedServiceId={selectedServiceId}
                onSelectService={setSelectedServiceId}
              />
            </div>
          </Reveal>

          {/* Blocos 2 + 3 — Perfil por dimensão e ranking de serviços */}
          <div className="flex gap-[24px] items-stretch flex-col xl:flex-row">
            <DimensionProfile data={filteredData!} selectedChannel={selectedChannel} />
            <ServiceRanking data={filteredData!} selectedChannel={selectedChannel} />
          </div>

          {/* Bloco 4 — Canais */}
          <ChannelBlock data={filteredData!} selectedChannel={selectedChannel} />

          {/* Bloco 5 — Evolução temporal */}
          <TrendBlock data={filteredData!} selectedChannel={selectedChannel} />

          {/* Blocos 6 + 7 — Mapa e conformidade */}
          <div className="flex gap-[24px] items-start flex-col xl:flex-row">
            <DistrictMapBlock data={filteredData!} />
            <ComplianceGrid data={filteredData!} />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
