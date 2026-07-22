"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { supabase } from "@/lib/supabase";
import { metricPill, indicatorTypeLabel, INDICATOR_TYPE_OPTIONS } from "@/lib/metricPill";
import { isNonCompliant } from "@/lib/measurements";
import SearchAndFilters from "@/components/SearchAndFilters";
import Pagination from "@/components/Pagination";
import Tooltip from "@/components/Tooltip";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const ITEMS_PER_PAGE = 9;

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
  typeLabel: string | null;
  typeOfIndicator: string | null;
};

function aggregateValue(rows: MeasRow[]): number | null {
  // Linha "agregada" real: sem canal E sem segmentação geográfica (as linhas por distrito
  // também têm channel=null, por isso é preciso excluir geo_level para não as confundir com
  // o total — mesmo critério da página de detalhe do indicador).
  const nullRow = rows.find((r) => r.channel === null && r.geo_level === null);
  const source = nullRow ? [nullRow] : rows;
  const nums = source
    .filter((r) => r.value !== null && r.value !== undefined)
    .map((r) => Number(r.value))
    .filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function pickCategoryCounts(rows: MeasRow[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.geo_level === null && r.category_counts)
    ?? rows.find((r) => r.category_counts);
  return row?.category_counts ?? null;
}

interface PopupIndicatorCardProps {
  priority: string;
  name: string;
  metric: string;
  valueType?: string | null;
  value: number | null;
  scaleMax?: number | null;
  categoryCounts?: Record<string, number> | null;
  missingData?: boolean;
  nonCompliance?: boolean;
  isCompliance?: boolean;
  onSelect: () => void;
  onDetail: () => void;
}

// Indicadores de compliance são uma resposta Sim/Não única por serviço — mostrar
// números (ex. "25 Sim / 18 Não") sugere erradamente um inquérito com várias
// respostas. Ver mesma lógica em IndicatorCard.tsx.
function CompliancePill({ categoryCounts }: { categoryCounts?: Record<string, number> | null }) {
  const sim = categoryCounts?.["Sim"] ?? 0;
  const nao = categoryCounts?.["Não"] ?? 0;
  const total = sim + nao;
  if (total === 0) return null;
  if (total === 1) {
    return (
      <Tooltip label="Resposta de conformidade (Sim/Não)">
        <div className="bg-primary-100 flex items-center h-[30px] px-[12px] rounded-full">
          <span className="text-[16px] font-bold text-primary-800">{sim === 1 ? "Sim" : "Não"}</span>
        </div>
      </Tooltip>
    );
  }
  const pct = Math.round((sim / total) * 100);
  return (
    <Tooltip label={`${sim} de ${total} serviços em conformidade`}>
      <div className="bg-primary-100 flex items-center h-[30px] px-[12px] rounded-full">
        <span className="text-[16px] font-bold text-primary-800">{pct}% Conforme</span>
      </div>
    </Tooltip>
  );
}

const DEFAULT_SCALE_MAX: Record<string, number> = { likert_1_5: 5, scale_1_10: 10 };

function PopupIndicatorCard({
  priority,
  name,
  metric,
  valueType,
  value,
  scaleMax,
  categoryCounts,
  missingData,
  nonCompliance,
  isCompliance,
  onSelect,
  onDetail,
}: PopupIndicatorCardProps) {
  const pill = metricPill(valueType, metric);
  const isSimNao = valueType === "categorical_sim_nao";
  const isScale = valueType === "likert_1_5" || valueType === "scale_1_10";
  const isNps = valueType === "nps";
  const max = scaleMax ?? DEFAULT_SCALE_MAX[valueType ?? ""] ?? null;
  const metricTip = metric && metric !== "—" ? metric : pill.label;
  return (
    <div className="group relative rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[16px] flex flex-col justify-between h-[224px] w-full transition-colors bg-primary-200 hover:bg-[#d6e3ff]">
      <div className="flex flex-col gap-[10px] w-full">
        <div className="flex flex-col gap-[12px]">
          <div className="flex gap-[4px] items-start w-full">
            <div className="flex items-center pt-[3px]">
              <img src="/icons/icon-pt.svg" alt="" className="size-[14px]" />
            </div>
            <span className="text-[14px] font-medium text-primary-700 leading-[20px] flex-1 min-w-0">
              {priority}
            </span>
          </div>
          <h3 className="text-[16px] font-bold text-primary-900 leading-[23px]">
            {name}
          </h3>
        </div>
        {/* Pills junto ao texto — sempre visíveis, sem serem tapados pelos botões no hover */}
        <div className="flex gap-[6px] items-center flex-wrap">
          {isSimNao && isCompliance ? (
            <CompliancePill categoryCounts={categoryCounts} />
          ) : isSimNao ? (
            <>
              <Tooltip label="Nº de respostas «Sim»">
                <div className="bg-primary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
                  <span className="text-[13px] font-medium text-primary-700">Sim</span>
                  <span className="text-[16px] font-bold text-primary-800">{categoryCounts?.["Sim"] ?? "–"}</span>
                </div>
              </Tooltip>
              <Tooltip label="Nº de respostas «Não»">
                <div className="bg-primary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
                  <span className="text-[13px] font-medium text-primary-700">Não</span>
                  <span className="text-[16px] font-bold text-primary-800">{categoryCounts?.["Não"] ?? "–"}</span>
                </div>
              </Tooltip>
            </>
          ) : isScale ? (
            <Tooltip label={metricTip}>
              <div className="bg-primary-100 flex gap-[8px] items-center justify-center h-[30px] px-[12px] rounded-full">
                <img src="/icons/icon-score.svg" alt="" className="w-[25px] h-[14px]" />
                <span className="text-[16px] font-bold text-primary-800">{value !== null ? `${value} / ${max}` : `– / ${max}`}</span>
              </div>
            </Tooltip>
          ) : isNps ? (
            <Tooltip label="Net Promoter Score (−100 a +100)">
              <div className="bg-primary-100 flex gap-[8px] items-center justify-center h-[30px] px-[12px] rounded-full">
                <img src="/icons/icon-score.svg" alt="" className="w-[25px] h-[14px]" />
                <span className="text-[16px] font-bold text-primary-800">{value !== null ? `NPS ${value > 0 ? "+" : ""}${value}` : "NPS –"}</span>
              </div>
            </Tooltip>
          ) : (
            <Tooltip label={metricTip}>
              <div className="bg-primary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
                <AgoraIcon name={pill.icon} className="size-[16px] text-primary-700" />
                <span className="text-[13px] font-medium text-primary-700">{pill.label}</span>
                {value !== null && <span className="text-[16px] font-bold text-primary-800">{value}</span>}
              </div>
            </Tooltip>
          )}
          {nonCompliance && (
            <Tooltip label="Indicador tem Incumprimento Legal">
              <div className="bg-danger-100 flex items-center p-[5px] rounded-full">
                <AgoraIcon name="x-circle" className="size-[20px] text-danger-800" />
              </div>
            </Tooltip>
          )}
          {missingData && (
            <Tooltip label="Indicador tem Dados Incompletos">
              <div className="bg-warning-100 flex items-center p-[5px] rounded-full">
                <AgoraIcon name="alert-triangle" className="size-[20px] text-warning-900" />
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Rodapé: botões de ação (aparecem no hover) */}
      <div className="relative h-[36px]">
        <div className="absolute inset-0 flex items-stretch gap-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onSelect}
            className="flex-1 bg-primary-800 hover:bg-primary-900 text-white rounded-[15px] flex items-center justify-center gap-[6px] text-[13px] font-medium transition-colors"
          >
            Alterar Indicador
            <AgoraIcon name="refresh-ccw" className="size-[16px]" />
          </button>
          <button
            onClick={onDetail}
            className="flex-1 bg-primary-100 border border-primary-800 text-primary-800 hover:bg-white rounded-[15px] flex items-center justify-center gap-[6px] text-[13px] font-medium transition-colors"
          >
            Ver Detalhe
            <AgoraIcon name="arrow-right-anchor" className="size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SwapIndicatorModal() {
  const { isIndicatorSwapOpen, closeIndicatorSwap, selectedService } = useSelectedService();
  const router = useRouter();

  const [items, setItems] = useState<IndicatorItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  // Bloqueia scroll do body e permite fechar com ESC enquanto o popup está aberto.
  useEffect(() => {
    if (!isIndicatorSwapOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeIndicatorSwap();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isIndicatorSwapOpen, closeIndicatorSwap]);

  // Carrega os indicadores medidos para o serviço ativo (quando o popup abre).
  useEffect(() => {
    if (!isIndicatorSwapOpen || !selectedService) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data: meas, error: measErr } = await supabase
        .from("measurements_catalog")
        .select("indicator_id, channel, geo_level, value, category_counts")
        .eq("service_id", selectedService.id);
      if (!active) return;
      if (measErr) { console.error("[alterar indicador] erro:", measErr.message); setItems([]); setLoading(false); return; }

      const ids = [...new Set((meas ?? []).map((m) => m.indicator_id as string))];
      if (ids.length === 0) { setItems([]); setLoading(false); return; }

      const { data: inds, error: indErr } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, type_of_indicator, value_scale_max, escala_descricao, target_value, target_direction, thematic_priorities(name_pt, display_order)")
        .in("id", ids);
      if (!active) return;
      if (indErr) { console.error("[alterar indicador] erro:", indErr.message); setItems([]); setLoading(false); return; }

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

      const list: IndicatorItem[] = (inds ?? []).map((i) => {
        const tp = (i.thematic_priorities ?? {}) as { name_pt?: string; display_order?: number };
        const rows = byIndicator.get(i.id as string) ?? [];
        const value = aggregateValue(rows);
        const typeOfIndicator = (i.type_of_indicator as string | null) ?? null;
        return {
          id: i.id as string,
          name: i.description as string,
          priority: tp.name_pt ?? "—",
          priorityOrder: tp.display_order ?? 99,
          metric: (i.escala_descricao as string) ?? "—",
          valueType: (i.value_type as string) ?? null,
          value,
          scaleMax: (i.value_scale_max as number | null) ?? null,
          categoryCounts: pickCategoryCounts(rows),
          missingData: false,
          nonCompliance: isNonCompliant(
            typeOfIndicator,
            value,
            i.target_value as number | null,
            i.target_direction as "above" | "below" | null,
          ),
          mandatory: Boolean(i.is_mandatory),
          typeLabel: indicatorTypeLabel(typeOfIndicator),
          typeOfIndicator,
        };
      });
      list.sort((a, b) => a.priorityOrder - b.priorityOrder || a.name.localeCompare(b.name));
      setItems(list);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [isIndicatorSwapOpen, selectedService]);

  const PRIORITIES = useMemo(() => [...new Set(items.map((i) => i.priority))].sort(), [items]);
  const METRICS = useMemo(() => [...new Set(items.map((i) => i.metric))].sort(), [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedPriority && i.priority !== selectedPriority) return false;
      if (selectedMetric && i.metric !== selectedMetric) return false;
      if (selectedType && i.typeLabel !== selectedType) return false;
      if (filterMandatory && !i.mandatory) return false;
      if (filterNonCompliance && !i.nonCompliance) return false;
      if (filterMissingData && !i.missingData) return false;
      return true;
    });
  }, [items, search, selectedPriority, selectedMetric, selectedType, filterMandatory, filterNonCompliance, filterMissingData, filterFavorites]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleIndicators = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  const handleSelect = (id: string) => {
    closeIndicatorSwap();
    router.push(`/indicadores/${id}`);
  };

  const clearFilters = () => {
    setSelectedPriority("");
    setSelectedMetric("");
    setSelectedType("");
    setFilterMandatory(false);
    setFilterNonCompliance(false);
    setFilterMissingData(false);
    setFilterFavorites(false);
    setSearch("");
    resetPage();
  };

  const filters = [
    {
      label: `Dimensões${selectedPriority ? ` (${selectedPriority})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="layers-menu" className="size-[14px]" />,
      value: selectedPriority,
      options: PRIORITIES,
      onChange: (v: string) => { setSelectedPriority(v); resetPage(); },
    },
    {
      label: `Métrica${selectedMetric ? ` (${selectedMetric})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="bar-chart" className="size-[14px]" />,
      value: selectedMetric,
      options: METRICS,
      onChange: (v: string) => { setSelectedMetric(v); resetPage(); },
    },
    {
      label: `Tipo de Indicador${selectedType ? ` (${selectedType})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="list" className="size-[14px]" />,
      value: selectedType,
      options: INDICATOR_TYPE_OPTIONS,
      onChange: (v: string) => { setSelectedType(v); resetPage(); },
    },
    {
      label: "Indicador da Matriz",
      icon: <AgoraIcon name="alert-circle" className="size-[14px]" />,
      active: filterMandatory,
      onToggle: () => { setFilterMandatory((v) => !v); resetPage(); },
    },
    {
      label: "Incumprimento Legal",
      icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      onToggle: () => { setFilterNonCompliance((v) => !v); resetPage(); },
    },
    {
      label: "Dados Incompletos",
      icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />,
      active: filterMissingData,
      onToggle: () => { setFilterMissingData((v) => !v); resetPage(); },
    },
    {
      label: "Favoritos",
      icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />,
      active: filterFavorites,
      onToggle: () => { setFilterFavorites((v) => !v); resetPage(); },
    },
  ];

  if (!isIndicatorSwapOpen || typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-[24px] bg-[rgba(2,28,81,0.45)]"
      onClick={closeIndicatorSwap}
      role="dialog"
      aria-modal="true"
      aria-label="Alterar Indicador Selecionado"
    >
      <div
        className="bg-primary-50 rounded-[16px] w-[1257px] max-w-full max-h-[90vh] flex flex-col overflow-hidden shadow-[0px_10px_40px_rgba(2,28,81,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="bg-primary-200 flex items-center justify-between px-[64px] pt-[16px] pb-[12px] shrink-0">
          <h2 className="font-semibold text-[20px] leading-[27px] text-primary-900">
            Alterar Indicador Selecionado
          </h2>
          <button
            onClick={closeIndicatorSwap}
            aria-label="Fechar"
            className="text-primary-900 hover:text-primary-600 transition-colors"
          >
            <AgoraIcon name="x" className="size-[24px]" />
          </button>
        </div>

        {/* Corpo (scroll) */}
        <div className="px-[64px] py-[32px] overflow-y-auto">
          <h3 className="font-semibold text-[24px] leading-[32px] text-primary-900 mb-[16px]">
            Indicadores
          </h3>

          <SearchAndFilters
            searchLabel="Procurar Indicadores"
            searchPlaceholder="Procure um indicador pelo nome"
            filters={filters}
            onSearch={(v) => { setSearch(v); resetPage(); }}
            onClearFilters={clearFilters}
          />

          <p className="text-[14px] text-primary-800 mt-[24px] mb-[16px]">
            A mostrar{" "}
            <span className="font-semibold">{visibleIndicators.length}</span> de{" "}
            <span className="font-semibold">{filtered.length}</span> indicadores
          </p>

          <div className="grid grid-cols-3 gap-[32px]">
            {visibleIndicators.map((indicator) => (
              <PopupIndicatorCard
                key={indicator.id}
                priority={indicator.priority}
                name={indicator.name}
                metric={indicator.metric}
                valueType={indicator.valueType}
                value={indicator.value}
                scaleMax={indicator.scaleMax}
                categoryCounts={indicator.categoryCounts}
                missingData={indicator.missingData}
                nonCompliance={indicator.nonCompliance}
                isCompliance={indicator.typeOfIndicator === "compliance"}
                onSelect={() => handleSelect(indicator.id)}
                onDetail={() => handleSelect(indicator.id)}
              />
            ))}
            {visibleIndicators.length === 0 && (
              <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
                {loading
                  ? "A carregar indicadores…"
                  : !selectedService
                  ? "Selecione um serviço primeiro."
                  : "Nenhum indicador encontrado."}
              </div>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
