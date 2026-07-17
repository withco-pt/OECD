"use client";

import { useState } from "react";
import Link from "next/link";
import { AgoraIcon } from "@/components/icons/AgoraIcon";

/* ── Conteúdo partilhado entre o detalhe de indicador e o detalhe de serviço no
   catálogo, para as secções "Ferramentas para a Inovação" e "Obtenha Ajuda para
   a Inovação" (têm de ser exatamente iguais nos dois sítios). ─────────────── */

export type CaseStudy = { id: string; title: string; country: string; externalUrl: string | null };

export const TOOLKIT_URL = "https://oecd-public-service-innovation-b.gitbook.io/publicservicebooster/pt";
export const OPSI_URL = "https://oecd-opsi.org/case_type/opsi/";
export type InnovationSuggestion = { id: string; title: string; description: string; link: string | null };

/* ── Linha expansível ─────────────────────────────────────────── */

export function ExpandableRow({
  title,
  children,
  bg = "bg-primary-200",
}: {
  title: string;
  children?: React.ReactNode;
  bg?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`${bg} rounded-[8px]`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-[20px] py-[16px] text-left"
      >
        <span className="text-[15px] font-medium text-primary-900">{title}</span>
        {open ? (
          <AgoraIcon name="chevron-up" size={20} className="text-primary-600" />
        ) : (
          <AgoraIcon name="chevron-down" size={20} className="text-primary-600" />
        )}
      </button>
      {open && (
        <div className="px-[20px] pb-[16px] text-[14px] text-primary-700">
          {children ?? <p>Conteúdo em desenvolvimento.</p>}
        </div>
      )}
    </div>
  );
}

/* ── Ícones auxiliares (não existem no Ágora) ───────────────── */

function MailIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 5.5l7 5 7-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 3.5c0-.8.7-1.3 1.5-1.2l2 .3c.6.1 1.1.6 1.2 1.2l.4 2.2c.1.5-.1 1-.5 1.3l-1.2 1c1 2 2.5 3.5 4.5 4.5l1-1.2c.3-.4.8-.6 1.3-.5l2.2.4c.6.1 1.1.6 1.2 1.2l.3 2c.1.8-.4 1.5-1.2 1.5C10.5 17 3 9.5 4 3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M10 18s6-5.5 6-10a6 6 0 10-12 0c0 4.5 6 10 6 10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

/* ── Cartão de contacto (Ferramentas/Ajuda) ─────────────────── */

export function ContactCard({
  entity,
  title,
  email,
  phone,
  address,
  showIcons = false,
}: {
  entity?: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  showIcons?: boolean;
}) {
  return (
    <div className="bg-white rounded-[10px] border border-primary-200 p-[16px] flex flex-col gap-[10px] flex-1 min-w-0">
      {entity && (
        <div className="flex items-start justify-between gap-[8px]">
          <span className="text-[13px] font-semibold text-secondary-900">{entity}</span>
          {showIcons && (
            <div className="flex gap-[8px] items-center shrink-0">
              <AgoraIcon name="like" className="size-[16px] text-neutral-400 cursor-not-allowed" />
            </div>
          )}
        </div>
      )}
      <h4 className="text-[16px] font-bold text-primary-900 leading-snug">{title}</h4>
      <div className="flex flex-col gap-[6px] text-[13px] text-primary-800">
        <span className="flex items-center gap-[8px]">
          <MailIcon className="size-[15px] shrink-0 text-primary-700" />
          {email}
        </span>
        <span className="flex items-center gap-[8px]">
          <PhoneIcon className="size-[15px] shrink-0 text-primary-700" />
          {phone}
        </span>
        <span className="flex items-start gap-[8px]">
          <PinIcon className="size-[15px] shrink-0 text-primary-700 mt-[2px]" />
          {address}
        </span>
      </div>
    </div>
  );
}

/* ── Cartão de caso de estudo (OPSI) ─────────────────────────── */

// Bandeiras dos países presentes nos casos de estudo do OPSI (migration 018_case_studies.sql).
const COUNTRY_FLAGS: Record<string, string> = {
  "Grécia": "🇬🇷",
  "Noruega": "🇳🇴",
  "Peru": "🇵🇪",
  "Brasil": "🇧🇷",
  "Geórgia": "🇬🇪",
  "Espanha": "🇪🇸",
  "Uruguai": "🇺🇾",
  "Suécia": "🇸🇪",
  "Coreia do Sul": "🇰🇷",
  "Irlanda": "🇮🇪",
  "Reino Unido": "🇬🇧",
  "Ucrânia": "🇺🇦",
  "Azerbaijão": "🇦🇿",
  "Estónia": "🇪🇪",
  "Arábia Saudita": "🇸🇦",
  "Austrália": "🇦🇺",
  "Finlândia": "🇫🇮",
  "Polónia": "🇵🇱",
  "Canadá": "🇨🇦",
  "Dinamarca": "🇩🇰",
  "Colombia": "🇨🇴",
  "Uganda": "🇺🇬",
  "Estados Unidos da América": "🇺🇸",
  "Argentina": "🇦🇷",
  "Itália": "🇮🇹",
};

export function CaseStudyCard({ title, country, dimension, externalUrl }: { title: string; country: string; dimension: string; externalUrl: string | null }) {
  const content = (
    <>
      <span className="inline-flex items-center gap-[6px] text-[12px] font-medium text-primary-600">
        <AgoraIcon name="layers-menu" size={13} />
        {dimension}
      </span>
      <h4 className="text-[14px] font-bold text-primary-900 leading-snug flex-1">{title}</h4>
      <span className="inline-flex items-center gap-[6px] text-[13px] text-primary-800 bg-primary-100 rounded-full px-[10px] py-[4px] self-start">
        <span aria-hidden="true">{COUNTRY_FLAGS[country] ?? "🏳️"}</span> {country}
      </span>
    </>
  );
  const className = "bg-white rounded-[10px] border border-primary-200 p-[16px] flex flex-col gap-[10px] min-w-0";
  return externalUrl ? (
    <a href={externalUrl} target="_blank" rel="noopener noreferrer" className={`${className} hover:border-primary-400 transition-colors`}>
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}

/* ── Cartão de sugestão de inovação (Como Inovar / Como Melhorar o Serviço) ── */

export function SuggestionCard({ title, description, link, dimension }: { title: string; description: string; link: string | null; dimension?: string }) {
  return (
    <div className="bg-primary-600 rounded-[12px] hover:bg-primary-700 transition-colors p-[24px] flex flex-col gap-[12px] min-h-[220px]">
      {dimension && (
        <span className="inline-flex items-center gap-[6px] text-[12px] font-medium text-primary-100">
          <AgoraIcon name="layers-menu" size={13} />
          {dimension}
        </span>
      )}
      <h3 className="text-[18px] font-bold text-white leading-snug">{title}</h3>
      <p className="text-white text-[13px] leading-relaxed opacity-85 whitespace-pre-line">{description}</p>
      {link && (
        <div className="flex justify-end mt-auto pt-[4px]">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[6px] bg-white text-primary-800 text-[13px] font-medium rounded-full px-[16px] py-[8px] hover:bg-primary-100 transition-colors"
          >
            Saber Mais <AgoraIcon name="arrow-right-anchor" size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ── Diagrama do Duplo Diamante (Acelerador de Inovação) ─────── */

export function DoubleDiamondDiagram() {
  return (
    <img
      src="/acelerador_graf.png"
      alt="Diagrama do duplo diamante: Today (Scope, Engage, Understand) e Tomorrow (Re-frame, Design, Test, Communicate)"
      className="w-full h-auto"
    />
  );
}

/* ── Logótipo do Livro Amarelo ────────────────────────────────── */

export function LivroAmareloLogo() {
  return (
    <div className="flex items-center gap-[12px]">
      <div className="bg-warning-500 rounded-[10px] p-[10px] shrink-0">
        <AgoraIcon name="book-open" className="size-[32px] text-white" />
      </div>
      <div className="leading-tight whitespace-nowrap">
        <p className="text-[20px] font-extrabold text-primary-900">LIVRO</p>
        <p className="text-[20px] font-extrabold text-primary-900">AMARELO</p>
      </div>
    </div>
  );
}

/* ── Botão "Aceder" (Ferramentas/Ajuda) ──────────────────────── */

export function AccessButton({ children, href }: { children: React.ReactNode; href?: string }) {
  const className = "flex items-center gap-[8px] bg-primary-800 text-white rounded-full px-[20px] py-[10px] text-[14px] font-medium hover:bg-primary-900 transition-colors w-fit";
  const content = (
    <>
      {children} <AgoraIcon name="arrow-right-anchor" className="size-[16px]" />
    </>
  );
  if (href) {
    const isExternal = href.startsWith("http");
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return <button className={className}>{content}</button>;
}

/* ── Contactos estáticos partilhados ("Obtenha Ajuda para a Inovação") ──── */

export const goodPerformanceServices = [
  {
    entity: "Instituto dos Registos e do Notariado, I.P.",
    title: "Obtenção de informação do Cartão de Cidadão",
    email: "geral@irn.mj.pt",
    phone: "+351 21 798 55 00",
    address: "Avenida Dom João II, n.º 1.01.01 D, Edifício H, Parque das Nações, Apartado 8295, 1990-097 Lisboa",
  },
  {
    entity: "Autoridade Nacional de Segurança Rodoviária",
    title: "Consulta de pontos da Carta de Condução",
    email: "mail@ansr.pt",
    phone: "+351 21 423 6800",
    address: "Av. do Casal de Cabanas, n.º 1, 2734-507",
  },
];

export const ARTE_CONTACT = {
  title: "Agência para a Reforma Tecnológica do Estado, I.P.",
  email: "arte@arte.gov.pt",
  phone: "+351 21 798 55 00",
  address: "Rua de Santa Marta n.º 55, 1150 - 294 Lisboa",
};

/* ── Secção "Obtenha Ajuda para a Inovação" (idêntica em todo o lado) ────── */

export function GetHelpSection() {
  return (
    <section className="mb-[40px]">
      <h2 className="text-[22px] font-bold text-primary-900 mb-[16px]">Obtenha Ajuda para a Inovação</h2>
      <div className="space-y-[8px]">
        <ExpandableRow title="Serviços com Bom Desempenho no Indicador" bg="bg-secondary-200">
          <div className="flex gap-[24px] items-start flex-wrap">
            <p className="flex-1 min-w-[220px] max-w-[300px]">
              Colabore com os serviços que demonstram melhores resultados neste indicador, para
              identificar experiências e boas práticas que possa replicar no seu serviço.
            </p>
            <div className="flex gap-[16px] flex-1 min-w-[280px] flex-wrap">
              {goodPerformanceServices.map((s) => (
                <ContactCard
                  key={s.entity}
                  entity={s.entity}
                  title={s.title}
                  email={s.email}
                  phone={s.phone}
                  address={s.address}
                  showIcons
                />
              ))}
            </div>
          </div>
        </ExpandableRow>

        <ExpandableRow title="Contacte a Agência para a Reforma Tecnológica do Estado" bg="bg-secondary-200">
          <div className="flex gap-[24px] items-start flex-wrap">
            <p className="flex-1 min-w-[220px] max-w-[300px]">
              Caso necessite de apoio na melhoria do seu serviço pode entrar em contacto com a
              Agência para a Reforma Tecnológica do Estado, I.P.
            </p>
            <div className="flex-1 min-w-[280px]">
              <ContactCard
                title={ARTE_CONTACT.title}
                email={ARTE_CONTACT.email}
                phone={ARTE_CONTACT.phone}
                address={ARTE_CONTACT.address}
              />
            </div>
          </div>
        </ExpandableRow>
      </div>
    </section>
  );
}

/* ── Secção "Ferramentas para a Inovação" (idêntica em todo o lado; os Casos
   de Estudo variam consoante a(s) dimensão(ões) passada(s)) ─────────────── */

export function ToolsForInnovationSection({ caseStudies, dimension }: { caseStudies: (CaseStudy & { dimension: string })[]; dimension?: string }) {
  const inovacaoHref = dimension ? `/inovacao?dimensao=${encodeURIComponent(dimension)}` : "/inovacao";
  return (
    <section className="mb-[40px]">
      <h2 className="text-[22px] font-bold text-primary-900 mb-[16px]">Ferramentas para a Inovação</h2>
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

        <ExpandableRow title="Casos de Estudo do OPSI – Observatório de Inovação do Setor Público">
          <div className="flex flex-col gap-[16px]">
            <p>
              Esta secção apresenta um pequeno número de casos de estudo internacionais
              relacionados com as dimensões da Matriz. Pretendem estimular ideias e
              demonstrar diferentes potenciais abordagens.
            </p>
            <div className="grid grid-cols-3 gap-[16px]">
              {caseStudies.map((c) => (
                <CaseStudyCard key={c.id} title={c.title} country={c.country} dimension={c.dimension} externalUrl={c.externalUrl} />
              ))}
            </div>
            <div className="flex gap-[12px]">
              <AccessButton href={inovacaoHref}>Inovação</AccessButton>
              <AccessButton href={OPSI_URL}>Aceder ao OPSI</AccessButton>
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
  );
}
