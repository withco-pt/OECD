"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface HelpTooltipProps {
  label?: string;
  size?: number;
}

const TOOLTIP_MAX_WIDTH = 360;
const EDGE_PADDING = 12;
// Abaixo deste espaço livre por cima do gatilho, o tooltip abre para baixo em
// vez de para cima — evita ficar cortado pela margem superior da janela (ex.:
// ícones de ajuda na topnav, a poucos px do topo do ecrã).
const MIN_SPACE_ABOVE = 100;

export default function HelpTooltip({ label = "Breve descrição", size = 22 }: HelpTooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, placement: "above" as "above" | "below" });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      const placement: "above" | "below" = r.top < MIN_SPACE_ABOVE ? "below" : "above";
      const left = Math.min(
        Math.max(r.left + r.width / 2, TOOLTIP_MAX_WIDTH / 2 + EDGE_PADDING),
        window.innerWidth - TOOLTIP_MAX_WIDTH / 2 - EDGE_PADDING
      );
      setPos({
        // position: fixed já é relativo ao viewport — getBoundingClientRect() não
        // precisa (nem deve) de somar window.scrollY, senão desvia-se do gatilho
        // assim que a página tem scroll.
        top: placement === "below" ? r.bottom + 8 : r.top - 8,
        left,
        placement,
      });
    }
  }, [show]);

  return (
    <div
      ref={ref}
      className="flex-shrink-0 cursor-pointer select-none"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <div
        className="bg-primary-600 rounded-full flex items-center justify-center text-white font-bold"
        style={{ width: size, height: size, fontSize: size * 0.59 }}
      >
        ?
      </div>
      {show && typeof window !== "undefined" && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: pos.top,
            left: pos.left,
            transform: pos.placement === "below" ? "translate(-50%, 0)" : "translate(-50%, -100%)",
            display: "flex",
            flexDirection: pos.placement === "below" ? "column-reverse" : "column",
            alignItems: "center",
          }}
        >
          <div
            className="text-[12px] font-medium px-[10px] py-[5px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.12)] border"
            style={{ background: "#E5EEFF", color: "#034AD8", borderColor: "#BBD1FD", maxWidth: TOOLTIP_MAX_WIDTH, whiteSpace: "normal", textAlign: "left" }}
          >
            {label}
          </div>
          <div
            style={{
              width: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              ...(pos.placement === "below"
                ? { borderBottom: "5px solid #E5EEFF" }
                : { borderTop: "5px solid #E5EEFF" }),
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
