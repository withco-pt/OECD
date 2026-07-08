"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PILL_STYLES } from "@/components/status-pill";
import Tooltip from "@/components/Tooltip";

function StatusTooltip({ children, tooltip, variant }: { children: React.ReactNode; tooltip: string; variant: "warning" | "danger" }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const s = PILL_STYLES[variant];

  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top - 8, left: r.left + r.width / 2 });
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

interface ServiceCardProps {
  id: string;
  name: string;
  entity: string;
  area: string;
  csat?: number | null;
  nResponses?: number | null;
  missingData?: boolean;
  nonCompliance?: boolean;
}

export default function ServiceCard({
  id,
  name,
  entity,
  area,
  csat,
  nResponses,
  missingData,
  nonCompliance,
}: ServiceCardProps) {
  return (
    <Link
      href={`/catalogo/${id}`}
      className="group bg-secondary-200 hover:bg-[#CCEAFF] rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[16px] flex flex-col justify-between h-[288px] w-full cursor-pointer transition-colors"
    >
      <div className="flex flex-col gap-[12px]">
        <div className="flex items-start justify-between w-full">
          <div className="flex flex-col gap-[12px] flex-1 min-w-0">
            <span className="text-[14px] font-medium text-secondary-900 leading-[20px]">
              {entity}
            </span>
            <h3 className="text-[20px] font-bold text-primary-900 leading-[27px]">
              {name}
            </h3>
          </div>
          <div className="flex gap-[10px] items-start shrink-0">
            <AgoraIcon name="like" className="size-[22px] text-neutral-400 cursor-not-allowed" />
          </div>
        </div>
        <p className="text-[14px] text-primary-900 leading-[20px]">
          <span className="font-medium">Área Governamental: </span>
          <span className="font-normal">{area}</span>
        </p>
      </div>
      <div className="flex gap-[6px] items-end flex-wrap w-full">
        <Tooltip label="Satisfação global média (escala 1–10)">
          <div className="bg-secondary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
            <AgoraIcon name="like" className="size-[16px] text-secondary-900" />
            <span className="text-[13px] font-medium text-primary-700">CSAT</span>
            <span className="text-[16px] font-bold text-primary-900">
              {csat != null ? csat.toLocaleString("pt-PT") : "–"}
            </span>
          </div>
        </Tooltip>
        <Tooltip label="Número de respostas ao questionário">
          <div className="bg-secondary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
            <span className="text-[16px] font-bold text-primary-900">
              {nResponses != null ? nResponses.toLocaleString("pt-PT") : "–"}
            </span>
            <span className="text-[13px] font-medium text-primary-700">respostas</span>
          </div>
        </Tooltip>
        {nonCompliance && (
          <StatusTooltip tooltip="Indicador tem Incumprimento Legal" variant="danger">
            <div className="bg-danger-100 flex items-center p-[5px] rounded-full cursor-default">
              <AgoraIcon name="x-circle" className="size-[20px] text-danger-800" />
            </div>
          </StatusTooltip>
        )}
        {missingData && (
          <StatusTooltip tooltip="Indicador tem Dados Incompletos" variant="warning">
            <div className="bg-warning-100 flex items-center p-[5px] rounded-full cursor-default">
              <AgoraIcon name="alert-triangle" className="size-[20px] text-warning-900" />
            </div>
          </StatusTooltip>
        )}
      </div>
    </Link>
  );
}
