"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PILL_STYLES } from "@/components/status-pill";
import HelpTooltip from "@/components/HelpTooltip";

export type PriorityStatus = "ok" | "missing_data" | "non_compliance" | "both";

interface ThematicPriorityCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  variant?: "large" | "small";
  status?: PriorityStatus;
  href?: string;
}

function Pill({ children, tooltip, variant = "warning" }: { children: React.ReactNode; tooltip: string; variant?: "warning" | "danger" }) {
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

function StatusPills({ status }: { status: PriorityStatus }) {
  return (
    <div className="flex gap-[6px] items-center z-[2]">
      {(status === "non_compliance" || status === "both") && (
        <Pill tooltip="Indicador tem Incumprimento Legal" variant="danger">
          <div className="bg-danger-100 flex items-center p-[5px] rounded-full cursor-default">
            <AgoraIcon name="x-circle" className="size-[20px] text-danger-800" />
          </div>
        </Pill>
      )}
      {(status === "missing_data" || status === "both") && (
        <Pill tooltip="Indicador tem Dados Incompletos">
          <div className="bg-warning-100 flex items-center p-[5px] rounded-full cursor-default">
            <AgoraIcon name="alert-triangle" className="size-[20px] text-warning-900" />
          </div>
        </Pill>
      )}
    </div>
  );
}

function Sparkles() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
      <path d="M38 8 L39.5 13 L44 14.5 L39.5 16 L38 21 L36.5 16 L32 14.5 L36.5 13 Z" fill="#034AD8" />
      <path d="M26 4 L27 7 L30 8 L27 9 L26 12 L25 9 L22 8 L25 7 Z" fill="#034AD8" />
      <path d="M44 24 L45 27 L48 28 L45 29 L44 32 L43 29 L40 28 L43 27 Z" fill="#034AD8" />
    </svg>
  );
}

export default function ThematicPriorityCard({
  title,
  description,
  icon,
  variant = "small",
  status = "ok",
  href,
}: ThematicPriorityCardProps) {
  const isLarge = variant === "large";
  const [hovered, setHovered] = useState(false);

  const content = (
    <div
      className="flex flex-col isolate items-start justify-between overflow-hidden p-[16px] rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)] relative w-full h-[152px] transition-all duration-200"
      style={{
        backgroundImage: hovered
          ? "linear-gradient(113deg, #C4D5FF 0%, #BBD1FD 100%)"
          : isLarge
          ? "linear-gradient(144deg, #D6E3FF 0%, #E5EEFF 100%)"
          : "linear-gradient(113deg, #E5EEFF 0%, #D6E3FF 100%)",
      }}
      onMouseEnter={() => setHovered(true)}
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
        {status !== "ok" ? (
          <StatusPills status={status} />
        ) : (
          <div />
        )}

        {/* Ver Indicadores button — only on hover */}
        <div
          className="flex items-center gap-[6px] text-white font-semibold text-[13px] px-[14px] py-[8px] rounded-full transition-all duration-200"
          style={{
            background: "rgb(0,43,130)",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(4px)",
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          Ver Indicadores <AgoraIcon name="arrow-right-anchor" className="size-[13px]" />
        </div>
      </div>

      {/* Decorative: icon default, sparkles on hover */}
      <div className="absolute right-[16px] bottom-[16px] z-[1] transition-opacity duration-200" style={{ opacity: hovered ? 0 : 1 }}>
        {icon}
      </div>
      <div className="absolute right-[8px] top-[8px] z-[1] transition-opacity duration-200" style={{ opacity: hovered ? 1 : 0 }}>
        <Sparkles />
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="cursor-pointer block">
        {content}
      </a>
    );
  }

  return content;
}
