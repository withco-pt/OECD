"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyChartState from "@/components/EmptyChartState";
import HelpTooltip from "@/components/HelpTooltip";
import IndicatorViz from "@/components/IndicatorViz";
import Tooltip from "@/components/Tooltip";
import {
  SuggestionCard,
  ToolsForInnovationSection,
  GetHelpSection,
  type CaseStudy,
  type InnovationSuggestion,
} from "@/components/InnovationHelp";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { useSelectedChannel } from "@/context/SelectedChannelContext";
import { supabase } from "@/lib/supabase";
import { hasCategoryData } from "@/lib/measurements";

// Abaixo deste nº de respondentes, um NPS calculado (só pode dar ±100 com n=1)
// é estatisticamente pouco fiável — mostra-se um aviso junto ao valor em vez
// de o esconder (feedback do cliente sobre o NPS de -100 da AT, 2026-07-16).
const NPS_MIN_RESPONDENTS = 5;

/* ── Gauge SVG (exported from Figma) ─────────────────────────── */

function FigmaGauge({ value, min = 1, max = 10 }: { value: number | null; min?: number; max?: number }) {
  if (value == null) {
    return (
      <div className="w-full max-w-[481px] aspect-[481/262] flex items-center justify-center">
        <EmptyChartState
          title="Sem dados disponíveis"
          description="Ainda não há medições registadas para este indicador e serviço."
        />
      </div>
    );
  }

  // Geometria do semicírculo (centro na base, raio exterior ~220).
  const cx = 220.5;
  const cy = 220;
  // Fração da escala do indicador (min→esquerda, max→direita), independente da escala.
  const span = max - min || 1;
  const frac = Math.min(1, Math.max(0, (value - min) / span));
  const rad = (180 - frac * 180) * (Math.PI / 180);
  const ux = Math.cos(rad);
  const uy = -Math.sin(rad);
  const px = Math.sin(rad); // perpendicular ao raio
  const py = Math.cos(rad);
  const tipR = 214;
  const baseR = 238;
  const halfW = 9;
  // Arredondar para evitar mismatch de hidratação (float difere server/client).
  const r = (n: number) => n.toFixed(2);
  const bcx = cx + baseR * ux;
  const bcy = cy + baseR * uy;
  const tip = `${r(cx + tipR * ux)},${r(cy + tipR * uy)}`;
  const b1 = `${r(bcx + halfW * px)},${r(bcy + halfW * py)}`;
  const b2 = `${r(bcx - halfW * px)},${r(bcy - halfW * py)}`;

  // Marcações do mostrador: 10 valores (um por setor colorido), calculados a
  // partir da escala real do indicador em vez de fixos em "1..10" — para
  // min=1/max=10 reproduz exatamente os números originais do Figma.
  const tickR = 183;
  const ticks = Array.from({ length: 10 }, (_, i) => {
    const tAngle = (171 - 18 * i) * (Math.PI / 180);
    return {
      x: r(cx + tickR * Math.cos(tAngle)),
      y: r(cy - tickR * Math.sin(tAngle)),
      label: Math.round(min + (i * span) / 9),
    };
  });

  return (
    <div className="flex flex-col items-center gap-[8px] w-full">
    <svg width="481" height="262" viewBox="-20 -20 481 262" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[481px]">
      <path d="M368.642 219.853C368.574 203.926 365.992 188.592 361.27 174.228L429.63 152.067C436.613 173.411 440.417 196.192 440.485 219.853H368.642Z" fill="#00724C"/>
      <path d="M368.642 219.853L368.128 219.855L368.131 220.366H368.642V219.853ZM361.27 174.228L361.111 173.74L360.621 173.898L360.782 174.388L361.27 174.228ZM429.63 152.067L430.118 151.907L429.959 151.421L429.472 151.579L429.63 152.067ZM440.485 219.853V220.366H441L440.998 219.852L440.485 219.853ZM368.642 219.853L369.155 219.851C369.087 203.87 366.496 188.482 361.757 174.067L361.27 174.228L360.782 174.388C365.488 188.702 368.061 203.983 368.128 219.855L368.642 219.853ZM361.27 174.228L361.428 174.716L429.789 152.555L429.63 152.067L429.472 151.579L361.111 173.74L361.27 174.228ZM429.63 152.067L429.143 152.226C436.109 173.52 439.904 196.248 439.972 219.854L440.485 219.853L440.998 219.852C440.93 196.136 437.118 173.301 430.118 151.907L429.63 152.067ZM440.485 219.853V219.34H368.642V219.853V220.366H440.485V219.853Z" fill="#00724C"/>
      <path d="M361.183 174.131C356.196 159.004 349.001 145.218 340.071 133.015L398.236 90.8171C411.474 108.96 422.135 129.452 429.513 151.935L361.183 174.131Z" fill="#1F9970"/>
      <path d="M361.183 174.131L360.696 174.292L360.856 174.777L361.342 174.619L361.183 174.131ZM340.071 133.015L339.77 132.6L339.353 132.902L339.657 133.318L340.071 133.015ZM398.236 90.8171L398.65 90.5147L398.348 90.1013L397.934 90.4018L398.236 90.8171ZM429.513 151.935L429.672 152.423L430.161 152.264L430.001 151.775L429.513 151.935ZM361.183 174.131L361.671 173.971C356.666 158.792 349.447 144.958 340.485 132.712L340.071 133.015L339.657 133.318C348.556 145.478 355.726 159.216 360.696 174.292L361.183 174.131ZM340.071 133.015L340.372 133.431L398.537 91.2325L398.236 90.8171L397.934 90.4018L339.77 132.6L340.071 133.015ZM398.236 90.8171L397.821 91.1196C411.028 109.219 421.664 129.664 429.026 152.095L429.513 151.935L430.001 151.775C422.606 129.24 411.92 108.7 398.65 90.5147L398.236 90.8171ZM429.513 151.935L429.355 151.447L361.025 173.643L361.183 174.131L361.342 174.619L429.672 152.423L429.513 151.935Z" fill="#1F9970"/>
      <path d="M339.968 132.941C330.55 120.095 319.447 109.207 307.183 100.361L349.46 42.2549C367.658 55.4194 384.13 71.6148 398.095 90.7176L339.968 132.941Z" fill="#87E368"/>
      <path d="M339.968 132.941L339.555 133.244L339.857 133.656L340.27 133.356L339.968 132.941ZM307.183 100.361L306.768 100.059L306.465 100.475L306.882 100.777L307.183 100.361ZM349.46 42.2549L349.761 41.8392L349.346 41.5392L349.045 41.9531L349.46 42.2549ZM398.095 90.7176L398.397 91.1327L398.813 90.8302L398.509 90.4148L398.095 90.7176ZM339.968 132.941L340.382 132.637C330.932 119.748 319.79 108.822 307.483 99.9446L307.183 100.361L306.882 100.777C319.103 109.592 330.168 120.442 339.555 133.244L339.968 132.941ZM307.183 100.361L307.598 100.663L349.875 42.5568L349.46 42.2549L349.045 41.9531L306.768 100.059L307.183 100.361ZM349.46 42.2549L349.159 42.6706C367.314 55.804 383.747 71.9614 397.681 91.0203L398.095 90.7176L398.509 90.4148C384.512 71.2681 368.002 55.0347 349.761 41.8392L349.46 42.2549ZM398.095 90.7176L397.793 90.3024L339.667 132.526L339.968 132.941L340.27 133.356L398.397 91.1327L398.095 90.7176Z" fill="#87E368"/>
      <path d="M307.064 100.314C294.136 91.0079 280.211 84.0847 265.813 79.4613L288.067 11.1348C309.442 18.0312 330.112 28.3446 349.297 42.1965L307.064 100.314Z" fill="#BFE56E"/>
      <path d="M307.064 100.314L306.764 100.731L307.179 101.029L307.479 100.616L307.064 100.314ZM265.813 79.4613L265.325 79.3025L265.166 79.7923L265.656 79.9498L265.813 79.4613ZM288.067 11.1348L288.224 10.6465L287.737 10.4893L287.579 10.976L288.067 11.1348ZM349.297 42.1965L349.712 42.4981L350.015 42.0818L349.598 41.7805L349.297 42.1965ZM307.064 100.314L307.364 99.8981C294.392 90.5597 280.418 83.6124 265.97 78.9728L265.813 79.4613L265.656 79.9498C280.003 84.5571 293.88 91.456 306.764 100.731L307.064 100.314ZM265.813 79.4613L266.301 79.6202L288.555 11.2937L288.067 11.1348L287.579 10.976L265.325 79.3025L265.813 79.4613ZM288.067 11.1348L287.909 11.6231C309.234 18.5032 329.856 28.7924 348.997 42.6125L349.297 42.1965L349.598 41.7805C330.368 27.8968 309.65 17.5591 288.224 10.6465L288.067 11.1348ZM349.297 42.1965L348.882 41.8949L306.649 100.013L307.064 100.314L307.479 100.616L349.712 42.4981L349.297 42.1965Z" fill="#BFE56E"/>
      <path d="M265.683 79.4591C250.512 74.6032 235.13 72.3211 220.009 72.3727L220.056 0.513604C242.516 0.467395 265.362 3.88807 287.889 11.1334L265.683 79.4591Z" fill="#E4E178"/>
      <path d="M265.683 79.4591L265.527 79.9478L266.013 80.1036L266.171 79.6177L265.683 79.4591ZM220.009 72.3727L219.496 72.3724L219.495 72.8876L220.01 72.8858L220.009 72.3727ZM220.056 0.513604L220.055 0.000469318L219.543 0.00152229L219.543 0.513315L220.056 0.513604ZM287.889 11.1334L288.377 11.292L288.536 10.8025L288.046 10.645L287.889 11.1334ZM265.683 79.4591L265.84 78.9704C250.617 74.0979 235.181 71.8078 220.007 71.8596L220.009 72.3727L220.01 72.8858C235.079 72.8344 250.407 75.1085 265.527 79.9478L265.683 79.4591ZM220.009 72.3727L220.522 72.373L220.569 0.513894L220.056 0.513604L219.543 0.513315L219.496 72.3724L220.009 72.3727ZM220.056 0.513604L220.057 1.02674C242.464 0.98064 265.256 4.39319 287.731 11.6219L287.889 11.1334L288.046 10.645C265.467 3.38294 242.568 -0.0458498 220.055 0.000469318L220.056 0.513604ZM287.889 11.1334L287.401 10.9749L265.195 79.3006L265.683 79.4591L266.171 79.6177L288.377 11.292L287.889 11.1334Z" fill="#E4E178"/>
      <path d="M219.885 72.4215C203.954 72.4893 188.618 75.0704 174.253 79.7896L152.085 11.4317C173.433 4.44976 196.219 0.646822 219.885 0.578989V72.4215Z" fill="#FFD966"/>
      <path d="M219.885 72.4215L219.887 72.9347L220.398 72.9325V72.4215H219.885ZM174.253 79.7896L173.765 79.9479L173.923 80.4378L174.413 80.2771L174.253 79.7896ZM152.085 11.4317L151.925 10.944L151.439 11.1031L151.597 11.59L152.085 11.4317ZM219.885 0.578989H220.398V0.0643626L219.883 0.0658377L219.885 0.578989ZM219.885 72.4215L219.883 71.9084C203.898 71.9764 188.509 74.5663 174.093 79.302L174.253 79.7896L174.413 80.2771C188.728 75.5745 204.011 73.0022 219.887 72.9347L219.885 72.4215ZM174.253 79.7896L174.741 79.6313L152.573 11.2734L152.085 11.4317L151.597 11.59L173.765 79.9479L174.253 79.7896ZM152.085 11.4317L152.245 11.9195C173.542 4.95398 196.275 1.15982 219.886 1.09214L219.885 0.578989L219.883 0.0658377C196.164 0.133827 173.324 3.94554 151.925 10.944L152.085 11.4317ZM219.885 0.578989H219.372V72.4215H219.885H220.398V0.578989H219.885Z" fill="#FFD966"/>
      <path d="M174.143 79.8606C159.013 84.8464 145.226 92.0386 133.022 100.966L90.8134 42.8025C108.958 29.5671 129.452 18.9102 151.937 11.5349L174.143 79.8606Z" fill="#FBBB3C"/>
      <path d="M174.143 79.8606L174.303 80.3479L174.789 80.188L174.631 79.702L174.143 79.8606ZM133.022 100.966L132.607 101.267L132.91 101.684L133.325 101.38L133.022 100.966ZM90.8134 42.8025L90.5109 42.3879L90.0974 42.6895L90.398 43.1038L90.8134 42.8025ZM151.937 11.5349L152.425 11.3763L152.266 10.8869L151.777 11.0473L151.937 11.5349ZM174.143 79.8606L173.982 79.3732C158.801 84.3761 144.966 91.5932 132.719 100.552L133.022 100.966L133.325 101.38C145.486 92.4841 159.226 85.3168 174.303 80.3479L174.143 79.8606ZM133.022 100.966L133.438 100.665L91.2287 42.5011L90.8134 42.8025L90.398 43.1038L132.607 101.267L133.022 100.966ZM90.8134 42.8025L91.1158 43.217C109.217 30.0129 129.663 19.3808 152.097 12.0225L151.937 11.5349L151.777 11.0473C129.24 18.4395 108.698 29.1213 90.5109 42.3879L90.8134 42.8025ZM151.937 11.5349L151.449 11.6934L173.655 80.0191L174.143 79.8606L174.631 79.702L152.425 11.3763L151.937 11.5349Z" fill="#FBBB3C"/>
      <path d="M132.947 101.073C120.099 110.49 109.21 121.591 100.363 133.853L42.2445 91.5785C55.4102 73.3847 71.6081 56.9175 90.7134 42.9555L132.947 101.073Z" fill="#DE2D3B"/>
      <path d="M132.947 101.073L133.25 101.487L133.662 101.185L133.362 100.772L132.947 101.073ZM100.363 133.853L100.061 134.268L100.477 134.571L100.779 134.153L100.363 133.853ZM42.2445 91.5785L41.8288 91.2777L41.5287 91.6924L41.9426 91.9934L42.2445 91.5785ZM90.7134 42.9555L91.1286 42.6539L90.826 42.2376L90.4105 42.5413L90.7134 42.9555ZM132.947 101.073L132.643 100.66C119.751 110.108 108.825 121.248 99.9463 133.553L100.363 133.853L100.779 134.153C109.595 121.935 120.446 110.872 133.25 101.487L132.947 101.073ZM100.363 133.853L100.664 133.438L42.5464 91.1636L42.2445 91.5785L41.9426 91.9934L100.061 134.268L100.363 133.853ZM42.2445 91.5785L42.6603 91.8793C55.7949 73.7284 71.9548 57.2997 91.0163 43.3698L90.7134 42.9555L90.4105 42.5413C71.2614 56.5353 55.0255 73.0409 41.8288 91.2777L42.2445 91.5785ZM90.7134 42.9555L90.2982 43.2571L132.531 101.375L132.947 101.073L133.362 100.772L91.1286 42.6539L90.7134 42.9555Z" fill="#DE2D3B"/>
      <path d="M100.332 133.978C91.0227 146.904 84.0956 160.826 79.47 175.221L11.1337 152.975C18.0332 131.604 28.3496 110.937 42.2058 91.7548L100.332 133.978Z" fill="#C41826"/>
      <path d="M100.332 133.978L100.749 134.278L101.047 133.863L100.634 133.563L100.332 133.978ZM79.47 175.221L79.3111 175.709L79.801 175.868L79.9586 175.378L79.47 175.221ZM11.1337 152.975L10.6453 152.818L10.4881 153.305L10.9748 153.463L11.1337 152.975ZM42.2058 91.7548L42.5075 91.3397L42.0911 91.0373L41.7898 91.4544L42.2058 91.7548ZM100.332 133.978L99.9158 133.678C90.5745 146.648 83.6233 160.618 78.9814 175.064L79.47 175.221L79.9586 175.378C84.568 161.033 91.4709 147.159 100.749 134.278L100.332 133.978ZM79.47 175.221L79.6289 174.733L11.2926 152.487L11.1337 152.975L10.9748 153.463L79.3111 175.709L79.47 175.221ZM11.1337 152.975L11.6221 153.133C18.5053 131.812 28.7975 111.193 42.6218 92.0552L42.2058 91.7548L41.7898 91.4544C27.9018 110.681 17.5611 131.396 10.6453 152.818L11.1337 152.975ZM42.2058 91.7548L41.9041 92.17L100.031 134.393L100.332 133.978L100.634 133.563L42.5075 91.3397L42.2058 91.7548Z" fill="#C41826"/>
      <path d="M79.4741 175.348C74.6146 190.517 72.3298 205.898 72.3794 221.019L0.513688 220.977C0.470789 198.52 3.89512 175.677 11.1454 153.152L79.4741 175.348Z" fill="#86131D"/>
      <path d="M79.4741 175.348L79.9628 175.504L80.1187 175.018L79.6327 174.86L79.4741 175.348ZM72.3794 221.019L72.379 221.532L72.8942 221.532L72.8925 221.017L72.3794 221.019ZM0.513688 220.977L0.000518128 220.979L0.00149559 221.49L0.513347 221.491L0.513688 220.977ZM11.1454 153.152L11.304 152.664L10.8145 152.505L10.6569 152.995L11.1454 153.152ZM79.4741 175.348L78.9854 175.191C74.1093 190.412 71.8164 205.847 71.8662 221.02L72.3794 221.019L72.8925 221.017C72.8431 205.95 75.1199 190.622 79.9628 175.504L79.4741 175.348ZM72.3794 221.019L72.3797 220.505L0.514028 220.464L0.513688 220.977L0.513347 221.491L72.379 221.532L72.3794 221.019ZM0.513688 220.977L1.02686 220.976C0.98406 198.572 4.40027 175.782 11.6339 153.309L11.1454 153.152L10.6569 152.995C3.38998 175.571 -0.0424807 198.468 0.000518128 220.979L0.513688 220.977ZM11.1454 153.152L10.9868 153.64L79.3155 175.836L79.4741 175.348L79.6327 174.86L11.304 152.664L11.1454 153.152Z" fill="#86131D"/>
      {/* Marcações numéricas (dinâmicas, calculadas a partir de min/max) */}
      {ticks.map((t, i) => (
        <text
          key={i}
          x={t.x}
          y={t.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="700"
          fill="#F2F6FF"
          fontFamily="Noto Sans, sans-serif"
        >
          {t.label}
        </text>
      ))}
      {/* Valor central */}
      <text
        x={cx}
        y={205}
        textAnchor="middle"
        fontSize="54"
        fontWeight="700"
        fill="#021c51"
        fontFamily="Noto Sans, sans-serif"
      >
        {value}
      </text>
      {/* Seta indicadora */}
      <polygon points={`${tip} ${b1} ${b2}`} fill="#021c51" />
    </svg>
    </div>
  );
}

/* ── Gauge Likert 1-5 (5 setores/cores próprios, replicado do Figma "Gráfico/Likert 1-5") ─ */

function LikertGauge({ value, min = 1, max = 5 }: { value: number | null; min?: number; max?: number }) {
  if (value == null) {
    return (
      <div className="w-full max-w-[481px] aspect-[481/262] flex items-center justify-center">
        <EmptyChartState
          title="Sem dados disponíveis"
          description="Ainda não há medições registadas para este indicador e serviço."
        />
      </div>
    );
  }

  const cx = 220.5;
  const cy = 220;
  const span = max - min || 1;
  const frac = Math.min(1, Math.max(0, (value - min) / span));
  const rad = (180 - frac * 180) * (Math.PI / 180);
  const ux = Math.cos(rad);
  const uy = -Math.sin(rad);
  const px = Math.sin(rad);
  const py = Math.cos(rad);
  const tipR = 214;
  const baseR = 238;
  const halfW = 9;
  const r = (n: number) => n.toFixed(2);
  const bcx = cx + baseR * ux;
  const bcy = cy + baseR * uy;
  const tip = `${r(cx + tipR * ux)},${r(cy + tipR * uy)}`;
  const b1 = `${r(bcx + halfW * px)},${r(bcy + halfW * py)}`;
  const b2 = `${r(bcx - halfW * px)},${r(bcy - halfW * py)}`;

  // 5 setores iguais (36° cada) — cores dos tokens Ágora confirmados no Figma:
  // Perigo/700, Aviso/500, Aviso/400, Sucesso/400, Sucesso/700.
  const innerR = 148;
  const outerR = 220;
  const pt = (radius: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)] as const;
  };
  const sectorPath = (from: number, to: number, steps = 12) => {
    const outer: string[] = [];
    const inner: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const deg = from + ((to - from) * i) / steps;
      const [ox, oy] = pt(outerR, deg);
      outer.push(`${r(ox)},${r(oy)}`);
    }
    for (let i = steps; i >= 0; i--) {
      const deg = from + ((to - from) * i) / steps;
      const [ix, iy] = pt(innerR, deg);
      inner.push(`${r(ix)},${r(iy)}`);
    }
    return `M ${[...outer, ...inner].join(" L ")} Z`;
  };
  const bands = [
    { n: 1, from: 180, to: 144, fill: "#C41826" },
    { n: 2, from: 144, to: 108, fill: "#FBBB3C" },
    { n: 3, from: 108, to: 72, fill: "#E4E178" },
    { n: 4, from: 72, to: 36, fill: "#87E368" },
    { n: 5, from: 36, to: 0, fill: "#1F9970" },
  ];

  // 5 marcações fixas (valores 1..5) — ângulo/cor/rotação replicados do Figma "Gráfico/Likert 1-5".
  const labelR = 184;
  const ticks = [
    { n: 1, angle: 162, rotate: -81, color: "rgba(255,255,255,0.9)" },
    { n: 2, angle: 126, rotate: -45, color: "rgba(255,255,255,0.9)" },
    { n: 3, angle: 90, rotate: 0, color: "#f2f6ff" },
    { n: 4, angle: 54, rotate: 30, color: "#f2f6ff" },
    { n: 5, angle: 18, rotate: 60, color: "rgba(255,255,255,0.9)" },
  ];

  return (
    <div className="flex flex-col items-center gap-[8px] w-full">
      <svg width="481" height="262" viewBox="-20 -20 481 262" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[481px]">
        {bands.map((b) => (
          <path key={b.n} d={sectorPath(b.from, b.to)} fill={b.fill} />
        ))}
        {ticks.map((t) => {
          const a = (t.angle * Math.PI) / 180;
          const x = cx + labelR * Math.cos(a);
          const y = cy - labelR * Math.sin(a);
          return (
            <text
              key={t.n}
              x={r(x)}
              y={r(y)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="22"
              fontWeight="500"
              fill={t.color}
              fontFamily="Noto Sans, sans-serif"
              transform={`rotate(${t.rotate} ${r(x)} ${r(y)})`}
            >
              {t.n}
            </text>
          );
        })}
        {/* Valor central */}
        <text x={cx} y={205} textAnchor="middle" fontSize="54" fontWeight="700" fill="#021c51" fontFamily="Noto Sans, sans-serif">
          {value}
        </text>
        {/* Seta indicadora */}
        <polygon points={`${tip} ${b1} ${b2}`} fill="#021c51" />
      </svg>
      <div className="flex items-center justify-between w-full max-w-[441px] px-[4px]">
        <span className="text-[24px] leading-[32px] font-medium text-neutral-900">Muito difícil</span>
        <span className="text-[24px] leading-[32px] font-medium text-neutral-900">Muito fácil</span>
      </div>
    </div>
  );
}

/* ── Donut Categórico Sim/Não/NA ─────────────────────────────── */

const CATEGORY_COLORS: Record<string, string> = {
  Sim: "#008558",
  Não: "#de2d3b",
};
const CATEGORY_FALLBACK_COLOR = "#9ca6b8";

function categoryColor(label: string) {
  return CATEGORY_COLORS[label] ?? CATEGORY_FALLBACK_COLOR;
}

function CategoricalDonut({ counts }: { counts: Record<string, number> | null }) {
  // Mesma geometria dos gauges (Escala 1-10/NPS, Likert 1-5) para ficar do mesmo tamanho.
  const cx = 220.5;
  const cy = 220;
  const innerR = 148;
  const outerR = 220;
  const r = (n: number) => n.toFixed(2);
  const pt = (radius: number, deg: number) => {
    const a = (deg * Math.PI) / 180;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)] as const;
  };
  const sectorPath = (from: number, to: number, steps = 24) => {
    const outer: string[] = [];
    const inner: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const deg = from + ((to - from) * i) / steps;
      const [ox, oy] = pt(outerR, deg);
      outer.push(`${r(ox)},${r(oy)}`);
    }
    for (let i = steps; i >= 0; i--) {
      const deg = from + ((to - from) * i) / steps;
      const [ix, iy] = pt(innerR, deg);
      inner.push(`${r(ix)},${r(iy)}`);
    }
    return `M ${[...outer, ...inner].join(" L ")} Z`;
  };

  const order = ["Sim", "Não", "NA"];
  const entries = (counts ? Object.entries(counts) : []).filter(([, v]) => v > 0);
  entries.sort(([a], [b]) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (!total) {
    return (
      <div className="w-full max-w-[481px] aspect-[481/262] flex items-center justify-center">
        <EmptyChartState
          title="Sem dados disponíveis"
          description="Ainda não há medições registadas para este indicador e serviço."
        />
      </div>
    );
  }

  let cursor = 180;
  const segments = entries.map(([label, value]) => {
    const pct = (value / total) * 100;
    const span = (pct / 100) * 180;
    const from = cursor;
    const to = cursor - span;
    cursor = to;
    return { label, value, pct, from, to, color: categoryColor(label) };
  });
  const top = segments[0];

  return (
    <div className="flex flex-col items-center gap-[8px] w-full">
      <svg width="481" height="262" viewBox="-20 -20 481 262" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[481px]">
        {segments.map((s) => (
          <path key={s.label} d={sectorPath(s.from, s.to)} fill={s.color} />
        ))}
        <text x={cx} y={195} textAnchor="middle" fontSize="54" fontWeight="700" fill="#021c51" fontFamily="Noto Sans, sans-serif">
          {Math.round(top.pct)}%
        </text>
        <text x={cx} y={232} textAnchor="middle" fontSize="24" fontWeight="500" fill="#2b363c" fontFamily="Noto Sans, sans-serif">
          {top.label}
        </text>
      </svg>
      <div className="flex items-center gap-[24px] flex-wrap justify-center">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-[8px] text-[15px] font-medium text-primary-900">
            <span className="inline-block size-[12px] rounded-full shrink-0" style={{ background: s.color }} />
            {s.label} {Math.round(s.pct)}%
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── KPI Contagem (nº) — valor + variação vs período anterior (só quando há 2+ períodos reais) ─ */

function CountKPI({ value, previousValue, previousPeriodLabel }: { value: number | null; previousValue: number | null; previousPeriodLabel?: string | null }) {
  if (value == null) {
    return (
      <div className="w-full py-[16px] flex items-center justify-center">
        <EmptyChartState size="sm" title="Sem dados" />
      </div>
    );
  }

  const hasComparison = previousValue != null && previousValue !== 0;
  const delta = hasComparison ? Math.round(((value - previousValue!) / previousValue!) * 1000) / 10 : null;
  const isUp = delta != null && delta > 0;
  const isDown = delta != null && delta < 0;

  return (
    <div className="flex flex-col gap-[8px] w-full py-[16px]">
      <div className="flex items-end gap-[14px]">
        <span className="text-[64px] font-bold text-primary-900 leading-none">
          {value.toLocaleString("pt-PT")}
        </span>
        {delta != null && (
          <span className={`flex items-center gap-[4px] text-[18px] font-semibold pb-[10px] ${isUp ? "text-success-600" : isDown ? "text-danger-600" : "text-neutral-500"}`}>
            <span aria-hidden="true">{isUp ? "↗" : isDown ? "↘" : "→"}</span>
            {isUp ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      {delta != null && (
        <p className="text-[13px] text-primary-500">
          vs. {previousPeriodLabel ?? "período anterior"}
        </p>
      )}
    </div>
  );
}

/* ── Estatística Rácio / Tempo médio — só o valor real, sem meta (não existe no schema) ─ */

function RatioStat({ value, unit }: { value: number | null; unit: string | null }) {
  if (value == null) {
    return (
      <div className="w-full py-[16px] flex items-center justify-center">
        <EmptyChartState size="sm" title="Sem dados" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[8px] w-full py-[16px]">
      <div className="flex items-baseline gap-[8px]">
        <span className="text-[64px] font-bold text-primary-900 leading-none">
          {value.toLocaleString("pt-PT", { maximumFractionDigits: 1 })}
        </span>
        {unit && <span className="text-[24px] font-semibold text-primary-600">{unit}</span>}
      </div>
    </div>
  );
}

/* ── Resposta aberta — 1 resposta real (value_text) + contagem real de respondentes ─ */

function OpenResponseCard({ text, respondents }: { text: string | null; respondents: number | null }) {
  return (
    <div className="flex flex-col gap-[12px] w-full py-[8px]">
      {text ? (
        <blockquote className="bg-primary-100 border border-primary-200 rounded-[10px] px-[16px] py-[14px] text-[15px] text-primary-900 italic">
          “{text}”
        </blockquote>
      ) : (
        <div className="py-[8px] flex items-center justify-center">
          <EmptyChartState size="sm" title="Sem dados" />
        </div>
      )}
      {respondents != null && (
        <p className="text-[13px] text-primary-500">
          {respondents.toLocaleString("pt-PT")} resposta{respondents === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */

const tabs = [
  "Visualização Simples",
  "Visualização ao Longo do Tempo",
  "Visualização por Distrito",
  "Visualização por Canais",
] as const;

type IndicatorDetail = {
  name: string;
  description: string | null;
  priority: string;
  legalBasis: string | null;
  legalBasisUrl: string | null;
  missingData: boolean;
  metric: string;
  valueType: string;
  value: number | null;
  previousValue: number | null;
  previousPeriodLabel: string | null;
  valueText: string | null;
  respondents: number | null;
  scaleMin: number | null;
  scaleMax: number | null;
  categoryCounts: Record<string, number> | null;
  channelData: { channel: string; value: number | null; categoryCounts: Record<string, number> | null }[];
  districtData: { geoName: string; value: number }[];
};
type TechField = { label: string; value: string };

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export default function IndicatorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<string>(tabs[0]);
  const { selectedService, openIndicatorSwap } = useSelectedService();
  const { selectedChannel: globalChannel } = useSelectedChannel();
  // Ao mudar de indicador/serviço volta sempre à Visualização Simples — evita ficar
  // "preso" numa aba que deixou de ter dados (ex: Distrito/Canais deste novo indicador).
  useEffect(() => { setActiveTab(tabs[0]); }, [id, selectedService]);

  const [indicator, setIndicator] = useState<IndicatorDetail | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string>("Todos");
  const [techFields, setTechFields] = useState<TechField[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [suggestions, setSuggestions] = useState<InnovationSuggestion[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setNotFound(false); setLoadError(false); setSelectedChannel("Todos");

      const { data: ind, error: indErr } = await supabase
        .from("indicators")
        .select("id, description, is_mandatory, value_type, value_scale_min, value_scale_max, escala_descricao, channel_scope, base_legal, base_legal_url, instrumento_recolha, formula_calculo, frequencia_recolha, thematic_priority_id, thematic_priorities(name_pt)")
        .eq("id", id)
        .maybeSingle();

      if (!active) return;
      if (indErr) { console.error("[indicador] erro:", indErr.message); setLoadError(true); setLoading(false); return; }
      if (!ind) { setNotFound(true); setLoading(false); return; }

      // Boas práticas de inovação da dimensão do indicador (partilhadas por todos os
      // indicadores dessa dimensão — ver docs/data-schema.md).
      const { data: sugg } = await supabase
        .from("innovation_suggestions")
        .select("id, title, description, saber_mais_url")
        .eq("thematic_priority_id", ind.thematic_priority_id as string)
        .order("display_order");
      if (!active) return;
      setSuggestions(
        (sugg ?? []).map((s) => ({
          id: s.id as string,
          title: s.title as string,
          description: s.description as string,
          link: (s.saber_mais_url as string | null) ?? null,
        }))
      );

      // Casos de estudo do OPSI associados à dimensão do indicador (um caso pode estar
      // associado a mais do que uma dimensão — ver docs/data-schema.md).
      const { data: cs } = await supabase
        .from("case_studies")
        .select("id, country, title, external_url, display_order, case_study_thematic_priorities!inner(thematic_priority_id)")
        .eq("case_study_thematic_priorities.thematic_priority_id", ind.thematic_priority_id as string)
        .order("display_order");
      if (!active) return;
      setCaseStudies(
        (cs ?? []).map((c) => ({
          id: c.id as string,
          title: c.title as string,
          country: c.country as string,
          externalUrl: (c.external_url as string | null) ?? null,
        }))
      );

      // Medição do indicador para o serviço selecionado
      type MRow = { channel: string | null; geo_level: string | null; geo_name: string | null; value: number | string | null; value_text: string | null; category_counts: Record<string, number> | null; total_respondentes: number | null; total_inquiridos: number | null; year: number | null; month: number | null };
      let rows: MRow[] = [];
      if (selectedService) {
        const { data: meas } = await supabase
          .from("measurements_catalog")
          .select("channel, geo_level, geo_name, value, value_text, category_counts, total_respondentes, total_inquiridos, year, month")
          .eq("service_id", selectedService.id)
          .eq("indicator_id", id);
        rows = (meas ?? []) as MRow[];
      }
      if (!active) return;

      // Linha "agregada" real: sem canal E sem segmentação geográfica (as linhas por distrito
      // também têm channel=null, por isso é preciso excluir geo_level para não as confundir com o total).
      const nullRow = rows.find((r) => r.channel === null && r.geo_level === null);
      const src = nullRow ? [nullRow] : rows;
      const nums = src.map((r) => Number(r.value)).filter((v) => !Number.isNaN(v));
      const value = nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100 : null;
      const categoryCounts = (nullRow ?? rows.find((r) => r.category_counts && r.geo_level === null))?.category_counts ?? null;
      const valueText = (nullRow ?? rows.find((r) => r.value_text && r.geo_level === null))?.value_text ?? null;

      // Variação vs período anterior — só quando há pelo menos 2 períodos reais (nunca inventada).
      const periodRows = (nullRow ? rows.filter((r) => r.channel === null && r.geo_level === null) : rows)
        .filter((r) => r.year != null && !Number.isNaN(Number(r.value)))
        .sort((a, b) => (a.year! - b.year!) || ((a.month ?? 0) - (b.month ?? 0)));
      const previousValue = periodRows.length > 1 ? Number(periodRows[periodRows.length - 2].value) : null;
      // Rótulo do período efetivamente comparado (mês/ano reais, nunca "trimestre" ou "ano"
      // assumidos) — explicita a que período se refere o "vs. período anterior".
      const previousRow = periodRows.length > 1 ? periodRows[periodRows.length - 2] : null;
      const previousPeriodLabel = previousRow?.year
        ? previousRow.month
          ? `${MESES[(previousRow.month ?? 1) - 1] ?? ""} ${previousRow.year}`.trim()
          : String(previousRow.year)
        : null;

      // Valor médio real por canal (só canais com medições reais, nunca inventados).
      // Guarda também category_counts por canal, para indicadores categóricos (Sim/Não, agendamento).
      const channelAgg = new Map<string, { vals: number[]; categoryCounts: Record<string, number> | null }>();
      for (const row of rows) {
        if (!row.channel) continue;
        const entry = channelAgg.get(row.channel) ?? { vals: [], categoryCounts: null };
        const v = Number(row.value);
        if (!Number.isNaN(v)) entry.vals.push(v);
        if (row.category_counts) entry.categoryCounts = row.category_counts;
        channelAgg.set(row.channel, entry);
      }
      const channelData = Array.from(channelAgg.entries()).map(([channel, { vals, categoryCounts }]) => ({
        channel,
        value: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : null,
        categoryCounts,
      }));

      // Valor médio real por distrito, só para o serviço selecionado (nunca inventado; só
      // distritos com medições reais aparecem).
      const geoValues = new Map<string, number[]>();
      for (const row of rows) {
        if (row.geo_level !== "distrito" || !row.geo_name) continue;
        const v = Number(row.value);
        if (Number.isNaN(v)) continue;
        const arr = geoValues.get(row.geo_name) ?? [];
        arr.push(v);
        geoValues.set(row.geo_name, arr);
      }
      const districtData = Array.from(geoValues.entries())
        .map(([geoName, vals]) => ({
          geoName,
          value: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100,
        }))
        .sort((a, b) => a.geoName.localeCompare(b.geoName, "pt"));

      // Escala do gauge por tipo: NPS de −100 a +100, Sim/Não como taxa 0–100 (%).
      const vt = String(ind.value_type);
      let scaleMin: number | null;
      let scaleMax: number | null;
      if (vt === "nps") {
        scaleMin = -100; scaleMax = 100;
      } else if (vt === "categorical_sim_nao") {
        scaleMin = 0; scaleMax = 100;
      } else {
        const isCategorical = vt.startsWith("categorical");
        scaleMin = (ind.value_scale_min as number | null) ?? (isCategorical ? 1 : null);
        scaleMax = (ind.value_scale_max as number | null) ?? (isCategorical ? 3 : null);
      }
      const tp = (ind.thematic_priorities ?? {}) as { name_pt?: string };
      const totalsRow = nullRow ?? rows.find((r) => r.geo_level === null) ?? rows[0];
      const resp = totalsRow?.total_respondentes ?? null;

      setIndicator({
        name: ind.description as string,
        description: null,
        priority: tp.name_pt ?? "—",
        legalBasis: (ind.base_legal as string) ?? null,
        legalBasisUrl: (ind.base_legal_url as string) ?? null,
        missingData: value === null && !hasCategoryData(categoryCounts),
        metric: (ind.escala_descricao as string) ?? "—",
        valueType: vt,
        value,
        previousValue,
        previousPeriodLabel,
        valueText,
        respondents: resp,
        scaleMin,
        scaleMax,
        categoryCounts,
        channelData,
        districtData,
      });

      // O dropdown de canal desta página arranca no canal escolhido na dropdown global do
      // header, desde que o indicador tenha dados reais desse canal; senão "Todos".
      const initialChannel =
        globalChannel && channelData.some((c) => c.channel === globalChannel)
          ? globalChannel
          : "Todos";
      setSelectedChannel(initialChannel);

      // Ficha técnica — apenas campos com valor
      const inq = totalsRow?.total_inquiridos ?? null;
      const per = totalsRow?.year ? `${MESES[(totalsRow.month ?? 1) - 1] ?? ""} ${totalsRow.year}`.trim() : null;
      const tf: TechField[] = [];
      if (ind.instrumento_recolha) tf.push({ label: "Instrumento de Recolha", value: ind.instrumento_recolha as string });
      if (ind.channel_scope) tf.push({ label: "Canal / Âmbito", value: ind.channel_scope as string });
      if (ind.formula_calculo) tf.push({ label: "Fórmula de Cálculo", value: ind.formula_calculo as string });
      if (per) tf.push({ label: "Período de Recolha", value: per });
      if (ind.frequencia_recolha) tf.push({ label: "Frequência", value: ind.frequencia_recolha as string });
      if (inq != null) tf.push({ label: "Nº Total de Inquiridos", value: inq.toLocaleString("pt-PT") });
      if (resp != null) tf.push({ label: "Nº de Respondentes", value: resp.toLocaleString("pt-PT") });
      if (inq != null && resp != null) tf.push({ label: "Nº Não Responderam", value: (inq - resp).toLocaleString("pt-PT") });
      setTechFields(tf);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [id, selectedService, globalChannel]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[400px] text-primary-400 text-[16px]">A carregar indicador…</div>
      </AppLayout>
    );
  }
  if (loadError) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center gap-[8px] justify-center h-[400px] text-danger-800">
          <AgoraIcon name="alert-triangle" className="size-[24px]" />
          <p className="text-[16px] font-semibold">Não foi possível carregar o indicador.</p>
        </div>
      </AppLayout>
    );
  }
  if (notFound || !indicator) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[400px]">
          <p className="text-[18px] text-primary-800">Indicador não encontrado.</p>
        </div>
      </AppLayout>
    );
  }

  // Quando há um canal selecionado (e existem dados reais para esse canal), o valor
  // mostrado na Visualização Simples passa a ser o valor desse canal em vez do agregado.
  const selectedChannelEntry =
    selectedChannel !== "Todos" ? indicator.channelData.find((c) => c.channel === selectedChannel) ?? null : null;
  const displayValue = selectedChannelEntry ? selectedChannelEntry.value : indicator.value;
  const displayCategoryCounts = selectedChannelEntry ? selectedChannelEntry.categoryCounts : indicator.categoryCounts;

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Indicadores", href: "/indicadores" },
          { label: indicator.name },
        ]}
      />

      {/* Header */}
      <div className="bg-primary-200 rounded-[10px] drop-shadow-[0px_4px_2px_rgba(0,0,0,0.05)] p-[24px] mb-[24px] flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[8px]">
          <div className="flex items-center gap-[8px]">
            <h1 className="text-[40px] font-bold text-primary-900 leading-tight">
              {indicator.name}
            </h1>
            <div className="mt-[8px]"><HelpTooltip size={24} /></div>
          </div>
          {indicator.description && (
            <p className="text-[15px] text-primary-800">
              {indicator.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-[16px] text-[14px] text-primary-900">
          <span>
            <span className="font-semibold">Dimensão:</span>{" "}
            {indicator.priority}
          </span>
          {indicator.legalBasis && (
            <span>
              <span className="font-semibold">Base Legal:</span>{" "}
              {indicator.legalBasisUrl ? (
                <a href={indicator.legalBasisUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 underline cursor-pointer">
                  {indicator.legalBasis}
                </a>
              ) : (
                <span className="text-primary-800">{indicator.legalBasis}</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-[16px]">
          <div>
            {indicator.missingData && (
              <span className="inline-flex items-center gap-[6px] bg-warning-100 text-warning-900 text-[13px] font-medium px-[10px] py-[5px] rounded-full">
                <AgoraIcon name="alert-triangle" size={16} className="text-warning-900" />
                Indicador com Dados Incompletos
              </span>
            )}
          </div>
          <div className="flex items-center gap-[10px] shrink-0">
            <button
              onClick={openIndicatorSwap}
              className="flex items-center gap-[8px] bg-primary-800 text-white rounded-full px-[20px] py-[10px] text-[14px] font-medium hover:bg-primary-900 transition-colors"
            >
              Alterar Indicador <AgoraIcon name="refresh-ccw" className="size-[16px]" />
            </button>
            <button disabled className="flex items-center gap-[8px] bg-neutral-100 text-neutral-400 rounded-full px-[20px] py-[10px] text-[14px] font-medium cursor-not-allowed">
              Adicionar aos Favoritos <AgoraIcon name="like" className="size-[16px] text-neutral-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-[4px] mb-[24px] flex-wrap">
        {tabs.map((tab) => {
          // "Visualização ao Longo do Tempo" é sempre mock/indisponível; Distrito e Canais
          // ficam inativas quando este indicador+serviço não tem, de facto, medições reais
          // nessa segmentação — evita que o utilizador clique e só depois veja "sem dados".
          const isDisabled =
            tab === "Visualização ao Longo do Tempo" ||
            (tab === "Visualização por Distrito" && indicator.districtData.length === 0) ||
            (tab === "Visualização por Canais" && !indicator.channelData.some((c) => c.value !== null));
          return (
            <button
              key={tab}
              onClick={() => !isDisabled && setActiveTab(tab)}
              disabled={isDisabled}
              title={isDisabled ? "Sem dados disponíveis para este indicador e serviço" : undefined}
              className={`px-[16px] py-[8px] rounded-[8px] text-[14px] font-medium transition-colors ${
                isDisabled
                  ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : activeTab === tab
                    ? "bg-primary-600 text-white"
                    : "bg-primary-200 text-primary-700 hover:bg-primary-300"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main content: two columns */}
      <div className="flex gap-[24px] mb-[32px]">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {activeTab === "Visualização ao Longo do Tempo" ? (
            <IndicatorViz tab="tempo" indicatorName={indicator.name} service={selectedService?.name ?? ""} metric={indicator.metric} />
          ) : activeTab === "Visualização por Distrito" ? (
            <IndicatorViz
              tab="distrito"
              indicatorName={indicator.name}
              service={selectedService?.name ?? ""}
              metric={indicator.metric}
              districtData={indicator.districtData}
            />
          ) : activeTab === "Visualização por Canais" ? (
            <IndicatorViz
              tab="canais"
              indicatorName={indicator.name}
              service={selectedService?.name ?? ""}
              metric={indicator.metric}
              channelData={indicator.channelData
                .filter((c) => c.value !== null)
                .map((c) => ({ channel: c.channel, value: c.value as number }))}
              scaleMin={indicator.scaleMin}
              scaleMax={indicator.scaleMax}
            />
          ) : (
          <div className="bg-primary-100 rounded-[12px] shadow-sm border border-neutral-100 overflow-hidden">
            {/* Card header */}
            <div className="px-[24px] pt-[24px] pb-[16px]">
              <h2 className="text-[18px] font-semibold text-primary-900 mb-[4px]">
                {indicator.name}
              </h2>
              <p className="text-[13px] text-primary-500">
                {indicator.metric}
              </p>
            </div>

            {/* Separator */}
            <div className="h-px bg-neutral-100 mx-[24px]" />

            {/* Gauge + Dropdowns row */}
            <div className="flex items-start gap-[24px] px-[24px] pt-[24px] pb-[16px]">
              {/* Gráfico — depende do tipo de valor do indicador */}
              <div className="flex-1 min-w-0">
                {indicator.valueType === "likert_1_5" ? (
                  <LikertGauge value={displayValue} min={indicator.scaleMin ?? 1} max={indicator.scaleMax ?? 5} />
                ) : indicator.valueType.startsWith("categorical") ? (
                  <CategoricalDonut counts={displayCategoryCounts} />
                ) : indicator.valueType === "text" ? (
                  <OpenResponseCard text={indicator.valueText} respondents={indicator.respondents} />
                ) : indicator.valueType === "integer" ? (
                  <CountKPI value={displayValue} previousValue={indicator.previousValue} previousPeriodLabel={indicator.previousPeriodLabel} />
                ) : indicator.valueType === "decimal" ? (
                  /Tempo|R[áa]cio/i.test(indicator.metric) ? (
                    <RatioStat value={displayValue} unit={indicator.metric.match(/\(([^)]+)\)/)?.[1] ?? null} />
                  ) : (
                    <CountKPI value={displayValue} previousValue={indicator.previousValue} previousPeriodLabel={indicator.previousPeriodLabel} />
                  )
                ) : (
                  <FigmaGauge value={displayValue} min={indicator.scaleMin ?? 1} max={indicator.scaleMax ?? 10} />
                )}
                {indicator.valueType === "nps" &&
                  displayValue !== null &&
                  indicator.respondents !== null &&
                  indicator.respondents < NPS_MIN_RESPONDENTS && (
                    <Tooltip label={`Calculado a partir de apenas ${indicator.respondents} respondente${indicator.respondents === 1 ? "" : "s"} — valor pouco representativo.`}>
                      <div className="flex items-center gap-[6px] justify-center mt-[4px] text-[12px] font-medium text-warning-900">
                        <AgoraIcon name="alert-triangle" size={14} className="text-warning-900" />
                        Amostra reduzida
                      </div>
                    </Tooltip>
                  )}
              </div>

              {/* Dropdowns */}
              <div className="flex flex-col gap-[16px] shrink-0 pt-[8px]">
                {[
                  { label: "Ano", defaultVal: "2025" },
                  { label: "Mês", defaultVal: "Todos" },
                ].map((dd) => (
                  <div key={dd.label} className="flex flex-col gap-[4px]">
                    <label className="text-[12px] font-semibold text-primary-700 uppercase tracking-wide">
                      {dd.label}
                    </label>
                    <div className="relative">
                      <select disabled className="appearance-none bg-neutral-100 border border-neutral-200 rounded-[6px] px-[10px] py-[8px] pr-[28px] text-[13px] text-neutral-400 min-w-[120px] cursor-not-allowed">
                        <option>{dd.defaultVal}</option>
                      </select>
                      <AgoraIcon name="chevron-down" className="size-[12px] text-neutral-400 absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                ))}

                {/* Canal — ativo sempre que existirem dados reais por canal para este indicador+serviço */}
                <div className="flex flex-col gap-[4px]">
                  <label className="text-[12px] font-semibold text-primary-700 uppercase tracking-wide">
                    Canal
                  </label>
                  <div className="relative">
                    <select
                      disabled={indicator.channelData.length === 0}
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                      className={`appearance-none border rounded-[6px] px-[10px] py-[8px] pr-[28px] text-[13px] min-w-[120px] ${
                        indicator.channelData.length === 0
                          ? "bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed"
                          : "bg-white border-neutral-300 text-primary-900 cursor-pointer"
                      }`}
                    >
                      <option value="Todos">Todos</option>
                      {indicator.channelData.map((c) => (
                        <option key={c.channel} value={c.channel}>
                          {c.channel}
                        </option>
                      ))}
                    </select>
                    <AgoraIcon
                      name="chevron-down"
                      className={`size-[12px] absolute right-[8px] top-1/2 -translate-y-1/2 pointer-events-none ${
                        indicator.channelData.length === 0 ? "text-neutral-400" : "text-primary-700"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footnote */}
            <p className="text-[11px] text-neutral-400 italic px-[24px] pb-[16px]">
              *Dados provisórios em atualização.
            </p>

            {/* Separator */}
            <div className="h-px bg-neutral-100 mx-[24px]" />

            {/* Footer pill buttons */}
            <div className="flex items-center gap-[8px] px-[24px] py-[16px]">
              <button disabled className="flex items-center gap-[6px] text-[13px] text-neutral-400 border border-neutral-200 rounded-full px-[14px] py-[7px] cursor-not-allowed">
                <AgoraIcon name="download" size={13} className="text-neutral-400" />
                Exportar
              </button>
              <button disabled className="flex items-center gap-[6px] text-[13px] text-neutral-400 border border-neutral-200 rounded-full px-[14px] py-[7px] cursor-not-allowed">
                <AgoraIcon name="share" size={13} className="text-neutral-400" />
                Partilhar
              </button>
              <button disabled className="flex items-center gap-[6px] text-[13px] text-neutral-400 border border-neutral-200 rounded-full px-[14px] py-[7px] cursor-not-allowed">
                <AgoraIcon name="like" size={13} />
                Adicionar aos Favoritos
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Right sidebar: Ficha Técnica */}
        <div className="w-[340px] shrink-0">
          <div className="bg-primary-100 rounded-[12px] p-[24px] shadow-sm border border-neutral-100">
            <div className="flex items-center gap-[8px] mb-[12px]">
              <AgoraIcon name="document" className="size-[18px] text-primary-800 shrink-0" />
              <h3 className="text-[16px] font-semibold text-primary-900">
                Ficha Técnica da Visualização
              </h3>
            </div>
            <div className="h-px bg-primary-300 mb-[16px]" />
            <div className="space-y-[14px]">
              {techFields.map((field) => (
                <div key={field.label}>
                  <dt className="text-[12px] font-semibold text-primary-500 uppercase tracking-wide mb-[2px]">
                    {field.label}
                  </dt>
                  <dd className="text-[14px] text-primary-800">
                    {field.value}
                  </dd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Compare button */}
      <div className="mb-[40px]">
        <button disabled className="bg-neutral-100 text-neutral-400 px-[20px] py-[12px] rounded-[8px] text-[14px] font-medium cursor-not-allowed flex items-center gap-[8px]">
          <AgoraIcon name="bar-chart" size={16} className="text-neutral-400" />
          Comparar entre Serviços e Indicadores
        </button>
      </div>

      {/* Innovation suggestions */}
      <section className="mb-[40px]">
        <h2 className="text-[22px] font-bold text-primary-900 mb-[16px]">
          Como Inovar para Melhorar o Indicador?
        </h2>
        {suggestions.length === 0 ? (
          <p className="text-[13px] text-primary-400">
            Ainda não há boas práticas de inovação para esta dimensão.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-[16px]">
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} title={s.title} description={s.description} link={s.link} />
            ))}
          </div>
        )}
      </section>

      {/* Tools for Innovation */}
      <ToolsForInnovationSection
        caseStudies={caseStudies.map((c) => ({ ...c, dimension: indicator.priority }))}
        dimension={indicator.priority}
      />

      {/* Get Help */}
      <GetHelpSection />
    </AppLayout>
  );
}
