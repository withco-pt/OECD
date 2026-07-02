"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";

/* ─────────────────────────────────────────────────────────────
   Widgets de visualização do indicador (Tempo, Mapa, Canais).
   ILUSTRATIVOS: os controlos (toggles, dropdowns, botões) são
   apenas visuais — fiéis ao Figma, sem lógica funcional.
   ───────────────────────────────────────────────────────────── */

const SCORE_SCALE = [
  { v: 1, color: "#86131d" },
  { v: 2, color: "#c41826" },
  { v: 3, color: "#de2d3b" },
  { v: 4, color: "#fbbb3c" },
  { v: 5, color: "#ffd966" },
  { v: 6, color: "#e4e178" },
  { v: 7, color: "#bfe56e" },
  { v: 8, color: "#87e368" },
  { v: 9, color: "#1f9970" },
  { v: 10, color: "#00724c" },
];

/* ── Controlos partilhados ──────────────────────────────────── */

function EyeIcon({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-[18px]" aria-hidden="true">
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      {off && <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}

function Switch({
  label,
  options,
}: {
  label: string;
  options: { text: string; icon: React.ReactNode; active: boolean }[];
}) {
  return (
    <div className="flex flex-col gap-[2px]">
      <p className="text-[14px] font-medium text-primary-800">{label}</p>
      <div className="bg-primary-200 flex gap-[8px] items-center px-[5px] py-[4px] rounded-[12px]">
        {options.map((o) => (
          <div
            key={o.text}
            className={`flex gap-[4px] h-[30px] items-center justify-center px-[12px] py-[6px] rounded-[12px] text-[14px] font-medium whitespace-nowrap ${
              o.active ? "bg-primary-600 text-white" : "bg-primary-200 text-primary-900"
            }`}
          >
            {o.icon}
            {o.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function VizToggles() {
  return (
    <div className="flex gap-[16px] items-start flex-wrap">
      <Switch
        label="Tipo de Visualização"
        options={[
          { text: "Gráfico", icon: <AgoraIcon name="bar-chart" className="size-[18px]" />, active: true },
          { text: "Tabela", icon: <AgoraIcon name="list" className="size-[18px]" />, active: false },
        ]}
      />
      <Switch
        label="Filtros"
        options={[
          { text: "Mostrar Filtros", icon: <EyeIcon />, active: true },
          { text: "Ocultar Filtros", icon: <EyeIcon off />, active: false },
        ]}
      />
    </div>
  );
}

function RegionSearch() {
  return (
    <div className="flex flex-col gap-[2px]">
      <p className="text-[14px] font-medium text-primary-800">
        Procure um Distrito, Município, Freguesia ou por um Serviço Desconcentrado
      </p>
      <div className="bg-primary-200 flex gap-[8px] items-center px-[12px] py-[6px] rounded-[12px]">
        <AgoraIcon name="search" className="size-[20px] text-primary-800" />
        <span className="text-[14px] font-medium text-primary-900">Portugal</span>
      </div>
    </div>
  );
}

function Dropdown({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[2px] w-full">
      <p className="text-[14px] font-medium text-primary-800">{label}</p>
      <div className="bg-primary-200 flex items-center justify-between px-[8px] py-[4px] rounded-[8px] h-[38px]">
        <span className="text-[14px] font-medium text-primary-900">{value}</span>
        <AgoraIcon name="chevron-down" className="size-[18px] text-primary-800" />
      </div>
    </div>
  );
}

function Footnote() {
  return (
    <p className="text-[14px] text-primary-900">*Dados provisórios em atualização.</p>
  );
}

function FooterButtons() {
  return (
    <div className="flex gap-[16px] items-center pt-[16px]">
      <div className="bg-primary-200 flex items-center justify-between px-[8px] py-[4px] rounded-[12px] w-[168px] h-[38px]">
        <span className="flex items-center gap-[6px] text-[14px] font-medium text-primary-900">
          <AgoraIcon name="download" className="size-[18px]" />
          Exportar
        </span>
        <AgoraIcon name="chevron-down" className="size-[18px] text-primary-800" />
      </div>
      <div className="bg-primary-200 flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[12px] h-[36px]">
        <span className="text-[14px] font-medium text-primary-900">Partilhar</span>
        <AgoraIcon name="share" className="size-[18px] text-primary-800" />
      </div>
      <div className="bg-primary-200 flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[15px] h-[36px]">
        <span className="text-[14px] font-medium text-primary-900">Adicionar aos Favoritos</span>
        <AgoraIcon name="like" className="size-[18px] text-primary-800" />
      </div>
    </div>
  );
}

function ServiceLegend({ service }: { service: string }) {
  return (
    <div className="flex items-center gap-[8px]">
      <span className="size-[12px] rounded-full bg-primary-800 shrink-0" />
      <span className="text-[14px] text-primary-900">{service}</span>
    </div>
  );
}

/* ── Escala de cor (Mapa) ───────────────────────────────────── */

function ScoreScaleLegend() {
  return (
    <div className="flex flex-col gap-[4px]">
      <p className="text-[16px] font-medium text-primary-900">Escala do Score do Indicador</p>
      <div className="flex gap-[8px] items-center">
        <div className="flex h-[25px] w-[266px] overflow-hidden rounded-[12px]">
          {SCORE_SCALE.map((s) => (
            <div
              key={s.v}
              className="flex-1 flex items-center justify-center text-[14px] font-medium text-white/90"
              style={{ backgroundColor: s.color }}
            >
              {s.v}
            </div>
          ))}
        </div>
        <div className="bg-neutral-300 flex h-[25px] items-center justify-center px-[8px] rounded-[12px]">
          <span className="text-[14px] font-medium italic text-primary-900">Sem Dados</span>
        </div>
      </div>
    </div>
  );
}

/* ── Gráfico de barras (Canais) ─────────────────────────────── */

const CANAIS = [
  { label: "Presencial*", v: 7 },
  { label: "Internet*", v: 8 },
  { label: "Portal Transacional*", v: 7 },
  { label: "Formulário de contacto*", v: 8 },
  { label: "Assistente Virtual*", v: 7 },
];

function BarsCanais() {
  return (
    <div className="flex gap-[8px] w-full max-w-[460px]">
      {/* Eixo Y */}
      <div className="flex flex-col justify-between text-[12px] text-primary-800 h-[300px] py-[2px] shrink-0">
        {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
          <span key={n} className="leading-none">{n}</span>
        ))}
      </div>
      {/* Plot */}
      <div className="flex-1 min-w-0">
        <div className="relative h-[300px] border-l border-b border-primary-300">
          {/* Gridlines */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="absolute left-0 right-0 border-t border-primary-200" style={{ top: `${(i / 9) * 100}%` }} />
          ))}
          {/* Barras */}
          <div className="absolute inset-0 flex items-end justify-around px-[8px] gap-[8px]">
            {CANAIS.map((c) => (
              <div key={c.label} className="flex-1 flex flex-col items-center justify-end h-full">
                <span className="text-[13px] font-bold text-primary-800 mb-[4px]">{c.v}*</span>
                <div className="w-full max-w-[52px] bg-primary-800 rounded-t-[2px]" style={{ height: `${(c.v / 10) * 100}%` }} />
              </div>
            ))}
          </div>
        </div>
        {/* Eixo X */}
        <div className="flex justify-around px-[8px] gap-[8px] pt-[6px]">
          {CANAIS.map((c) => (
            <span key={c.label} className="flex-1 text-[12px] text-primary-900 text-center leading-[15px]">
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Gráfico de linhas (Tempo) ──────────────────────────────── */

const TEMPO = [
  { year: "2020", v: 6 },
  { year: "2021", v: 7 },
  { year: "2022", v: 7 },
  { year: "2023", v: 8 },
  { year: "2024", v: 9 },
  { year: "2025*", v: 8, projected: true },
];

function LineTempo() {
  const W = 480;
  const H = 340;
  const padL = 30;
  const padR = 16;
  const padT = 20;
  const padB = 34;
  const x0 = padL;
  const x1 = W - padR;
  const y0 = padT;
  const y1 = H - padB;
  const xFor = (i: number) => x0 + (i / (TEMPO.length - 1)) * (x1 - x0);
  const yFor = (v: number) => y1 - ((v - 1) / 9) * (y1 - y0);

  const solidPts = TEMPO.filter((p) => !p.projected);
  const solidPath = solidPts.map((p, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(p.v)}`).join(" ");
  const lastSolidIdx = solidPts.length - 1;
  const projIdx = TEMPO.length - 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px]" xmlns="http://www.w3.org/2000/svg">
      {/* Gridlines + labels Y */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
        const y = yFor(n);
        return (
          <g key={n}>
            <line x1={x0} y1={y} x2={x1} y2={y} stroke="#e5eeff" strokeWidth="1" />
            <text x={x0 - 8} y={y + 4} textAnchor="end" fontSize="12" fill="#002b82">{n}</text>
          </g>
        );
      })}
      {/* Eixos */}
      <line x1={x0} y1={y0} x2={x0} y2={y1} stroke="#bbd1fd" strokeWidth="1.5" />
      <line x1={x0} y1={y1} x2={x1} y2={y1} stroke="#bbd1fd" strokeWidth="1.5" />
      {/* Labels X */}
      {TEMPO.map((p, i) => (
        <text key={p.year} x={xFor(i)} y={y1 + 20} textAnchor="middle" fontSize="12" fill="#021c51">{p.year}</text>
      ))}
      {/* Linha sólida */}
      <path d={solidPath} fill="none" stroke="#002b82" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Segmento tracejado (projeção) */}
      <line
        x1={xFor(lastSolidIdx)} y1={yFor(solidPts[lastSolidIdx].v)}
        x2={xFor(projIdx)} y2={yFor(TEMPO[projIdx].v)}
        stroke="#002b82" strokeWidth="2.5" strokeDasharray="6 5" strokeLinecap="round"
      />
      {/* Pontos + valores */}
      {TEMPO.map((p, i) => (
        <g key={p.year}>
          {p.projected ? (
            <circle cx={xFor(i)} cy={yFor(p.v)} r="6" fill="#fafcff" stroke="#002b82" strokeWidth="1.5" strokeDasharray="3 3" />
          ) : (
            <circle cx={xFor(i)} cy={yFor(p.v)} r="5" fill="#002b82" />
          )}
          <text x={xFor(i)} y={yFor(p.v) - 12} textAnchor="middle" fontSize="13" fontWeight="700" fill="#002b82">
            {p.v}{p.projected ? "*" : ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ── Mapa de Portugal ───────────────────────────────────────── */

function MapaPortugal() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/widgets/portugal-map.svg"
      alt="Mapa de Portugal com o score do indicador por região"
      className="w-full max-w-[458px] h-auto"
    />
  );
}

/* ── Moldura + composição por tab ───────────────────────────── */

type VizTab = "tempo" | "mapa" | "canais";

function buildTitle(tab: VizTab, indicatorName: string, service: string) {
  const base = `${indicatorName} no serviço "${service}" em Portugal`;
  if (tab === "tempo") return `${base} entre 2020 e 2025*`;
  if (tab === "mapa") return `${base} no ano de 2025* por Regiões`;
  return `${base} no ano de 2025 por Canais`;
}

export default function IndicatorViz({
  tab,
  indicatorName,
  service,
  metric,
}: {
  tab: VizTab;
  indicatorName: string;
  service: string;
  metric: string;
}) {
  return (
    <div className="bg-primary-100 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.1)] p-[16px] flex flex-col gap-[16px]">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-[6px] pb-[8px] border-b-2 border-primary-300">
        <h2 className="text-[20px] font-bold text-primary-900 leading-[27px]">
          {buildTitle(tab, indicatorName, service)}
        </h2>
        <div className="flex gap-[16px] items-center text-[16px] font-medium text-primary-900">
          <span>Métrica: {metric}</span>
          <span>Valor Ideal: 10</span>
        </div>
      </div>

      <VizToggles />
      <RegionSearch />

      {/* Escala de score (só no mapa, acima do gráfico) */}
      {tab === "mapa" && <ScoreScaleLegend />}

      {/* Gráfico + opções laterais */}
      <div className="flex gap-[32px] items-start">
        <div className="flex-1 min-w-0 flex flex-col gap-[24px] items-start">
          {tab === "canais" && <BarsCanais />}
          {tab === "tempo" && <LineTempo />}
          {tab === "mapa" && <MapaPortugal />}
          {tab !== "mapa" && <ServiceLegend service={service} />}
        </div>

        <div className="w-[205px] shrink-0 flex flex-col gap-[16px]">
          {tab === "tempo" ? (
            <>
              <div className="flex flex-col gap-[2px]">
                <p className="text-[14px] font-medium text-primary-800">Intervalo Temporal</p>
                <div className="bg-primary-200 flex items-center justify-between px-[8px] py-[4px] rounded-[8px] h-[38px]">
                  <span className="text-[14px] font-medium text-primary-900">Anos</span>
                  <AgoraIcon name="chevron-down" className="size-[18px] text-primary-800" />
                </div>
                <div className="flex items-center gap-[6px] mt-[6px]">
                  <div className="bg-primary-200 flex items-center justify-between px-[8px] py-[4px] rounded-[8px] h-[38px] flex-1">
                    <span className="text-[14px] font-medium text-primary-900">2020</span>
                    <AgoraIcon name="chevron-down" className="size-[16px] text-primary-800" />
                  </div>
                  <span className="text-primary-800">—</span>
                  <div className="bg-primary-200 flex items-center justify-between px-[8px] py-[4px] rounded-[8px] h-[38px] flex-1">
                    <span className="text-[14px] font-medium text-primary-900">2025</span>
                    <AgoraIcon name="chevron-down" className="size-[16px] text-primary-800" />
                  </div>
                </div>
              </div>
              <Dropdown label="Canal" value="Todos" />
            </>
          ) : (
            <>
              <Dropdown label="Ano" value="2025" />
              <Dropdown label="Mês" value="Todos" />
              {tab === "mapa" && <Dropdown label="Canal" value="Todos" />}
            </>
          )}
        </div>
      </div>

      <Footnote />
      <FooterButtons />
    </div>
  );
}
