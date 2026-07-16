"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PILL_STYLES } from "@/components/status-pill";
import HelpTooltip from "@/components/HelpTooltip";

export interface DimensionCounts {
  missingData: number;
  nonCompliance: number;
  underperformingOperational: number;
  underperformingUx: number;
}

const EMPTY_COUNTS: DimensionCounts = {
  missingData: 0,
  nonCompliance: 0,
  underperformingOperational: 0,
  underperformingUx: 0,
};

interface ThematicPriorityCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  variant?: "large" | "small";
  counts?: DimensionCounts;
  href?: string;
  /** Sem indicadores com dados reais para o serviço/canal atual — fica cinzento/inativo
   * em vez de deixar o utilizador clicar para uma lista vazia. */
  disabled?: boolean;
}

function Pill({ children, tooltip, variant = "warning" }: { children: React.ReactNode; tooltip: string; variant?: "warning" | "danger" | "secondary" | "informative" }) {
  const s = PILL_STYLES[variant];
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({
        top: r.top - 8,
        left: r.left + r.width / 2,
      });
    }
  }, [show]);

  return (
    <div
      ref={ref}
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && typeof window !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div className="text-[12px] font-medium whitespace-nowrap px-[10px] py-[5px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.12)] border" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
            {tooltip}
          </div>
          <div style={{ width: 0, borderTop: `5px solid ${s.bg}`, borderLeft: "5px solid transparent", borderRight: "5px solid transparent" }} />
        </div>,
        document.body
      )}
    </div>
  );
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function StatusPills({ counts }: { counts: DimensionCounts }) {
  return (
    <div className="flex gap-[6px] items-center z-[2]">
      {counts.nonCompliance > 0 && (
        <Pill
          tooltip={`${pluralize(counts.nonCompliance, "indicador", "indicadores")} com incumprimento legal`}
          variant="danger"
        >
          <div className="bg-danger-100 flex items-center p-[5px] rounded-full cursor-default">
            <AgoraIcon name="x-circle" className="size-[20px] text-danger-800" />
          </div>
        </Pill>
      )}
      {counts.missingData > 0 && (
        <Pill
          tooltip={`${pluralize(counts.missingData, "indicador", "indicadores")} com dados em falta`}
          variant="warning"
        >
          <div className="bg-warning-100 flex items-center p-[5px] rounded-full cursor-default">
            <AgoraIcon name="alert-triangle" className="size-[20px] text-warning-900" />
          </div>
        </Pill>
      )}
      {counts.underperformingOperational > 0 && (
        <Pill
          tooltip={`${pluralize(counts.underperformingOperational, "indicador", "indicadores")} com mau desempenho operacional`}
          variant="secondary"
        >
          <div className="bg-secondary-100 flex items-center p-[5px] rounded-full cursor-default">
            <AgoraIcon name="bar-chart" className="size-[20px] text-secondary-900" />
          </div>
        </Pill>
      )}
      {counts.underperformingUx > 0 && (
        <Pill
          tooltip={`${pluralize(counts.underperformingUx, "indicador", "indicadores")} com mau desempenho de UX`}
          variant="informative"
        >
          <div className="bg-informative-100 flex items-center p-[5px] rounded-full cursor-default">
            <AgoraIcon name="alert-circle" className="size-[20px] text-informative-800" />
          </div>
        </Pill>
      )}
    </div>
  );
}

export default function ThematicPriorityCard({
  title,
  description,
  icon,
  variant = "small",
  counts = EMPTY_COUNTS,
  href,
  disabled = false,
}: ThematicPriorityCardProps) {
  const hasIssues =
    counts.missingData > 0 ||
    counts.nonCompliance > 0 ||
    counts.underperformingOperational > 0 ||
    counts.underperformingUx > 0;
  const isLarge = variant === "large";
  const [hovered, setHovered] = useState(false);
  const isHovered = hovered && !disabled;

  const content = (
    <div
      className={`flex flex-col isolate items-start justify-between overflow-hidden p-[16px] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] relative w-full h-[152px] transition-all duration-200 ${disabled ? "grayscale opacity-60" : ""}`}
      style={{
        backgroundImage: isHovered
          ? "linear-gradient(113deg, #C4D5FF 0%, #BBD1FD 100%)"
          : isLarge
          ? "linear-gradient(144deg, #D6E3FF 0%, #E5EEFF 100%)"
          : "linear-gradient(113deg, #E5EEFF 0%, #D6E3FF 100%)",
      }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start w-full z-[3]">
        <div className="flex flex-col items-start justify-center flex-1">
          <p
            className={`font-bold text-primary-900 ${
              isLarge
                ? "text-[32px] leading-[48px]"
                : "text-[24px] leading-[32px]"
            }`}
          >
            {title}
          </p>
        </div>
        <div className="ml-[3px]" onClick={(e) => e.preventDefault()}>
          <HelpTooltip size={22} label={description} />
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between w-full z-[2]">
        {hasIssues ? (
          <StatusPills counts={counts} />
        ) : (
          <div />
        )}

        {/* Ver Indicadores button — only on hover */}
        {!disabled && (
          <div
            className="flex items-center gap-[6px] text-white font-semibold text-[13px] px-[14px] py-[8px] rounded-full transition-all duration-200"
            style={{
              background: "rgb(0,43,130)",
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(0)" : "translateY(4px)",
              pointerEvents: isHovered ? "auto" : "none",
            }}
          >
            Ver Indicadores <AgoraIcon name="arrow-right-anchor" className="size-[13px]" />
          </div>
        )}
        {disabled && (
          <span className="text-[13px] font-medium text-primary-700">Sem indicadores com dados</span>
        )}
      </div>

      {/* Decorative: icon default, sparkles on hover */}
      <div className="absolute right-[16px] bottom-[16px] z-[1] transition-opacity duration-200" style={{ opacity: isHovered ? 0 : 1 }}>
        {icon}
      </div>
    </div>
  );

  if (href && !disabled) {
    return (
      <a href={href} className="cursor-pointer block">
        {content}
      </a>
    );
  }

  return (
    <div title={disabled ? "Sem indicadores com dados para este serviço" : undefined} className={disabled ? "cursor-not-allowed" : undefined}>
      {content}
    </div>
  );
}
