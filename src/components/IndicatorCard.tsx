"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { PILL_STYLES } from "@/components/status-pill";
import Tooltip from "@/components/Tooltip";
import { metricPill } from "@/lib/metricPill";

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

interface IndicatorCardProps {
  id: string;
  name: string;
  priority: string;
  metric: string;
  valueType?: string | null;
  value: number | null;
  scaleMax?: number | null;
  categoryCounts?: Record<string, number> | null;
  missingData?: boolean;
  nonCompliance?: boolean;
  mandatory?: boolean;
}

const DEFAULT_SCALE_MAX: Record<string, number> = { likert_1_5: 5, scale_1_10: 10 };

function ScorePill({ children, gauge }: { children: React.ReactNode; gauge?: boolean }) {
  return (
    <div className="bg-primary-100 flex gap-[8px] items-center justify-center h-[30px] px-[12px] rounded-full">
      {gauge && <img src="/icons/icon-score.svg" alt="" className="w-[25px] h-[14px]" />}
      <span className="text-[16px] font-bold text-primary-800">{children}</span>
    </div>
  );
}

function CategoryPill({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="bg-primary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
      <span className="text-[13px] font-medium text-primary-700">{label}</span>
      <span className="text-[16px] font-bold text-primary-800">{value ?? "–"}</span>
    </div>
  );
}

export default function IndicatorCard({
  id,
  name,
  priority,
  metric,
  valueType,
  value,
  scaleMax,
  categoryCounts,
  missingData,
  nonCompliance,
  mandatory,
}: IndicatorCardProps) {
  const pill = metricPill(valueType, metric);

  const isSimNao = valueType === "categorical_sim_nao";
  const isScale = valueType === "likert_1_5" || valueType === "scale_1_10";
  const isNps = valueType === "nps";
  const max = scaleMax ?? DEFAULT_SCALE_MAX[valueType ?? ""] ?? null;
  const metricTip = metric && metric !== "—" ? metric : pill.label;

  let bottomMetric: React.ReactNode = null;
  if (isSimNao) {
    bottomMetric = (
      <>
        <Tooltip label="Nº de respostas «Sim»"><CategoryPill label="Sim" value={categoryCounts?.["Sim"]} /></Tooltip>
        <Tooltip label="Nº de respostas «Não»"><CategoryPill label="Não" value={categoryCounts?.["Não"]} /></Tooltip>
      </>
    );
  } else if (isScale) {
    bottomMetric = <Tooltip label={metricTip}><ScorePill gauge>{value !== null ? `${value} / ${max}` : `– / ${max}`}</ScorePill></Tooltip>;
  } else if (isNps) {
    bottomMetric = <Tooltip label="Net Promoter Score (−100 a +100)"><ScorePill gauge>{value !== null ? `NPS ${value > 0 ? "+" : ""}${value}` : "NPS –"}</ScorePill></Tooltip>;
  } else {
    // Contagem, Rácio, Tempo, Texto, Agendamento: pill com ícone + tipo (+ valor quando existir).
    bottomMetric = (
      <Tooltip label={metricTip}>
        <div className="bg-primary-100 flex gap-[6px] items-center h-[30px] px-[12px] rounded-full">
          <AgoraIcon name={pill.icon} className="size-[16px] text-primary-700" />
          <span className="text-[13px] font-medium text-primary-700">{pill.label}</span>
          {value !== null && <span className="text-[16px] font-bold text-primary-800">{value}</span>}
        </div>
      </Tooltip>
    );
  }
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
              <img src="/icons/icon-heart.svg" alt="Favorito" className="size-[22px] opacity-40 cursor-not-allowed" />
            </div>
          </div>
          <h3 className="text-[16px] font-bold text-primary-900 leading-[23px]">
            {name}
          </h3>
        </div>
      </div>
      <div className="flex gap-[6px] items-end w-full">
        {bottomMetric}
        {mandatory && (
          <Tooltip label="Indicador de preenchimento obrigatório">
            <div className="bg-primary-100 flex gap-[4px] items-center h-[30px] px-[8px] rounded-full">
              <AgoraIcon name="alert-circle" className="size-[20px] text-primary-700" />
              <span className="text-[14px] font-medium text-primary-700">
                Obrigatório
              </span>
            </div>
          </Tooltip>
        )}
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
