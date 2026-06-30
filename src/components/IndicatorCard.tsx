"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import HelpTooltip from "@/components/HelpTooltip";

const PILL_STYLES = {
  warning: { bg: "#FFF4E6", color: "#DF3F00", border: "#FCDAB5" },
  danger:  { bg: "#FEE1E3", color: "#B20917", border: "#F9B4B8" },
};

function StatusTooltip({ children, tooltip, variant }: { children: React.ReactNode; tooltip: string; variant: "warning" | "danger" }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const s = PILL_STYLES[variant];

  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY - 8, left: r.left + r.width / 2 });
    }
  }, [show]);

  return (
    <div
      ref={ref}
      onMouseEnter={(e) => { e.preventDefault(); e.stopPropagation(); setShow(true); }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && typeof window !== "undefined" && createPortal(
        <div className="fixed z-[9999] pointer-events-none" style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
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

interface IndicatorCardProps {
  id: string;
  name: string;
  priority: string;
  metric: string;
  value: number | null;
  missingData?: boolean;
  nonCompliance?: boolean;
  mandatory?: boolean;
}

export default function IndicatorCard({
  id,
  name,
  priority,
  metric,
  value,
  missingData,
  nonCompliance,
  mandatory,
}: IndicatorCardProps) {
  return (
    <Link
      href={`/indicadores/${id}`}
      className="bg-primary-200 hover:bg-[#D6E3FF] rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[16px] flex flex-col justify-between h-[224px] w-full cursor-pointer transition-colors"
    >
      <div className="flex flex-col gap-[6px]">
        <div className="flex flex-col gap-[12px]">
          <div className="flex items-start justify-between w-full">
            <div className="flex gap-[4px] items-start flex-1 min-w-0">
              <div className="flex items-center pt-[3px]">
                <img src="/icons/icon-pt.svg" alt="" className="size-[14px]" />
              </div>
              <span className="text-[14px] font-medium text-primary-700 leading-[20px] flex-1 min-w-0">
                {priority}
              </span>
            </div>
            <div className="flex gap-[10px] items-start shrink-0">
              <img src="/icons/icon-heart.svg" alt="Favorito" className="size-[22px]" />
              <div onClick={(e) => e.preventDefault()}><HelpTooltip size={22} /></div>
            </div>
          </div>
          <h3 className="text-[16px] font-bold text-primary-900 leading-[23px]">
            {name}
          </h3>
        </div>
        <p className="text-[14px] font-medium text-primary-900 leading-[20px]">
          Métrica: {metric}
        </p>
      </div>
      <div className="flex gap-[6px] items-end w-full">
        {value !== null && (
          <div className="bg-primary-100 flex gap-[8px] items-center justify-center h-[30px] px-[12px] rounded-full">
            <img src="/icons/icon-score.svg" alt="" className="w-[25px] h-[14px]" />
            <span className="text-[16px] font-bold text-primary-800">
              {value}
            </span>
          </div>
        )}
        {mandatory && (
          <div className="bg-primary-100 flex gap-[4px] items-center h-[30px] px-[8px] rounded-full">
            <img src="/icons/icon-alert-circle.svg" alt="" className="size-[20px]" />
            <span className="text-[14px] font-medium text-primary-700">
              Obrigatório
            </span>
          </div>
        )}
        {nonCompliance && (
          <StatusTooltip tooltip="Indicador tem Incumprimento Legal" variant="danger">
            <div className="bg-danger-100 flex items-center p-[5px] rounded-full cursor-default">
              <img src="/icons/icon-x-circle.svg" alt="" className="size-[20px]" />
            </div>
          </StatusTooltip>
        )}
        {missingData && (
          <StatusTooltip tooltip="Indicador tem Dados Incompletos" variant="warning">
            <div className="bg-warning-100 flex items-center p-[5px] rounded-full cursor-default">
              <img src="/icons/icon-alert-triangle.svg" alt="" className="size-[20px]" />
            </div>
          </StatusTooltip>
        )}
      </div>
    </Link>
  );
}
