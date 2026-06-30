"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Breadcrumb from "@/components/Breadcrumb";
import SearchAndFilters from "@/components/SearchAndFilters";
import IndicatorCard from "@/components/IndicatorCard";
import { services, indicators } from "@/data/mock";

const ITEMS_PER_PAGE = 9;

const PRIORITIES = [...new Set(indicators.map((i) => i.priority))].sort();

const suggestions = [
  {
    title: "Automatizar a triagem de pedidos",
    description:
      "Utilizar inteligência artificial para classificar e encaminhar automaticamente os pedidos dos cidadãos, reduzindo o tempo de resposta.",
  },
  {
    title: "Criar um chatbot de apoio ao cidadão",
    description:
      "Implementar um assistente virtual que responda às perguntas mais frequentes dos utilizadores, libertando recursos humanos para casos complexos.",
  },
  {
    title: "Simplificar formulários digitais",
    description:
      "Redesenhar os formulários online com pré-preenchimento automático de dados já disponíveis, reduzindo o esforço do utilizador.",
  },
];

const tools = [
  {
    title: "Kit de Ferramentas de Design Thinking",
    description:
      "Conjunto de metodologias e templates para aplicar design thinking na melhoria de serviços públicos, incluindo mapas de empatia, jornadas de utilizador e prototipagem rápida.",
  },
  {
    title: "Guia de Simplificação Administrativa",
    description:
      "Manual prático com técnicas de simplificação de processos, eliminação de redundâncias e redução de carga administrativa para cidadãos e empresas.",
  },
  {
    title: "Framework de Medição de Impacto",
    description:
      "Metodologia para medir o impacto das inovações implementadas, com indicadores-chave e modelos de avaliação antes-depois.",
  },
];

const helpResources = [
  {
    title: "Rede de Inovadores Públicos",
    description:
      "Conecte-se com outros profissionais do setor público que estão a implementar inovações nos seus serviços. Partilhe experiências, desafios e soluções.",
  },
  {
    title: "Programa de Mentoria OCDE/OPSI",
    description:
      "Aceda a mentores especializados da OCDE e do OPSI que podem orientar a sua equipa na implementação de práticas inovadoras de prestação de serviços.",
  },
];

function ExpandableSection({
  title,
  description,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-primary-200 rounded-[10px] bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-[20px] py-[16px] text-left"
      >
        <span className="text-[16px] font-semibold text-primary-900">
          {title}
        </span>
        {open ? (
          <AgoraIcon name="chevron-up" className="size-[20px] text-primary-600" />
        ) : (
          <AgoraIcon name="chevron-down" className="size-[20px] text-primary-600" />
        )}
      </button>
      {open && (
        <div className="px-[20px] pb-[16px]">
          <p className="text-[14px] text-primary-800 leading-[22px]">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = params.id as string;
  const service = services.find((s) => s.id === serviceId);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [filterNonCompliance, setFilterNonCompliance] = useState(false);
  const [filterMissingData, setFilterMissingData] = useState(false);
  const [filterFavorites, setFilterFavorites] = useState(false);

  if (!service) {
    return (
      <AppLayout>
        <div className="text-center py-[80px]">
          <p className="text-[18px] text-primary-800">Serviço não encontrado.</p>
        </div>
      </AppLayout>
    );
  }

  const nonComplianceCount = indicators.filter((i) => i.nonCompliance).length;
  const missingDataCount = indicators.filter((i) => i.missingData).length;

  const filteredIndicators = useMemo(() => indicators.filter((i) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedPriority && i.priority !== selectedPriority) return false;
    if (filterNonCompliance && !i.nonCompliance) return false;
    if (filterMissingData && !i.missingData) return false;
    return true;
  }), [search, selectedPriority, filterNonCompliance, filterMissingData, filterFavorites]);

  const totalPages = Math.ceil(filteredIndicators.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visibleIndicators = filteredIndicators.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const indicatorFilters = [
    {
      label: "Prioridade Temática",
      isDropdown: true as const,
      value: selectedPriority,
      options: PRIORITIES,
      onChange: (v: string) => { setSelectedPriority(v); setCurrentPage(1); },
    },
    {
      label: "Incumprimento Legal",
      icon: <AgoraIcon name="x-circle" className="size-[14px] text-danger-800" />,
      active: filterNonCompliance,
      onToggle: () => { setFilterNonCompliance(!filterNonCompliance); setCurrentPage(1); },
    },
    {
      label: "Dados Incompletos",
      icon: <AgoraIcon name="alert-triangle" className="size-[14px] text-warning-900" />,
      active: filterMissingData,
      onToggle: () => { setFilterMissingData(!filterMissingData); setCurrentPage(1); },
    },
    {
      label: "Favoritos",
      icon: <AgoraIcon name="like" className="size-[14px] text-primary-600" />,
      active: filterFavorites,
      onToggle: () => { setFilterFavorites(!filterFavorites); setCurrentPage(1); },
    },
  ];

  return (
    <AppLayout>
      <Breadcrumb
        items={[
          { label: "Catálogo de Serviços", href: "/catalogo" },
          { label: "Os Meus Serviços", href: "/catalogo/meus-servicos" },
          { label: service.name },
        ]}
      />

      {/* Service Header Card */}
      <div className="bg-secondary-200 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[24px] mb-[32px] flex flex-col gap-[16px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[40px] font-bold text-primary-900 leading-tight">
            {service.name}
          </h1>
          <p className="text-[15px] text-primary-800 leading-[22px]">
            {service.description}
          </p>
        </div>

        <div className="flex items-center gap-[16px] text-[14px] text-primary-800 flex-wrap">
          <p><span className="font-semibold">Área Governamental:</span> {service.area}</p>
          <p><span className="font-semibold">Entidade:</span> {service.entity}</p>
          <p><span className="font-semibold">Departamento:</span> {service.department}</p>
        </div>

        <div className="flex items-center justify-between gap-[16px]">
          <div className="flex items-center gap-[10px] flex-wrap">
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
            <button className="flex items-center gap-[8px] bg-secondary-800 text-white rounded-full px-[20px] py-[10px] text-[14px] font-medium hover:bg-secondary-900 transition-colors">
              Alterar Serviço <AgoraIcon name="refresh-ccw" className="size-[16px]" />
            </button>
            <button className="flex items-center gap-[8px] bg-secondary-800 text-white rounded-full px-[20px] py-[10px] text-[14px] font-medium hover:bg-secondary-900 transition-colors">
              Adicionar aos Favoritos <AgoraIcon name="like" className="size-[16px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicators Section */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <h2 className="text-[28px] font-bold text-primary-900">
            Indicadores
          </h2>
        </div>

        <SearchAndFilters
          searchLabel="Procurar Indicadores"
          searchPlaceholder="Procure um indicador pelo nome"
          filters={indicatorFilters}
          onSearch={(v) => { setSearch(v); setCurrentPage(1); }}
        />

        <p className="text-[14px] text-primary-800 mt-[24px] mb-[16px]">
          A mostrar{" "}
          <span className="font-semibold">{visibleIndicators.length}</span> de{" "}
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
              value={indicator.value}
              missingData={indicator.missingData}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-[8px] mt-[32px]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="size-[40px] flex items-center justify-center rounded-[8px] bg-neutral-100 text-primary-800 hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <AgoraIcon name="chevron-left" className="size-[18px]" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`size-[40px] flex items-center justify-center rounded-[8px] text-[14px] font-medium cursor-pointer transition-colors ${
                  page === currentPage
                    ? "bg-primary-600 text-white"
                    : "bg-primary-100 text-primary-800 hover:bg-primary-200"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="size-[40px] flex items-center justify-center rounded-[8px] bg-neutral-100 text-primary-800 hover:bg-neutral-200 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <AgoraIcon name="chevron-right" className="size-[18px]" />
            </button>
          </div>
        )}
      </div>

      {/* Innovation Suggestions */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="award" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">
            Como Inovar para Melhorar o Serviço?
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-[24px]">
          {suggestions.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] border border-primary-200 p-[24px]"
            >
              <h3 className="text-[16px] font-bold text-primary-900 mb-[8px]">
                {s.title}
              </h3>
              <p className="text-[14px] text-primary-800 leading-[22px]">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="hardware-settings" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">
            Ferramentas para a Inovação
          </h2>
        </div>
        <div className="flex flex-col gap-[12px]">
          {tools.map((t) => (
            <ExpandableSection
              key={t.title}
              title={t.title}
              description={t.description}
            />
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mb-[48px]">
        <div className="flex items-center gap-[8px] mb-[24px]">
          <AgoraIcon name="help-support" className="size-[24px] text-primary-600" />
          <h2 className="text-[28px] font-bold text-primary-900">
            Obtenha Ajuda para a Inovação
          </h2>
        </div>
        <div className="flex flex-col gap-[12px]">
          {helpResources.map((h) => (
            <ExpandableSection
              key={h.title}
              title={h.title}
              description={h.description}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
