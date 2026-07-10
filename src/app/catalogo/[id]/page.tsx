"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Breadcrumb from "@/components/Breadcrumb";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import Tooltip from "@/components/Tooltip";
import { supabase } from "@/lib/supabase";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { ToolsForInnovationSection, GetHelpSection, type CaseStudy, type InnovationSuggestion } from "@/components/InnovationHelp";

const ITEMS_PER_PAGE = 9;

type ServiceMeta = {
  id: string;
  name: string;
  entity: string;
  area: string;
  csat: number | null;
  nResponses: number | null;
};

type MeasRow = { channel: string | null; geo_level: string | null; value: number | string | null; category_counts: Record<string, number> | null };

type IndicatorItem = {
  id: string;
  name: string;
  priority: string;
  priorityOrder: number;
  metric: string;
  valueType: string | null;
  value: number | null;
  scaleMax: number | null;
  categoryCounts: Record<string, number> | null;
  missingData: boolean;
  nonCompliance: boolean;
  mandatory: boolean;
};

// Agrega as medições de um indicador num único valor:
// prefere a linha "todos os canais" (channel = null); senão, média dos canais.
function aggregateValue(rows: MeasRow[]): number | null {
  // Linha "agregada" real: sem canal E sem segmentação geográfica (as linhas por distrito
  // também têm channel=null, por isso é preciso excluir geo_level para não as confundir com
  // o total — mesmo critério da página de detalhe do indicador).
  const nullRow = rows.find((r) => r.channel === null && r.geo_level === null);
  const source = nullRow ? [nullRow] : rows;
  const nums = source.map((r) => Number(r.value)).filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.round(avg * 100) / 100;
}

function pickCategoryCounts(rows: MeasRow[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.geo_level === null && r.category_counts)
    ?? rows.find((r) => r.category_counts);
  return row?.category_counts ?? null;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const { openSwap } = useSelectedService();

  const [service, setService] = useState<ServiceMeta | null>(null);
  const [indicatorItems, setIndicatorItems] = useState<IndicatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [suggestions, setSuggestions] = useState<(InnovationSuggestion & { dimension: string })[]>([]);
  const [caseStudies, setCaseStudies] = useState<(CaseStudy & { dimension: string })[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(false);
      setNotFound(false);

      // 1. Metadados do serviço
      const { data: svc, error: svcErr } = await supabase
        .from("services_catalog")
        .select("id, name, entity, area")
        .eq("id", serviceId)
        .maybeSingle();

      if (!active) return;
      if (svcErr) {
        console.error("[detalhe] erro ao carregar serviço:", svcErr.message);
        setLoadError(true); setLoading(false); return;
      }
      if (!svc) { setNotFound(true); setLoading(false); return; }
      setService({ id: svc.id as string, name: svc.name as string, entity: (svc.entity as string) ?? "", area: (svc.area as string) ?? "—", csat: null, nResponses: null });

      // 2. Medições do serviço
      const { data: meas, error: measErr } = await supabase
        .from("measurements_catalog")
        .select("indicator_id, channel, geo_level, value, category_counts, total_inquiridos")
        .eq("service_id", serviceId);

      if (!active) return;
      if (measErr) {
        console.error("[detalhe] erro ao carregar medições:", measErr.message);
        setLoadError(true); setLoading(false); return;
      }

      const ids = [...new Set((meas ?? []).map((m) => m.indicator_id as string))];
      if (ids.length === 0) { setIndicatorItems([]); setLoading(false); return; }

      // 3. Catálogo de indicadores (dimensão via embed)
      const { data: inds, error: indErr } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, value_scale_max, escala_descricao, thematic_priority_id, thematic_priorities(name_pt, display_order)")
        .in("id", ids);

      if (!active) return;
      if (indErr) {
        console.error("[detalhe] erro ao carregar indicadores:", indErr.message);
        setLoadError(true); setLoading(false); return;
      }

      const byIndicator = new Map<string, MeasRow[]>();
      for (const m of meas ?? []) {
        const key = m.indicator_id as string;
        if (!byIndicator.has(key)) byIndicator.set(key, []);
        byIndicator.get(key)!.push({
          channel: (m.channel as string | null) ?? null,
          geo_level: (m.geo_level as string | null) ?? null,
          value: m.value as number | string | null,
          category_counts: (m.category_counts as Record<string, number> | null) ?? null,
        });
      }

      // Métricas de cabeçalho do serviço: CSAT (ux_csat) e nº de respostas — mesmo indicador
      // oficial (etl_column_key) usado em SelectedServiceContext/catalogo, não qualquer
      // indicador de escala 1-10 do serviço.
      const { data: csatIndData } = await supabase
        .from("indicators").select("id").eq("etl_column_key", "ux_csat").maybeSingle();
      if (!active) return;
      const csatId = csatIndData?.id as string | undefined;
      const csatRows = csatId ? (meas ?? []).filter((m) => m.indicator_id === csatId) : [];
      // Linha "agregada" real: sem canal E sem segmentação geográfica.
      const csatNullRow = csatRows.find((r) => r.channel === null && r.geo_level === null) ?? csatRows[0];
      const csatVal = csatNullRow?.value != null ? Number(csatNullRow.value) : null;
      const nResp = csatNullRow ? ((csatNullRow.total_inquiridos as number | null) ?? null) : null;
      setService((prev) => (prev ? { ...prev, csat: csatVal, nResponses: nResp } : prev));

      const items: IndicatorItem[] = (inds ?? []).map((i) => {
        const tp = (i.thematic_priorities ?? {}) as { name_pt?: string; display_order?: number };
        const rows = byIndicator.get(i.id as string) ?? [];
        return {
          id: i.id as string,
          name: i.description as string,
          priority: tp.name_pt ?? "—",
          priorityOrder: tp.display_order ?? 99,
          metric: (i.escala_descricao as string) ?? "—",
          valueType: (i.value_type as string) ?? null,
          value: aggregateValue(rows),
          scaleMax: (i.value_scale_max as number | null) ?? null,
          categoryCounts: pickCategoryCounts(rows),
          missingData: false,
          nonCompliance: false,
          mandatory: Boolean(i.is_mandatory),
        };
      });

      items.sort((a, b) => a.priorityOrder - b.priorityOrder || a.name.localeCompare(b.name));
      setIndicatorItems(items);

      // Dimensões relevantes a este serviço (as dos seus indicadores medidos), ordenadas
      // por display_order — usadas para escolher, de seguida, 3 dimensões diferentes tanto
      // para "Como Melhorar o Serviço?" como para os Casos de Estudo do OPSI.
      const dimensionsMap = new Map<string, { name: string; order: number }>();
      for (const i of inds ?? []) {
        const tpId = i.thematic_priority_id as string | null;
        const tp = (i.thematic_priorities ?? {}) as { name_pt?: string; display_order?: number };
        if (tpId && !dimensionsMap.has(tpId)) {
          dimensionsMap.set(tpId, { name: tp.name_pt ?? "—", order: tp.display_order ?? 99 });
        }
      }
      const orderedDimensionIds = [...dimensionsMap.keys()].sort(
        (a, b) => dimensionsMap.get(a)!.order - dimensionsMap.get(b)!.order
      );

      if (orderedDimensionIds.length) {
        // "Como Melhorar o Serviço?" — 1 sugestão de cada uma de até 3 dimensões diferentes.
        const { data: allSugg } = await supabase
          .from("innovation_suggestions")
          .select("id, title, description, saber_mais_url, thematic_priority_id, display_order")
          .in("thematic_priority_id", orderedDimensionIds)
          .order("display_order");
        if (!active) return;
        const suggByDim = new Map<string, { id: string; title: string; description: string; saber_mais_url: string | null }>();
        for (const s of allSugg ?? []) {
          const tpId = s.thematic_priority_id as string;
          if (!suggByDim.has(tpId)) {
            suggByDim.set(tpId, {
              id: s.id as string,
              title: s.title as string,
              description: s.description as string,
              saber_mais_url: (s.saber_mais_url as string | null) ?? null,
            });
          }
        }
        setSuggestions(
          orderedDimensionIds
            .filter((id) => suggByDim.has(id))
            .slice(0, 3)
            .map((id) => {
              const s = suggByDim.get(id)!;
              return { id: s.id, title: s.title, description: s.description, link: s.saber_mais_url, dimension: dimensionsMap.get(id)!.name };
            })
        );

        // Casos de Estudo do OPSI — 3 exemplos de até 3 dimensões diferentes.
        const { data: allCSRows } = await supabase
          .from("case_study_thematic_priorities")
          .select("thematic_priority_id, case_studies(id, country, title, external_url, display_order)")
          .in("thematic_priority_id", orderedDimensionIds);
        if (!active) return;
        const csByDim = new Map<string, { id: string; country: string; title: string; external_url: string | null; display_order: number | null }>();
        for (const row of allCSRows ?? []) {
          const tpId = row.thematic_priority_id as string;
          const csRaw = row.case_studies as unknown as
            | { id: string; country: string; title: string; external_url: string | null; display_order: number | null }
            | { id: string; country: string; title: string; external_url: string | null; display_order: number | null }[]
            | null;
          const cs = Array.isArray(csRaw) ? csRaw[0] : csRaw;
          if (!cs) continue;
          const existing = csByDim.get(tpId);
          if (!existing || (cs.display_order ?? 999) < (existing.display_order ?? 999)) {
            csByDim.set(tpId, cs);
          }
        }
        setCaseStudies(
          orderedDimensionIds
            .filter((id) => csByDim.has(id))
            .slice(0, 3)
            .map((id) => {
              const cs = csByDim.get(id)!;
              return {
                id: cs.id,
                title: cs.title,
                country: cs.country,
                externalUrl: cs.external_url,
                dimension: dimensionsMap.get(id)!.name,
              };
            })
        );
      } else {
        setSuggestions([]);
        setCaseStudies([]);
      }

      setLoading(false);
    })();
    return () => { active = false; };
  }, [serviceId]);

  const PRIORITIES = useMemo(
    () => [...new Set(indicatorItems.map((i) => i.priority))].sort(),
    [indicatorItems]
  );

  const nonComplianceCount = useMemo(() => indicatorItems.filter((i) => i.nonCompliance).length, [indicatorItems]);
  const missingDataCount = useMemo(() => indicatorItems.filter((i) => i.missingData).length, [indicatorItems]);

  const filteredIndicators = useMemo(() => indicatorItems.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedPriority && i.priority !== selectedPriority) return false;
    if (filterNonCompliance && !i.nonCompliance) return false;
    if (filterMissingData && !i.missingData) return false;
    return true;
  }), [indicatorItems, search, selectedPriority, filterNonCompliance, filterMissingData, filterFavorites]);

  const totalPages = Math.ceil(filteredIndicators.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleIndicators = filteredIndicators.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const indicatorFilters = [
    { label: "Dimensão", isDropdown: true as const, value: selectedPriority, options: PRIORITIES, onChange: (v: string) => { setSelectedPriority(v); setCurrentPage(1); } },
    { label: "Incumprimento Legal", icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />, active: filterNonCompliance, onToggle: () => { setFilterNonCompliance(!filterNonCompliance); setCurrentPage(1); } },
    { label: "Dados Incompletos", icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />, active: filterMissingData, onToggle: () => { setFilterMissingData(!filterMissingData); setCurrentPage(1); } },
    { label: "Favoritos", icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />, active: filterFavorites, onToggle: () => { setFilterFavorites(!filterFavorites); setCurrentPage(1); } },
  ];

  // Estados de carregamento / erro / não encontrado
  if (loading) {
    return (
      <AppLayout hideSwapBar>
        <div className="text-center py-[80px] text-primary-400 text-[16px]">A carregar serviço…</div>
      </AppLayout>
    );
  }
  if (loadError) {
    return (
      <AppLayout hideSwapBar>
        <div className="flex flex-col items-center gap-[8px] py-[80px] text-danger-800">
          <AgoraIcon name="alert-triangle" className="size-[24px]" />
          <span className="text-[16px] font-semibold">Não foi possível carregar o serviço.</span>
          <span className="text-[14px] text-neutral-700">Verifique a ligação à base de dados e tente novamente.</span>
        </div>
      </AppLayout>
    );
  }
  if (notFound || !service) {
    return (
      <AppLayout hideSwapBar>
        <div className="text-center py-[80px]">
          <p className="text-[18px] text-primary-800">Serviço não encontrado.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout hideSwapBar>
      <Breadcrumb
        items={[
          { label: "Catálogo de Serviços", href: "/catalogo" },
          { label: "Todos os Serviços", href: "/catalogo" },
          { label: service.name },
        ]}
      />

      {/* Service Header Card */}
      <div className="bg-secondary-200 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[24px] mb-[32px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[40px] font-bold text-primary-900 leading-tight">{service.name}</h1>
        </div>

        <div className="flex items-center gap-[16px] text-[14px] text-primary-800 flex-wrap">
          <p><span className="font-semibold">Área Governamental:</span> {service.area}</p>
          <p><span className="font-semibold">Entidade:</span> {service.entity}</p>
        </div>

        <div className="flex items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[10px] flex-wrap">
            <Tooltip label="Satisfação global média (escala 1–10)">
              <div className="bg-secondary-300 flex gap-[8px] items-center h-[40px] px-[16px] rounded-full">
                <AgoraIcon name="like" className="size-[20px] text-secondary-900" />
                <span className="text-[15px] font-medium text-primary-700">CSAT</span>
                <span className="text-[18px] font-bold text-primary-900">{service.csat != null ? service.csat.toLocaleString("pt-PT") : "–"}</span>
              </div>
            </Tooltip>
            <Tooltip label="Número de respostas ao questionário">
              <div className="bg-secondary-300 flex gap-[8px] items-center h-[40px] px-[16px] rounded-full">
                <span className="text-[18px] font-bold text-primary-900">{service.nResponses != null ? service.nResponses.toLocaleString("pt-PT") : "–"}</span>
                <span className="text-[15px] font-medium text-primary-700">respostas</span>
              </div>
            </Tooltip>
            <Tooltip label="Número de indicadores monitorizados neste serviço">
              <div className="bg-secondary-300 flex gap-[8px] items-center h-[40px] px-[16px] rounded-full">
                <AgoraIcon name="bar-chart" className="size-[20px] text-secondary-900" />
                <span className="text-[18px] font-bold text-primary-900">{indicatorItems.length}</span>
                <span className="text-[15px] font-medium text-primary-700">indicadores</span>
              </div>
            </Tooltip>
            {nonComplianceCount > 0 && (
              <div className="bg-danger-100 flex items-center gap-[6px] px-[10px] py-[5px] rounded-full">
                <AgoraIcon name="x-circle" className="size-[16px] text-danger-800" />
                <span className="text-[13px] font-medium text-danger-800">
                  {nonComplianceCount} Indicador{nonComplianceCount !== 1 ? "es" : ""} em Incumprimento Legal
                </span>
              </div>
            )}
            {missingDataCount > 0 && (
              <div className="bg-warning-100 flex items-center gap-[6px] px-[10px] py-[5px] rounded-full">
                <AgoraIcon name="alert-triangle" className="size-[16px] text-warning-900" />
                <span className="text-[13px] font-medium text-warning-900">
                  {missingDataCount} Indicador{missingDataCount !== 1 ? "es" : ""} com Dados Incompletos
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-[12px] shrink-0">
            <button onClick={openSwap} className="flex items-center gap-[8px] bg-secondary-800 text-white rounded-full px-[20px] py-[10px] text-[14px] font-medium hover:bg-secondary-900 transition-colors">
              Alterar Serviço <AgoraIcon name="refresh-ccw" className="size-[16px]" />
            </button>
            <button disabled className="flex items-center gap-[8px] bg-neutral-100 text-neutral-400 rounded-full px-[20px] py-[10px] text-[14px] font-medium cursor-not-allowed">
              Adicionar aos Favoritos <AgoraIcon name="like" className="size-[16px] text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicators Section */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <h2 className="text-[28px] font-bold text-primary-900">Indicadores</h2>
        </div>

        <SearchAndFilters
          searchLabel="Procurar Indicadores"
          searchPlaceholder="Procure um indicador pelo nome"
          filters={indicatorFilters}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
        />

        <p className="text-[14px] text-primary-800 mt-[24px] mb-[16px]">
          A mostrar <span className="font-semibold">{visibleIndicators.length}</span> de{" "}
          <span className="font-semibold">{filteredIndicators.length}</span> indicadores
        </p>

        <div className="grid grid-cols-3 gap-[24px]">
          {visibleIndicators.map((indicator) => (
            <IndicatorCard
              key={indicator.id}
              id={indicator.id}
              name={indicator.name}
              priority={indicator.priority}
              metric={indicator.metric}
              valueType={indicator.valueType}
              value={indicator.value}
              scaleMax={indicator.scaleMax}
              categoryCounts={indicator.categoryCounts}
              missingData={indicator.missingData}
              nonCompliance={indicator.nonCompliance}
              mandatory={indicator.mandatory}
            />
          ))}
          {visibleIndicators.length === 0 && (
            <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
              Este serviço ainda não tem indicadores com dados.
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] mt-[32px]">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="size-[40px] flex items-center justify-center rounded-[8px] bg-neutral-100 text-primary-800 hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <AgoraIcon name="chevron-left" className="size-[18px]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`size-[40px] flex items-center justify-center rounded-[8px] text-[14px] font-medium cursor-pointer transition-colors ${page === currentPage ? "bg-primary-600 text-white" : "bg-primary-100 text-primary-800 hover:bg-primary-200"}`}>
                {page}
              </button>
            ))}
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="size-[40px] flex items-center justify-center rounded-[8px] bg-neutral-100 text-primary-800 hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              <AgoraIcon name="chevron-right" className="size-[18px]" />
            </button>
          </div>
        )}
      </div>

      {/* Innovation Suggestions — 1 sugestão de cada uma de até 3 dimensões diferentes do serviço */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="award" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">Como Melhorar o Serviço?</h2>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-[13px] text-primary-400">Ainda não há boas práticas de inovação para as dimensões deste serviço.</p>
        ) : (
          <div className="grid grid-cols-3 gap-[24px]">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] border border-primary-200 p-[24px] flex flex-col gap-[8px]">
                <span className="inline-flex items-center gap-[6px] text-[12px] font-medium text-primary-600">
                  <AgoraIcon name="layers-menu" size={13} />
                  {s.dimension}
                </span>
                <h3 className="text-[16px] font-bold text-primary-900">{s.title}</h3>
                <p className="text-[14px] text-primary-800 leading-[22px]">{s.description}</p>
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-[6px] text-[13px] font-medium text-primary-700 hover:text-primary-900 transition-colors mt-auto pt-[8px]"
                  >
                    Saber Mais <AgoraIcon name="arrow-right-anchor" size={13} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tools for Innovation — idêntico ao detalhe do indicador; Casos de Estudo com
         3 exemplos de até 3 dimensões diferentes do serviço */}
      <ToolsForInnovationSection caseStudies={caseStudies} />

      {/* Get Help — idêntico ao detalhe do indicador */}
      <GetHelpSection />
    </AppLayout>
  );
}
