"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import ServiceCard from "@/components/ServiceCard";
import IndicatorCard from "@/components/IndicatorCard";
import ThematicPriorityCard, { type DimensionCounts } from "@/components/ThematicPriorityCard";
import { supabase } from "@/lib/supabase";
import { useSelectedService } from "@/context/SelectedServiceContext";

type ResultType = "servicos" | "indicadores" | "prioridades";

const TYPE_FILTERS: { value: ResultType; label: string }[] = [
  { value: "servicos", label: "Serviços" },
  { value: "indicadores", label: "Indicadores" },
  { value: "prioridades", label: "Dimensões" },
];

type ServiceResult = {
  id: string;
  name: string;
  entity: string;
  area: string;
  csat: number | null;
  nResponses: number | null;
  missingData: boolean;
};

type IndicatorResult = {
  id: string;
  name: string;
  priority: string;
  metric: string;
  valueType: string | null;
  value: number | null;
  scaleMax: number | null;
  categoryCounts: Record<string, number> | null;
  missingData: boolean;
};

type PriorityResult = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  missingData: number;
  nonCompliance: number;
};

// Normaliza texto para pesquisa: minúsculas e sem acentos.
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function PriorityIcon({ src, alt, size = 50 }: { src: string | null; alt: string; size?: number }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={size} height={size} />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="img" aria-label={alt}>
      <rect x="3" y="13" width="4" height="8" rx="1" fill="#B0C8F5" />
      <rect x="10" y="8" width="4" height="13" rx="1" fill="#B0C8F5" />
      <rect x="17" y="3" width="4" height="18" rx="1" fill="#B0C8F5" />
    </svg>
  );
}

function getPriorityCounts(p: PriorityResult): DimensionCounts {
  return {
    missingData: p.missingData,
    nonCompliance: p.nonCompliance,
    underperformingOperational: 0,
    underperformingUx: 0,
  };
}

// Agrega as medições de um indicador num único valor: prefere a linha "agregada"
// real (sem canal e sem segmentação geográfica); senão, média das restantes.
// Mesmo critério usado em src/app/indicadores/page.tsx e no detalhe do indicador.
function aggregateValue(rows: { channel: string | null; geo_level: string | null; value: number | string | null }[]): number | null {
  const nullRow = rows.find((r) => r.channel === null && r.geo_level === null);
  const source = nullRow ? [nullRow] : rows;
  const nums = source
    .filter((r) => r.value !== null && r.value !== undefined)
    .map((r) => Number(r.value))
    .filter((v) => !Number.isNaN(v));
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function pickCategoryCounts(rows: { channel: string | null; geo_level: string | null; category_counts: Record<string, number> | null }[]): Record<string, number> | null {
  const row = rows.find((r) => r.channel === null && r.geo_level === null && r.category_counts)
    ?? rows.find((r) => r.category_counts);
  return row?.category_counts ?? null;
}

function PesquisaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") ?? "";
  const { selectedService } = useSelectedService();

  const [input, setInput] = useState(queryParam);
  const [activeTypes, setActiveTypes] = useState<ResultType[]>([]);

  const [allServices, setAllServices] = useState<ServiceResult[]>([]);
  const [allIndicators, setAllIndicators] = useState<IndicatorResult[]>([]);
  const [allPriorities, setAllPriorities] = useState<PriorityResult[]>([]);

  // Mantém o campo sincronizado quando a query da URL muda (ex.: navegação).
  useEffect(() => {
    setInput(queryParam);
  }, [queryParam]);

  // Catálogo completo (serviços, indicadores, dimensões) em toda a plataforma —
  // os valores de indicador mostrados refletem o serviço atualmente selecionado,
  // tal como na lista de Indicadores.
  useEffect(() => {
    let active = true;
    (async () => {
      // Serviços + CSAT (ux_csat) — mesmo critério de agregação usado no catálogo.
      const { data: svc } = await supabase
        .from("services_catalog")
        .select("id, name, entity, area, has_measurements")
        .order("name");
      if (!active) return;

      const svcIds = (svc ?? []).map((s) => s.id as string);
      const csatByService = new Map<string, { csat: number | null; n: number | null }>();
      if (svcIds.length) {
        const { data: csatIndData } = await supabase
          .from("indicators").select("id").eq("etl_column_key", "ux_csat").maybeSingle();
        const csatId = csatIndData?.id as string | undefined;
        if (csatId) {
          const { data: meas } = await supabase
            .from("measurements_catalog")
            .select("service_id, value, total_inquiridos, channel, geo_level")
            .eq("indicator_id", csatId)
            .in("service_id", svcIds);
          if (!active) return;
          const bySvcRows = new Map<string, { value: number | string | null; channel: string | null; geo_level: string | null }[]>();
          for (const m of meas ?? []) {
            const key = m.service_id as string;
            if (!bySvcRows.has(key)) bySvcRows.set(key, []);
            bySvcRows.get(key)!.push({
              value: m.value as number | string | null,
              channel: (m.channel as string | null) ?? null,
              geo_level: (m.geo_level as string | null) ?? null,
            });
          }
          for (const [serviceId, rows] of bySvcRows) {
            const nullRow = rows.find((r) => r.channel === null && r.geo_level === null) ?? rows[0];
            csatByService.set(serviceId, {
              csat: nullRow.value != null ? Number(nullRow.value) : null,
              n: null,
            });
          }
        }
      }
      setAllServices(
        (svc ?? []).map((s) => ({
          id: s.id as string,
          name: s.name as string,
          entity: (s.entity as string) ?? "",
          area: (s.area as string) ?? "—",
          csat: csatByService.get(s.id as string)?.csat ?? null,
          nResponses: csatByService.get(s.id as string)?.n ?? null,
          missingData: !s.has_measurements,
        }))
      );

      // Indicadores (catálogo completo) + valor para o serviço atualmente selecionado.
      const { data: inds } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, value_scale_max, escala_descricao, thematic_priorities(name_pt, display_order)");
      if (!active) return;

      const byIndicator = new Map<string, { channel: string | null; geo_level: string | null; value: number | string | null; category_counts: Record<string, number> | null }[]>();
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
      setAllIndicators(
        (inds ?? []).map((i) => {
          const tp = (i.thematic_priorities ?? {}) as { name_pt?: string };
          const rows = byIndicator.get(i.id as string) ?? [];
          const value = aggregateValue(rows);
          const categoryCounts = pickCategoryCounts(rows);
          return {
            id: i.id as string,
            name: i.description as string,
            priority: tp.name_pt ?? "—",
            metric: (i.escala_descricao as string) ?? "—",
            valueType: (i.value_type as string) ?? null,
            value,
            scaleMax: (i.value_scale_max as number | null) ?? null,
            categoryCounts,
            missingData: value === null && categoryCounts === null,
          };
        })
      );

      // Dimensões
      const { data: pri } = await supabase
        .from("thematic_priorities")
        .select("id, name_pt, description, icon_name")
        .order("display_order");
      if (!active) return;
      setAllPriorities(
        (pri ?? []).map((p) => ({
          id: p.id as string,
          title: p.name_pt as string,
          description: (p.description as string) ?? "",
          icon: p.icon_name ? `/icons/${p.icon_name}` : null,
          // Sem dados de incumprimento/dados-incompletos recolhidos ainda (ver docs/data-schema.md).
          missingData: 0,
          nonCompliance: 0,
        }))
      );
    })();
    return () => { active = false; };
  }, [selectedService]);

  const query = normalize(queryParam.trim());
  const hasQuery = query.length > 0;

  const results = useMemo(() => {
    if (!hasQuery) {
      return { services: [], indicators: [], priorities: [] };
    }
    return {
      services: allServices.filter(
        (s) => normalize(s.name).includes(query) || normalize(s.entity).includes(query) || normalize(s.area).includes(query)
      ),
      indicators: allIndicators.filter((i) => normalize(i.name).includes(query)),
      priorities: allPriorities.filter(
        (p) => normalize(p.title).includes(query) || normalize(p.description).includes(query)
      ),
    };
  }, [query, hasQuery, allServices, allIndicators, allPriorities]);

  const totalResults =
    results.services.length + results.indicators.length + results.priorities.length;

  const typeActive = (t: ResultType) => activeTypes.length === 0 || activeTypes.includes(t);

  const toggleType = (t: ResultType) => {
    setActiveTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const runSearch = (value: string) => {
    const trimmed = value.trim();
    router.replace(trimmed ? `/pesquisa?q=${encodeURIComponent(trimmed)}` : "/pesquisa");
  };

  const clearInput = () => {
    setInput("");
    runSearch("");
  };

  const showServices = hasQuery && typeActive("servicos") && results.services.length > 0;
  const showIndicators = hasQuery && typeActive("indicadores") && results.indicators.length > 0;
  const showPriorities = hasQuery && typeActive("prioridades") && results.priorities.length > 0;

  const visibleCount =
    (typeActive("servicos") ? results.services.length : 0) +
    (typeActive("indicadores") ? results.indicators.length : 0) +
    (typeActive("prioridades") ? results.priorities.length : 0);

  return (
    <>
      <div className="flex items-center gap-[12px] mb-[8px]">
        <h1 className="text-[40px] font-bold text-primary-900 leading-tight">Pesquisar</h1>
        <HelpTooltip size={24} label="Pesquise em toda a plataforma — serviços, indicadores e dimensões — a partir de uma única caixa de pesquisa." />
      </div>
      <p className="text-[16px] leading-[23px] text-primary-900 mb-[24px] max-w-[742px]">
        Encontre serviços, indicadores e dimensões em toda a plataforma.
      </p>

      {/* Barra de pesquisa */}
      <div className="mb-[16px]">
        <p className="text-[14px] font-semibold text-primary-900 mb-[8px]">Procurar</p>
        <div className="flex gap-[16px]">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch(input)}
              placeholder="Procure por serviços, indicadores ou dimensões"
              autoFocus
              className="w-full border border-primary-400 rounded-[8px] px-[16px] py-[12px] pr-[40px] text-[16px] text-primary-900 placeholder:text-neutral-700 focus:outline-none focus:border-primary-600"
            />
            {input && (
              <button
                onClick={clearInput}
                className="absolute right-[12px] top-1/2 -translate-y-1/2 text-neutral-700 hover:text-primary-900 transition-colors"
                aria-label="Limpar pesquisa"
              >
                <AgoraIcon name="x" className="size-[18px]" />
              </button>
            )}
          </div>
          <button
            onClick={() => runSearch(input)}
            className="bg-primary-800 text-white px-[24px] py-[12px] rounded-[8px] flex items-center gap-[8px] font-medium text-[16px] hover:bg-primary-900 transition-colors"
          >
            Procurar <AgoraIcon name="search" className="size-[18px]" />
          </button>
        </div>
      </div>

      {/* Filtro por tipo */}
      {hasQuery && (
        <div className="mb-[24px]">
          <p className="text-[14px] font-semibold text-primary-900 mb-[8px]">Filtrar por tipo</p>
          <div className="flex gap-[12px] flex-wrap items-center">
            {TYPE_FILTERS.map((f) => {
              const active = activeTypes.includes(f.value);
              return (
                <button
                  key={f.value}
                  onClick={() => toggleType(f.value)}
                  className={`flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] border transition-colors ${
                    active
                      ? "bg-white border-primary-600 text-primary-600"
                      : "bg-neutral-100 border-neutral-100 text-primary-800 hover:bg-neutral-200"
                  }`}
                >
                  {f.label}
                  {active ? (
                    <AgoraIcon name="check-circle" className="size-[16px] text-primary-600 shrink-0" />
                  ) : (
                    <span className="size-[16px] border border-neutral-800 rounded-full inline-block shrink-0" />
                  )}
                </button>
              );
            })}
            {activeTypes.length > 0 && (
              <button
                onClick={() => setActiveTypes([])}
                className="flex items-center gap-[6px] rounded-[8px] px-[12px] py-[8px] text-[14px] text-neutral-700 hover:text-primary-900 transition-colors underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Estado inicial — sem pesquisa */}
      {!hasQuery && (
        <div className="flex flex-col items-center justify-center text-center py-[80px] gap-[12px]">
          <div className="bg-primary-100 rounded-full p-[20px]">
            <AgoraIcon name="search" className="size-[40px] text-primary-600" />
          </div>
          <p className="text-[20px] font-bold text-primary-900">Comece a pesquisar</p>
          <p className="text-[16px] text-primary-800 max-w-[420px]">
            Escreva na caixa acima para encontrar serviços, indicadores e dimensões
            em toda a plataforma.
          </p>
        </div>
      )}

      {/* Sem resultados */}
      {hasQuery && totalResults === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-[80px] gap-[12px]">
          <div className="bg-neutral-100 rounded-full p-[20px]">
            <AgoraIcon name="search" className="size-[40px] text-neutral-700" />
          </div>
          <p className="text-[20px] font-bold text-primary-900">Nenhum resultado encontrado</p>
          <p className="text-[16px] text-primary-800 max-w-[420px]">
            Não encontrámos resultados para <span className="font-semibold">“{queryParam.trim()}”</span>.
            Experimente outros termos.
          </p>
        </div>
      )}

      {/* Resultados */}
      {hasQuery && totalResults > 0 && (
        <div className="flex flex-col gap-[40px]">
          <p className="text-[14px] text-primary-800">
            A mostrar <span className="font-semibold">{visibleCount}</span> de{" "}
            <span className="font-semibold">{totalResults}</span> resultados para{" "}
            <span className="font-semibold">“{queryParam.trim()}”</span>
          </p>

          {showServices && (
            <section className="flex flex-col gap-[16px]">
              <h2 className="text-[24px] font-bold text-primary-900 flex items-center gap-[8px]">
                Serviços
                <span className="text-[16px] font-medium text-primary-600">({results.services.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-[24px]">
                {results.services.map((s) => (
                  <ServiceCard
                    key={s.id}
                    id={s.id}
                    name={s.name}
                    entity={s.entity}
                    area={s.area}
                    csat={s.csat}
                    nResponses={s.nResponses}
                    missingData={s.missingData}
                  />
                ))}
              </div>
            </section>
          )}

          {showIndicators && (
            <section className="flex flex-col gap-[16px]">
              <h2 className="text-[24px] font-bold text-primary-900 flex items-center gap-[8px]">
                Indicadores
                <span className="text-[16px] font-medium text-primary-600">({results.indicators.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-[20px]">
                {results.indicators.map((i) => (
                  <IndicatorCard
                    key={i.id}
                    id={i.id}
                    name={i.name}
                    priority={i.priority}
                    metric={i.metric}
                    valueType={i.valueType}
                    value={i.value}
                    scaleMax={i.scaleMax}
                    categoryCounts={i.categoryCounts}
                    missingData={i.missingData}
                  />
                ))}
              </div>
            </section>
          )}

          {showPriorities && (
            <section className="flex flex-col gap-[16px]">
              <h2 className="text-[24px] font-bold text-primary-900 flex items-center gap-[8px]">
                Dimensões
                <span className="text-[16px] font-medium text-primary-600">({results.priorities.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-[32px]">
                {results.priorities.map((p) => (
                  <ThematicPriorityCard
                    key={p.id}
                    title={p.title}
                    description={p.description}
                    icon={<PriorityIcon src={p.icon} alt={p.title} />}
                    counts={getPriorityCounts(p)}
                    href={`/prioridades/${p.id}`}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

export default function PesquisaPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <PesquisaContent />
      </Suspense>
    </AppLayout>
  );
}
