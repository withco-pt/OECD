"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip neutro reutilizável para pills/badges informativos dos cards.
 * Posiciona-se acima do elemento, com seta, via portal (não é cortado pelo card).
 */
export default function Tooltip({ label, children }: { label?: string | null; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.top - 8, left: r.left + r.width / 2 });
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
          style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div className="text-[12px] font-medium max-w-[260px] text-center px-[10px] py-[5px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.18)]" style={{ background: "#021c51", color: "#ffffff" }}>
            {label}
          </div>
          <div style={{ width: 0, borderTop: "5px solid #021c51", borderLeft: "5px solid transparent", borderRight: "5px solid transparent" }} />
        </div>,
        document.body
      )}
    </div>
  );
}
