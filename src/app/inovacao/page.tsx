"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { Suspense, useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import HelpTooltip from "@/components/HelpTooltip";
import SearchAndFilters from "@/components/SearchAndFilters";
import {
  SuggestionCard,
  CaseStudyCard,
  ExpandableRow,
  AccessButton,
  DoubleDiamondDiagram,
  LivroAmareloLogo,
  TOOLKIT_URL,
  OPSI_URL,
} from "@/components/InnovationHelp";
import { supabase } from "@/lib/supabase";

type SuggestionItem = {
  id: string;
  title: string;
  description: string;
  link: string | null;
  dimension: string;
  dimensionOrder: number;
  order: number;
};

type CaseStudyItem = {
  id: string;
  title: string;
  country: string;
  externalUrl: string | null;
  dimension: string;
  dimensionOrder: number;
  order: number;
};

// A resposta dos embeds do Supabase pode vir como objeto ou array — normaliza.
function firstOf<T>(v: T | T[] | null | undefined): T | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function InovacaoContent() {
  const searchParams = useSearchParams();

  const [dimensions, setDimensions] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedDimension, setSelectedDimension] = useState(searchParams.get("dimensao") ?? "");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setLoadError(false);

      // As 9 dimensões da matriz — para as opções do filtro (mesmo as que não têm dados).
      const { data: dims, error: dimErr } = await supabase
        .from("thematic_priorities")
        .select("name_pt, display_order")
        .order("display_order");

      // Recursos de inovação (sugestões "como inovar"), associados a uma dimensão.
      const { data: sugg, error: suggErr } = await supabase
        .from("innovation_suggestions")
        .select("id, title, description, saber_mais_url, display_order, thematic_priorities(name_pt, display_order)")
        .order("display_order");

      // Casos de estudo do OPSI — relação muitos-para-muitos com as dimensões.
      // Uma entrada por par (caso, dimensão), para que o filtro por dimensão seja exato.
      const { data: cs, error: csErr } = await supabase
        .from("case_study_thematic_priorities")
        .select("thematic_priorities(name_pt, display_order), case_studies(id, title, country, external_url, display_order)");

      if (!active) return;

      if (dimErr || suggErr || csErr) {
        console.error("[inovacao] erro ao carregar:", dimErr?.message, suggErr?.message, csErr?.message);
        setLoadError(true);
        setLoading(false);
        return;
      }

      setDimensions((dims ?? []).map((d) => d.name_pt as string));

      const mappedSugg: SuggestionItem[] = (sugg ?? []).map((s) => {
        const tp = firstOf(s.thematic_priorities as { name_pt: string; display_order: number } | { name_pt: string; display_order: number }[]);
        return {
          id: s.id as string,
          title: s.title as string,
          description: s.description as string,
          link: (s.saber_mais_url as string | null) ?? null,
          dimension: tp?.name_pt ?? "",
          dimensionOrder: tp?.display_order ?? 999,
          order: (s.display_order as number | null) ?? 999,
        };
      });
      mappedSugg.sort((a, b) => a.dimensionOrder - b.dimensionOrder || a.order - b.order);
      setSuggestions(mappedSugg);

      const mappedCs: CaseStudyItem[] = (cs ?? [])
        .map((row) => {
          const tp = firstOf(row.thematic_priorities as { name_pt: string; display_order: number } | { name_pt: string; display_order: number }[]);
          const study = firstOf(row.case_studies as { id: string; title: string; country: string; external_url: string | null; display_order: number | null } | { id: string; title: string; country: string; external_url: string | null; display_order: number | null }[]);
          if (!study) return null;
          return {
            id: `${study.id}|${tp?.name_pt ?? ""}`,
            title: study.title,
            country: study.country,
            externalUrl: study.external_url ?? null,
            dimension: tp?.name_pt ?? "",
            dimensionOrder: tp?.display_order ?? 999,
            order: study.display_order ?? 999,
          };
        })
        .filter((x): x is CaseStudyItem => x !== null);
      mappedCs.sort((a, b) => a.dimensionOrder - b.dimensionOrder || a.order - b.order);
      setCaseStudies(mappedCs);

      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const matches = (title: string, dimension: string) => {
    if (selectedDimension && dimension !== selectedDimension) return false;
    if (search && !title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  };

  const filteredSuggestions = useMemo(
    () => suggestions.filter((s) => matches(s.title, s.dimension)),
    [suggestions, search, selectedDimension]
  );
  const filteredCaseStudies = useMemo(
    () => caseStudies.filter((c) => matches(c.title, c.dimension)),
    [caseStudies, search, selectedDimension]
  );

  const filters = [
    {
      label: `Dimensão${selectedDimension ? ` (${selectedDimension})` : ""}`,
      isDropdown: true as const,
      icon: <AgoraIcon name="layers-menu" className="size-[14px]" />,
      value: selectedDimension,
      options: dimensions,
      onChange: (v: string) => setSelectedDimension(v),
    },
  ];

  return (
    <div className="flex flex-col gap-[24px]">
        <div className="flex items-center gap-[12px]">
          <h1 className="text-[40px] font-bold text-primary-900">Inovação</h1>
          <HelpTooltip
            size={24}
            label="Repositório de recursos de inovação e casos de estudo internacionais, organizados pelas 9 dimensões da Matriz. Use-os para inspirar ideias e boas práticas de melhoria dos serviços públicos."
          />
        </div>

        <p className="text-[16px] leading-[23px] text-primary-900 max-w-[742px]">
          Explore recursos sobre como inovar e casos de estudo do OPSI (Observatório de Inovação
          do Setor Público) para cada dimensão da Matriz. Filtre por dimensão para encontrar
          exemplos e boas práticas relevantes para o seu serviço.
        </p>

        <SearchAndFilters
          searchLabel="Procurar por título"
          searchPlaceholder="Procure um recurso ou caso de estudo pelo título"
          filters={filters}
          onSearch={setSearch}
          onClearFilters={() => { setSelectedDimension(""); setSearch(""); }}
        />

        {loading ? (
          <div className="text-center py-[64px] text-primary-400 text-[16px]">A carregar recursos de inovação…</div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-[8px] py-[64px] text-danger-800">
            <AgoraIcon name="alert-triangle" className="size-[24px]" />
            <span className="text-[16px] font-semibold">Não foi possível carregar os recursos de inovação.</span>
          </div>
        ) : (
          <>
            {/* Recursos de inovação (Como Inovar) */}
            <section>
              <div className="flex items-center gap-[8px] mb-[16px]">
                <h2 className="text-[22px] font-bold text-primary-900">Como Inovar</h2>
                <span className="text-[14px] font-medium text-primary-600">({filteredSuggestions.length})</span>
              </div>
              {filteredSuggestions.length > 0 ? (
                <div className="grid grid-cols-3 gap-[16px]">
                  {filteredSuggestions.map((s) => (
                    <SuggestionCard
                      key={s.id}
                      title={s.title}
                      description={s.description}
                      link={s.link}
                      dimension={s.dimension}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-primary-400 text-[15px] py-[24px]">
                  Ainda não há recursos de inovação para esta dimensão.
                </p>
              )}
            </section>

            {/* Casos de Estudo do OPSI */}
            <section>
              <div className="flex items-center gap-[8px] mb-[8px]">
                <h2 className="text-[22px] font-bold text-primary-900">
                  Casos de Estudo do OPSI – Observatório de Inovação do Setor Público
                </h2>
                <span className="text-[14px] font-medium text-primary-600">({filteredCaseStudies.length})</span>
              </div>
              <p className="text-[15px] text-primary-700 mb-[16px] max-w-[742px]">
                Casos de estudo internacionais relacionados com as dimensões da Matriz, para
                estimular ideias e demonstrar diferentes potenciais abordagens.
              </p>
              {filteredCaseStudies.length > 0 ? (
                <div className="flex flex-col gap-[16px]">
                  <div className="grid grid-cols-3 gap-[16px]">
                    {filteredCaseStudies.map((c) => (
                      <CaseStudyCard
                        key={c.id}
                        title={c.title}
                        country={c.country}
                        dimension={c.dimension}
                        externalUrl={c.externalUrl}
                      />
                    ))}
                  </div>
                  <AccessButton href={OPSI_URL}>Aceder ao OPSI</AccessButton>
                </div>
              ) : (
                <p className="text-primary-400 text-[15px] py-[24px]">
                  Ainda não há casos de estudo para esta dimensão.
                </p>
              )}
            </section>

            {/* Outras ferramentas de inovação (transversais a todas as dimensões) */}
            <section>
              <h2 className="text-[22px] font-bold text-primary-900 mb-[16px]">
                Outras Ferramentas para a Inovação
              </h2>
              <div className="space-y-[8px]">
                <ExpandableRow title="Acelerador de Inovação nos Serviços Públicos">
                  <div className="flex gap-[24px] items-center flex-wrap">
                    <div className="flex-1 min-w-[280px] flex flex-col gap-[16px]">
                      <p>
                        O Acelerador de Inovação nos Serviços Públicos é uma ferramenta reutilizável e de
                        autoaplicação que capacita os profissionais da administração pública a aplicarem a
                        inovação no desenho e na prestação de serviços. A ferramenta está estruturada em
                        sete etapas sequenciais, cada uma contendo modelos, guias de utilização e dicas
                        sobre como alcançar resultados eficazes na aplicação da inovação para melhorar os
                        serviços públicos.
                      </p>
                      <AccessButton href={TOOLKIT_URL}>Aceder ao Toolkit</AccessButton>
                    </div>
                    <div className="w-[300px] shrink-0">
                      <DoubleDiamondDiagram />
                    </div>
                  </div>
                </ExpandableRow>

                <ExpandableRow title="Livro Amarelo">
                  <div className="flex gap-[24px] items-center flex-wrap">
                    <div className="flex-1 min-w-[280px] flex flex-col gap-[12px]">
                      <p>
                        Consulte os elogios, sugestões ou reclamações dos utilizadores no Livro Amarelo
                        para identificar oportunidades de melhoria e promover a inovação no seu serviço.
                      </p>
                      <p>
                        A implementação do Livro Amarelo Eletrónico (LAE) foi alicerçada pelo Decreto-Lei
                        n.º 74/2017, de 21 de junho, que determina a necessidade de digitalizar os
                        processos de reclamação, sugestão e elogios no setor público. O LAE constitui uma
                        plataforma digital destinada ao setor público, permitindo aos cidadãos submeterem
                        reclamações, elogios e sugestões sobre os serviços prestados por entidades
                        públicas, assegurando maior acessibilidade, transparência e eficiência na
                        interação entre os cidadãos e a Administração Pública.
                      </p>
                      <AccessButton>Aceder ao Livro Amarelo Eletrónico</AccessButton>
                    </div>
                    <div className="shrink-0">
                      <LivroAmareloLogo />
                    </div>
                  </div>
                </ExpandableRow>
              </div>
            </section>
          </>
        )}
      </div>
  );
}

export default function InovacaoPage() {
  return (
    <AppLayout>
      <Suspense fallback={null}>
        <InovacaoContent />
      </Suspense>
    </AppLayout>
  );
}
