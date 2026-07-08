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

const ITEMS_PER_PAGE = 9;

type ServiceMeta = {
  id: string;
  name: string;
  entity: string;
  area: string;
  csat: number | null;
  nResponses: number | null;
};

type MeasRow = { channel: string | null; value: number | string | null; category_counts: Record<string, number> | null };

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

// Conteúdo editorial (genérico, não específico do serviço) — mantém-se estático
// enquanto não existir na base de dados (public.innovation_suggestions está vazia).
const suggestions = [
  { title: "Automatizar a triagem de pedidos", description: "Utilizar inteligência artificial para classificar e encaminhar automaticamente os pedidos dos cidadãos, reduzindo o tempo de resposta." },
  { title: "Criar um chatbot de apoio ao cidadão", description: "Implementar um assistente virtual que responda às perguntas mais frequentes dos utilizadores, libertando recursos humanos para casos complexos." },
  { title: "Simplificar formulários digitais", description: "Redesenhar os formulários online com pré-preenchimento automático de dados já disponíveis, reduzindo o esforço do utilizador." },
];

const tools = [
  { title: "Kit de Ferramentas de Design Thinking", description: "Conjunto de metodologias e templates para aplicar design thinking na melhoria de serviços públicos, incluindo mapas de empatia, jornadas de utilizador e prototipagem rápida." },
  { title: "Guia de Simplificação Administrativa", description: "Manual prático com técnicas de simplificação de processos, eliminação de redundâncias e redução de carga administrativa para cidadãos e empresas." },
  { title: "Framework de Medição de Impacto", description: "Metodologia para medir o impacto das inovações implementadas, com indicadores-chave e modelos de avaliação antes-depois." },
];

const helpResources = [
  { title: "Rede de Inovadores Públicos", description: "Conecte-se com outros profissionais do setor público que estão a implementar inovações nos seus serviços. Partilhe experiências, desafios e soluções." },
  { title: "Programa de Mentoria OCDE/OPSI", description: "Aceda a mentores especializados da OCDE e do OPSI que podem orientar a sua equipa na implementação de práticas inovadoras de prestação de serviços." },
];

function ExpandableSection({ title, description, defaultOpen = false }: { title: string; description: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-primary-200 rounded-[10px] bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-[20px] py-[16px] text-left">
        <span className="text-[16px] font-semibold text-primary-900">{title}</span>
        {open ? <AgoraIcon name="chevron-up" className="size-[20px] text-primary-600" /> : <AgoraIcon name="chevron-down" className="size-[20px] text-primary-600" />}
      </button>
      {open && (
        <div className="px-[20px] pb-[16px]">
          <p className="text-[14px] text-primary-800 leading-[22px]">{description}</p>
        </div>
      )}
    </div>
  );
}

// Agrega as medições de um indicador num único valor:
// prefere a linha "todos os canais" (channel = null); senão, média dos canais.
function aggregateValue(rows: MeasRow[]): number | null {
  const nullRow = rows.find((r) => r.channel === null);
  const source = nullRow ? [nullRow] : rows;
  const nums = source.map((r) => Number(r.value)).filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return Math.round(avg * 100) / 100;
}

function pickCategoryCounts(rows: MeasRow[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.category_counts) ?? rows.find((r) => r.category_counts);
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
        .select("indicator_id, channel, value, category_counts, total_inquiridos")
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
        .select("id, description, is_mandatory, value_type, value_scale_max, escala_descricao, thematic_priorities(name_pt, display_order)")
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
          value: m.value as number | string | null,
          category_counts: (m.category_counts as Record<string, number> | null) ?? null,
        });
      }

      // Métricas de cabeçalho do serviço: CSAT (ux_csat = scale_1_10) e nº de respostas.
      const csatInd = (inds ?? []).find((i) => i.value_type === "scale_1_10");
      const csatVal = csatInd ? aggregateValue(byIndicator.get(csatInd.id as string) ?? []) : null;
      const inqVals = (meas ?? []).map((m) => Number(m.total_inquiridos)).filter((n) => !Number.isNaN(n));
      const nResp = inqVals.length ? Math.max(...inqVals) : null;
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
    { label: "Prioridade Temática", isDropdown: true as const, value: selectedPriority, options: PRIORITIES, onChange: (v: string) => { setSelectedPriority(v); setCurrentPage(1); } },
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

      {/* Innovation Suggestions */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="award" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">Como Inovar para Melhorar o Serviço?</h2>
        </div>
        <div className="grid grid-cols-3 gap-[24px]">
          {suggestions.map((s) => (
            <div key={s.title} className="bg-white rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] border border-primary-200 p-[24px]">
              <h3 className="text-[16px] font-bold text-primary-900 mb-[8px]">{s.title}</h3>
              <p className="text-[14px] text-primary-800 leading-[22px]">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="hardware-settings" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">Ferramentas para a Inovação</h2>
        </div>
        <div className="flex flex-col gap-[12px]">
          {tools.map((t) => (<ExpandableSection key={t.title} title={t.title} description={t.description} />))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="help-support" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">Obtenha Ajuda para a Inovação</h2>
        </div>
        <div className="flex flex-col gap-[12px]">
          {helpResources.map((h) => (<ExpandableSection key={h.title} title={h.title} description={h.description} />))}
        </div>
      </div>
    </AppLayout>
  );
}
