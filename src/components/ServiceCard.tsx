"use client";

import Link from "next/link";
import { Heart, AlertTriangle, XCircle, ArrowRight } from "lucide-react";
import HelpTooltip from "@/components/HelpTooltip";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

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

interface ServiceCardProps {
  id: string;
  name: string;
  entity: string;
  area: string;
  department: string;
  missingData?: boolean;
  nonCompliance?: boolean;
}

export default function ServiceCard({
  id,
  name,
  entity,
  area,
  department,
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
            <Heart className="size-[22px] text-primary-800" />
            <HelpTooltip size={22} />
          </div>
        </div>
        <div className="flex flex-col gap-[2px]">
          <p className="text-[14px] text-primary-900 leading-[20px]">
            <span className="font-medium">Área Governamental: </span>
            <span className="font-normal">{area}</span>
          </p>
          <p className="text-[14px] text-primary-900 leading-[20px]">
            <span className="font-medium">Departamento: </span>
            <span className="font-normal">{department}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-[6px] items-center">
          {nonCompliance && (
            <StatusTooltip tooltip="Indicador tem Incumprimento Legal" variant="danger">
              <div className="bg-danger-100 flex items-center p-[5px] rounded-full cursor-default">
                <XCircle className="size-[20px] text-danger-800" />
              </div>
            </StatusTooltip>
          )}
          {missingData && (
            <StatusTooltip tooltip="Indicador tem Dados Incompletos" variant="warning">
              <div className="bg-warning-100 flex items-center p-[5px] rounded-full cursor-default">
                <AlertTriangle className="size-[20px] text-warning-500" />
              </div>
            </StatusTooltip>
          )}
        </div>
        <div className="bg-secondary-900 opacity-0 group-hover:opacity-100 flex gap-[4px] items-center justify-center h-[30px] px-[12px] py-[8px] rounded-[15px] transition-opacity">
          <span className="text-[14px] font-medium text-white whitespace-nowrap">
            Aceder
          </span>
          <ArrowRight className="size-[18px] text-white" />
        </div>
      </div>
    </Link>
  );
}
