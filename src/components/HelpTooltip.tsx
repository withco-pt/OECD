"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface HelpTooltipProps {
  label?: string;
  size?: number;
}

export default function HelpTooltip({ label = "Breve descrição", size = 22 }: HelpTooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (show && ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY - 8,
        left: r.left + r.width / 2,
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
          style={{ top: pos.top, left: pos.left, transform: "translate(-50%, -100%)", display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div
            className="text-[12px] font-medium px-[10px] py-[5px] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.12)] border"
            style={{ background: "#E5EEFF", color: "#034AD8", borderColor: "#BBD1FD", maxWidth: 360, whiteSpace: "normal", textAlign: "left" }}
          >
            {label}
          </div>
          <div style={{ width: 0, borderTop: "5px solid #E5EEFF", borderLeft: "5px solid transparent", borderRight: "5px solid transparent" }} />
        </div>,
        document.body
      )}
    </div>
  );
}
