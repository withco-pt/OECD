"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import ServiceCard from "@/components/ServiceCard";
import IndicatorCard from "@/components/IndicatorCard";
import ThematicPriorityCard from "@/components/ThematicPriorityCard";
import type { PriorityStatus } from "@/components/ThematicPriorityCard";
import { priorities, indicators, services } from "@/data/mock";

type ResultType = "servicos" | "indicadores" | "prioridades";

const TYPE_FILTERS: { value: ResultType; label: string }[] = [
  { value: "servicos", label: "Serviços" },
  { value: "indicadores", label: "Indicadores" },
  { value: "prioridades", label: "Prioridades Temáticas" },
];

// Normaliza texto para pesquisa: minúsculas e sem acentos.
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function PriorityIcon({ src, alt, size = 50 }: { src: string; alt: string; size?: number }) {
  return <img src={src} alt={alt} width={size} height={size} />;
}

function getPriorityStatus(p: typeof priorities[number]): PriorityStatus {
  if (p.nonCompliance > 0 && p.missingData > 0) return "both";
  if (p.nonCompliance > 0) return "non_compliance";
  if (p.missingData > 0) return "missing_data";
  return "ok";
}

function PesquisaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get("q") ?? "";

  const [input, setInput] = useState(queryParam);
  const [activeTypes, setActiveTypes] = useState<ResultType[]>([]);

  // Mantém o campo sincronizado quando a query da URL muda (ex.: navegação).
  useEffect(() => {
    setInput(queryParam);
  }, [queryParam]);

  const query = normalize(queryParam.trim());
  const hasQuery = query.length > 0;

  const results = useMemo(() => {
    if (!hasQuery) {
      return { services: [], indicators: [], priorities: [] };
    }
    return {
      services: services.filter(
        (s) => normalize(s.name).includes(query) || normalize(s.description).includes(query)
      ),
      indicators: indicators.filter(
        (i) => normalize(i.name).includes(query) || normalize(i.description).includes(query)
      ),
      priorities: priorities.filter(
        (p) => normalize(p.title).includes(query) || normalize(p.description).includes(query)
      ),
    };
  }, [query, hasQuery]);

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
        <HelpTooltip size={24} label="Pesquise em toda a plataforma — serviços, indicadores e prioridades temáticas — a partir de uma única caixa de pesquisa." />
      </div>
      <p className="text-[16px] leading-[23px] text-primary-900 mb-[24px] max-w-[742px]">
        Encontre serviços, indicadores e prioridades temáticas em toda a plataforma.
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
              placeholder="Procure por serviços, indicadores ou prioridades"
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
            Escreva na caixa acima para encontrar serviços, indicadores e prioridades
            temáticas em toda a plataforma.
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
                    missingData={s.missingData}
                    nonCompliance={s.nonCompliance}
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
                    value={i.value}
                    missingData={i.missingData}
                    nonCompliance={i.nonCompliance}
                  />
                ))}
              </div>
            </section>
          )}

          {showPriorities && (
            <section className="flex flex-col gap-[16px]">
              <h2 className="text-[24px] font-bold text-primary-900 flex items-center gap-[8px]">
                Prioridades Temáticas
                <span className="text-[16px] font-medium text-primary-600">({results.priorities.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-[32px]">
                {results.priorities.map((p) => (
                  <ThematicPriorityCard
                    key={p.id}
                    title={p.title}
                    description={p.description}
                    icon={<PriorityIcon src={p.icon} alt={p.title} />}
                    status={getPriorityStatus(p)}
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
