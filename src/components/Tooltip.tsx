"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

const TOOLTIP_MAX_WIDTH = 260;
const EDGE_PADDING = 12;
// Abaixo deste espaço livre por cima do gatilho, o tooltip abre para baixo em
// vez de para cima — evita ficar cortado pela margem superior da janela.
const MIN_SPACE_ABOVE = 60;

/**
 * Tooltip neutro reutilizável para pills/badges informativos dos cards.
 * Posiciona-se acima do elemento (ou abaixo, se não houver espaço), com seta,
 * via portal (não é cortado pelo card).
 */
export default function Tooltip({ label, children }: { label?: React.ReactNode; children: React.ReactNode }) {
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
        top: placement === "below" ? r.bottom + 8 : r.top - 8,
        left,
        placement,
      });
    }
  }, [show]);

  if (!label) return <>{children}</>;

  return (
    <div
      ref={ref}
      className="flex"
      onMouseEnter={(e) => { e.preventDefault(); e.stopPropagation(); setShow(true); }}
      onMouseLeave={() => setShow(false)}
    >
      {children}
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
          <div className="text-[12px] font-medium max-w-[260px] text-center px-[10px] py-[5px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.18)]" style={{ background: "#021c51", color: "#ffffff" }}>
            {label}
          </div>
          <div
            style={{
              width: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              ...(pos.placement === "below"
                ? { borderBottom: "5px solid #021c51" }
                : { borderTop: "5px solid #021c51" }),
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
