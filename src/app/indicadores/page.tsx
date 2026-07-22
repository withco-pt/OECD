"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import Pagination from "@/components/Pagination";
import { supabase } from "@/lib/supabase";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { useSelectedEntity } from "@/context/SelectedEntityContext";
import { useSelectedChannel } from "@/context/SelectedChannelContext";
import { hasCategoryData, rowsForChannel, isNonCompliant } from "@/lib/measurements";
import { indicatorTypeLabel, INDICATOR_TYPE_OPTIONS } from "@/lib/metricPill";

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
  followUpTo: string | null;
  relatedMeasures: string[] | null;
};

// Deteta perguntas de seguimento condicional ("Se sim, ...") — distintas de
// indicadores-irmão que avaliam separadamente critérios já mencionados numa
// pergunta combinada (ex.: "clareza, conhecimento, encaminhamento").
const CONDITIONAL_RE = /^\s*(se\s+(sim|n[ãa]o|afirmativo|negativo)\b|caso\s+(sim|n[ãa]o)\b)/i;

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

// Contagens categóricas: preferir a linha sem canal nem geografia (agregado do serviço).
function pickCategoryCounts(rows: MeasRow[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.geo_level === null && r.category_counts)
    ?? rows.find((r) => r.category_counts);
  return row?.category_counts ?? null;
}

export default function IndicadoresPage() {
  const { selectedService } = useSelectedService();
  const { selectedChannel } = useSelectedChannel();
  const { entity, hydrated } = useSelectedEntity();

  const [items, setItems] = useState<IndicatorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [filterMandatory, setFilterMandatory] = useState(false);
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [sortOrder, setSortOrder] = useState("Alfabeticamente");

  // Catálogo completo de indicadores + valores para o serviço ativo.
  useEffect(() => {
    if (!hydrated) return;
    let active = true;
    (async () => {
      setLoading(true); setLoadError(false);
      const { data: inds, error: indErr } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, type_of_indicator, value_scale_max, escala_descricao, target_value, target_direction, parent_indicator_id, entity_specific, thematic_priorities(name_pt, display_order)")
        .or(entity ? `entity_specific.is.null,entity_specific.eq.${entity.id}` : "entity_specific.is.null");
      if (!active) return;
      if (indErr) { console.error("[indicadores] erro:", indErr.message); setLoadError(true); setItems([]); setLoading(false); return; }

      // Valores do serviço selecionado, fatiados pelo canal escolhido na dropdown global
      // (interseção serviço + canal; canal null = todos os canais, comportamento de sempre).
      const byIndicator = new Map<string, MeasRow[]>();
      if (selectedService) {
        const { data: meas } = await supabase
          .from("measurements_catalog")
          .select("indicator_id, channel, geo_level, value, category_counts")
          .eq("service_id", selectedService.id);
        if (!active) return;
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
      }

      const descriptionById = new Map((inds ?? []).map((i) => [i.id as string, i.description as string]));

      // Indicadores-irmão (não seguimento condicional) agrupados pelo pai comum,
      // para explicar perguntas combinadas que já existem também medidas em separado.
      const siblingsByParent = new Map<string, string[]>();
      for (const i of inds ?? []) {
        const parentId = i.parent_indicator_id as string | null;
        const desc = i.description as string;
        if (!parentId || CONDITIONAL_RE.test(desc)) continue;
        if (!siblingsByParent.has(parentId)) siblingsByParent.set(parentId, []);
        siblingsByParent.get(parentId)!.push(desc);
      }

      const list: IndicatorItem[] = (inds ?? []).map((i) => {
        const tp = (i.thematic_priorities ?? {}) as { name_pt?: string; display_order?: number };
        const rows = rowsForChannel(byIndicator.get(i.id as string) ?? [], selectedChannel);
        const value = aggregateValue(rows);
        const categoryCounts = pickCategoryCounts(rows);
        const hasData = value !== null || hasCategoryData(categoryCounts);
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
          categoryCounts,
          missingData: !hasData,
          // Cumprimento Legal: indicadores de compliance são Sim/Não convertidos em
          // percentagem (100=Sim, 0=Não); < 50 = incumprimento (mesmo critério do Dashboard).
          // target_direction='below' inverte a polaridade para indicadores cuja resposta
          // desejada é "Não" (ver migration 042).
          nonCompliance: isNonCompliant(
            typeOfIndicator,
            value,
            i.target_value as number | null,
            i.target_direction as "above" | "below" | null,
          ),
          mandatory: Boolean(i.is_mandatory),
          typeLabel: indicatorTypeLabel(typeOfIndicator),
          // "Seguimento a" só se aplica a perguntas de seguimento condicional
          // ("Se sim, ..."); indicadores-irmão de uma pergunta combinada usam
          // antes a nota "Avaliação combinada" (relatedMeasures, no pai).
          followUpTo: CONDITIONAL_RE.test(i.description as string)
            ? (descriptionById.get(i.parent_indicator_id as string) ?? null)
            : null,
          relatedMeasures: siblingsByParent.get(i.id as string) ?? null,
        };
      });
      // Indicadores não-obrigatórios (fora das 9 dimensões oficiais da Matriz) só fazem
      // sentido quando têm dados reais para o serviço/canal em análise — vários foram
      // escritos a descrever um único procedimento de uma entidade específica (ex.:
      // indicadores de "Procura" da CML) e não devem aparecer nos serviços de outras
      // entidades só porque partilham a mesma tabela de indicadores. Os obrigatórios
      // continuam sempre visíveis (mesmo sem dados) para manter o alerta de
      // "Dados Incompletos"/"Fora da Matriz".
      const relevant = list.filter((i) => i.mandatory || !i.missingData);
      relevant.sort((a, b) => a.priorityOrder - b.priorityOrder || a.name.localeCompare(b.name));
      setItems(relevant);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [selectedService, selectedChannel, entity, hydrated]);

  const PRIORITIES = useMemo(() => [...new Set(items.map((i) => i.priority))].sort(), [items]);
  const METRICS = useMemo(() => [...new Set(items.map((i) => i.metric))].sort(), [items]);

  const filtered = useMemo(() => {
    const result = items.filter((i) => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedPriority && i.priority !== selectedPriority) return false;
      if (selectedMetric && i.metric !== selectedMetric) return false;
      if (selectedType && i.typeLabel !== selectedType) return false;
      if (filterMandatory && !i.mandatory) return false;
      if (filterNonCompliance && !i.nonCompliance) return false;
      if (filterMissingData && !i.missingData) return false;
      return true;
    });
    // Ordenação por valor — indicadores sem valor (dados incompletos) ficam sempre no fim.
    if (sortOrder === "Valor: maior → menor" || sortOrder === "Valor: menor → maior") {
      const dir = sortOrder === "Valor: maior → menor" ? -1 : 1;
      return [...result].sort((a, b) => {
        if (a.value == null && b.value == null) return 0;
        if (a.value == null) return 1;
        if (b.value == null) return -1;
        return (a.value - b.value) * dir;
      });
    }
    return result;
  }, [items, search, selectedPriority, selectedMetric, selectedType, filterMandatory, filterNonCompliance, filterMissingData, sortOrder]);

  const handleSearch = (value: string) => { setSearch(value); setCurrentPage(1); };
  const toggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, val: boolean) => {
    setter(!val); setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIndicators = filtered.slice(start, start + ITEMS_PER_PAGE);

  const filters = [
    {
      label: `Dimensões${selectedPriority ? ` (${selectedPriority})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="layers-menu" className="size-[14px]" />,
      value: selectedPriority,
      options: PRIORITIES,
      onChange: (v: string) => { setSelectedPriority(v); setCurrentPage(1); },
    },
    {
      label: `Métrica${selectedMetric ? ` (${selectedMetric})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="bar-chart" className="size-[14px]" />,
      value: selectedMetric,
      options: METRICS,
      onChange: (v: string) => { setSelectedMetric(v); setCurrentPage(1); },
    },
    {
      label: `Tipo de Indicador${selectedType ? ` (${selectedType})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="list" className="size-[14px]" />,
      value: selectedType,
      options: INDICATOR_TYPE_OPTIONS,
      onChange: (v: string) => { setSelectedType(v); setCurrentPage(1); },
    },
    {
      label: "Indicador da Matriz",
      icon: <AgoraIcon name="alert-circle" className="size-[14px]" />,
      active: filterMandatory,
      onToggle: () => toggle(setFilterMandatory, filterMandatory),
    },
    {
      label: "Incumprimento Legal",
      icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      onToggle: () => toggle(setFilterNonCompliance, filterNonCompliance),
    },
    {
      label: "Dados Incompletos",
      icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />,
      active: filterMissingData,
      onToggle: () => toggle(setFilterMissingData, filterMissingData),
    },
  ];

  return (
    <AppLayout>
      <div className="flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px]">
          <h1 className="text-[40px] font-bold text-primary-900">Indicadores</h1>
          <HelpTooltip size={24} label="Os Indicadores permitem medir o desempenho dos serviços públicos. Baseiam-se em normas legais, padrões de qualidade e boas práticas" />
        </div>

        <SearchAndFilters
          searchLabel="Procurar Indicadores"
          searchPlaceholder="Procure um indicador pelo nome"
          filters={filters}
          orderOptions={["Valor: maior → menor", "Valor: menor → maior"]}
          orderValue={sortOrder}
          onOrderChange={(v) => { setSortOrder(v); setCurrentPage(1); }}
          onSearch={handleSearch}
          onClearFilters={() => { setSelectedPriority(""); setSelectedMetric(""); setSelectedType(""); setFilterMandatory(false); setFilterNonCompliance(false); setFilterMissingData(false); setCurrentPage(1); }}
        />

        {loading ? (
          <div className="text-center py-[64px] text-primary-400 text-[16px]">A carregar indicadores…</div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-[8px] py-[64px] text-danger-800">
            <AgoraIcon name="alert-triangle" className="size-[24px]" />
            <span className="text-[16px] font-semibold">Não foi possível carregar os indicadores.</span>
          </div>
        ) : (
          <>
            <p className="text-[14px] text-primary-600">
              A mostrar {paginatedIndicators.length} de {filtered.length} indicadores
              {selectedService && (
                <> · serviço: <span className="font-semibold">{selectedService.name}</span></>
              )}
              {selectedChannel && (
                <> · canal: <span className="font-semibold">{selectedChannel}</span></>
              )}
            </p>

            <div className="grid grid-cols-3 gap-[20px]">
              {paginatedIndicators.map((indicator) => (
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
                  followUpTo={indicator.followUpTo}
                  relatedMeasures={indicator.relatedMeasures}
                />
              ))}
              {paginatedIndicators.length === 0 && (
                <div className="col-span-3 text-center py-[64px] text-primary-400 text-[16px]">
                  Nenhum indicador encontrado.
                </div>
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
