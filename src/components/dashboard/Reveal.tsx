"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   Animações de entrada do dashboard.
   - useRevealOnScroll: marca um elemento como "visível" quando
     entra no viewport (IntersectionObserver, dispara uma vez).
   - RevealContext: os gráficos dentro de um cartão sabem quando
     o cartão ficou visível e animam a sua construção (barras a
     crescer, linhas a desenhar, …).
   - Respeita prefers-reduced-motion: tudo aparece sem animação.
   ───────────────────────────────────────────────────────────── */

export const RevealContext = createContext(true);

/** true quando o cartão/bloco que envolve este elemento já entrou no viewport. */
export function useRevealed(): boolean {
  return useContext(RevealContext);
}

export function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      // Dispara quando ~12% do bloco está visível, com folga inferior para
      // o conteúdo "subir" já dentro do ecrã.
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, visible };
}

/** Classes de fade + deslize para o contentor revelado. */
export function revealClasses(visible: boolean): string {
  return `transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[24px]"
  }`;
}

/** Wrapper simples para revelar qualquer elemento (com atraso opcional para stagger). */
export default function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <RevealContext.Provider value={visible}>
      <div
        ref={ref}
        style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        className={`${revealClasses(visible)} ${className}`}
      >
        {children}
      </div>
    </RevealContext.Provider>
  );
}
