"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useRouter } from "next/navigation";

const entities = [
  {
    id: "at",
    name: "Autoridade Tributária e Aduaneira",
    ministry: "Ministério das Finanças",
    logo: "/logo-at.jpeg",
  },
];

export default function EntradaPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen w-full font-sans" style={{ background: "rgb(247,248,250)" }}>

      {/* Hero band */}
      <div
        className="relative flex flex-col items-center overflow-hidden flex-shrink-0"
        style={{
          background: "rgb(3,74,216)",
          padding: "56px 32px 110px",
        }}
      >
        {/* Watermark */}
        <div className="absolute right-[-30px] top-[-20px] opacity-10 pointer-events-none">
          <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="130" cy="130" r="100" stroke="white" strokeWidth="40" opacity="0.6" />
            <circle cx="130" cy="130" r="50" stroke="white" strokeWidth="20" opacity="0.4" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-[16px] max-w-[760px] text-center z-[1]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-arte.png"
            alt="ARTE — Agência para a Reforma Tecnológica do Estado"
            style={{ height: 104, width: "auto", marginBottom: 4 }}
          />

          <h1
            className="text-white font-bold"
            style={{ margin: 0, fontSize: 40, lineHeight: 1.15, letterSpacing: "-0.01em" }}
          >
            Matriz para a Inovação nos Serviços Públicos
          </h1>
          <p
            className="text-white"
            style={{ margin: "6px 0 0", fontSize: 18, lineHeight: 1.5, opacity: 0.88, maxWidth: 620 }}
          >
            Monitorize, compare e melhore os indicadores de qualidade dos serviços públicos.
          </p>
        </div>
      </div>

      {/* Selection panel — overlaps hero */}
      <div className="flex-1 flex flex-col items-center" style={{ padding: "0 32px 56px" }}>
        <div
          className="w-full flex flex-col"
          style={{
            maxWidth: 680,
            marginTop: -70,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0px 8px 28px rgba(2,28,81,0.12)",
            padding: 40,
            boxSizing: "border-box",
            gap: 24,
            zIndex: 2,
          }}
        >
          {/* Panel header */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <span
              className="font-bold"
              style={{ fontSize: 28, lineHeight: 1.2, color: "rgb(2,28,81)" }}
            >
              Selecione a sua Entidade
            </span>
            <span
              style={{ fontSize: 16, lineHeight: 1.5, color: "rgb(100,113,139)" }}
            >
              Escolha a entidade para aceder à respetiva matriz de indicadores.
            </span>
          </div>

          {/* Entity cards */}
          <div className="flex flex-col" style={{ gap: 12 }}>
            {entities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => router.push("/")}
                className="flex flex-row items-center text-left transition-all"
                style={{
                  gap: 20,
                  textDecoration: "none",
                  background: "rgb(229,238,255)",
                  border: "1.5px solid rgb(187,209,253)",
                  borderRadius: 10,
                  padding: "20px 22px",
                  boxSizing: "border-box",
                  transition: "background 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgb(213,228,255)";
                  e.currentTarget.style.borderColor = "rgb(95,147,252)";
                  e.currentTarget.style.boxShadow = "0px 4px 12px rgba(2,28,81,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgb(229,238,255)";
                  e.currentTarget.style.borderColor = "rgb(187,209,253)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Logo tile */}
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    background: "#fff",
                    boxShadow: "0px 2px 4px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={entity.logo}
                    alt={entity.name}
                    style={{ width: 48, height: 48, objectFit: "contain" }}
                  />
                </div>

                {/* Name + ministry */}
                <div className="flex flex-col flex-1 min-w-0" style={{ gap: 4 }}>
                  <span
                    className="font-bold"
                    style={{ fontSize: 22, lineHeight: 1.25, color: "rgb(2,28,81)" }}
                  >
                    {entity.name}
                  </span>
                  <span style={{ fontSize: 15, lineHeight: 1.4, color: "rgb(100,113,139)" }}>
                    {entity.ministry}
                  </span>
                </div>

                {/* Aceder pill */}
                <div
                  className="flex flex-row items-center flex-shrink-0 font-semibold text-white"
                  style={{
                    gap: 8,
                    background: "rgb(0,43,130)",
                    borderRadius: 50,
                    padding: "10px 18px",
                    fontSize: 15,
                    whiteSpace: "nowrap",
                  }}
                >
                  Aceder
                  <AgoraIcon name="arrow-right-anchor" className="size-[16px]" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <span
          className="text-center"
          style={{ marginTop: 28, fontSize: 13, lineHeight: 1.4, color: "rgb(140,150,166)" }}
        >
          Uma plataforma da ARTE — Agência para a Reforma Tecnológica do Estado
        </span>
      </div>
    </div>
  );
}
