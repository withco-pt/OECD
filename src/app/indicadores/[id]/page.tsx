"use client";

import { AgoraIcon } from "@/components/icons/AgoraIcon";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import Breadcrumb from "@/components/Breadcrumb";
import EmptyChartState from "@/components/EmptyChartState";
import HelpTooltip from "@/components/HelpTooltip";
import IndicatorViz from "@/components/IndicatorViz";
import {
  SuggestionCard,
  ToolsForInnovationSection,
  GetHelpSection,
  type CaseStudy,
  type InnovationSuggestion,
} from "@/components/InnovationHelp";
import { useSelectedService } from "@/context/SelectedServiceContext";
import { supabase } from "@/lib/supabase";

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
      <path d="M45.0385 192.213L44.6769 194.496L34.3706 192.863C34.0082 192.806 33.6748 192.753 33.3704 192.705C33.0538 192.64 32.7517 192.577 32.4641 192.517C32.162 192.454 31.8744 192.394 31.6013 192.336C31.7599 192.554 31.9101 192.778 32.0519 193.009C32.1937 193.239 32.3599 193.503 32.5505 193.801L33.6517 195.714L31.9872 196.654L29.2108 191.667L29.5138 189.754L45.0385 192.213Z" fill="white" fillOpacity="0.9"/>
      <path d="M66.5223 138.729L61.725 148.144L60.1166 147.324L58.2876 141.846C57.9282 140.773 57.6069 139.869 57.3237 139.131C57.0274 138.387 56.6973 137.774 56.3334 137.292C55.9564 136.804 55.4802 136.413 54.9049 136.12C54.1857 135.753 53.5429 135.689 52.9766 135.928C52.3973 136.16 51.9377 136.609 51.5979 137.276C51.2714 137.917 51.1025 138.556 51.0911 139.192C51.0666 139.822 51.1302 140.522 51.2819 141.291L49.3196 141.699C49.1859 141.153 49.0982 140.598 49.0566 140.033C49.0216 139.455 49.0622 138.858 49.1784 138.242C49.3014 137.613 49.5294 136.972 49.8625 136.318C50.3156 135.429 50.8623 134.744 51.5026 134.263C52.1299 133.775 52.8113 133.505 53.5468 133.451C54.289 133.385 55.0393 133.545 55.7977 133.931C56.36 134.218 56.8463 134.573 57.2566 134.996C57.6538 135.412 58.0045 135.904 58.3087 136.471C58.6196 137.024 58.9003 137.653 59.1509 138.357C59.4016 139.062 59.655 139.825 59.9113 140.647L61.1124 144.545L61.2105 144.595L64.6785 137.789L66.5223 138.729Z" fill="white" fillOpacity="0.9"/>
      <path d="M92.9541 87.2824C93.4522 87.7805 93.7895 88.3149 93.9659 88.8857C94.1424 89.4357 94.1683 90.0013 94.0438 90.5824C93.9192 91.1636 93.6806 91.7344 93.3277 92.2948L93.39 92.357C94.3862 91.5683 95.3306 91.1843 96.2231 91.2051C97.1156 91.2051 97.9302 91.5735 98.667 92.3103C99.3104 92.9537 99.7307 93.6854 99.9279 94.5052C100.125 95.3043 100.047 96.1708 99.6944 97.1048C99.3416 98.018 98.667 98.9728 97.6708 99.969C97.0792 100.561 96.4825 101.064 95.8806 101.479C95.2787 101.894 94.6405 102.221 93.9659 102.46L92.4716 100.965C93.1772 100.737 93.857 100.42 94.5108 100.016C95.1749 99.6006 95.7509 99.1492 96.2386 98.6614C97.183 97.7171 97.6863 96.8609 97.7486 96.093C97.8005 95.3146 97.5047 94.6038 96.8613 93.9604C96.4462 93.5453 96 93.317 95.5226 93.2754C95.0348 93.2236 94.5056 93.3585 93.9348 93.6802C93.3537 93.9915 92.731 94.4792 92.0668 95.1434L91.055 96.1552L89.7007 94.801L90.7281 93.7736C91.3612 93.1405 91.797 92.549 92.0357 91.999C92.264 91.4386 92.3263 90.9197 92.2225 90.4423C92.1187 89.965 91.88 89.5395 91.5064 89.1659C91.0083 88.6678 90.4583 88.4498 89.8564 88.5121C89.2545 88.5536 88.6474 88.8805 88.0351 89.4928C87.6615 89.8664 87.3554 90.2556 87.1167 90.6603C86.8884 91.0546 86.712 91.449 86.5874 91.8433C86.4629 92.2377 86.3591 92.6424 86.2761 93.0575L84.3303 92.7306C84.403 92.2429 84.5223 91.7396 84.6883 91.2207C84.8648 90.6914 85.119 90.1673 85.4511 89.6485C85.7832 89.1088 86.2035 88.5848 86.712 88.0762C87.8639 86.9243 88.9899 86.3069 90.0899 86.2238C91.1899 86.1201 92.1447 86.4729 92.9541 87.2824Z" fill="white" fillOpacity="0.9"/>
      <path d="M144.19 57.6515L142.249 58.6409L143.828 61.7401L141.807 62.7695L140.228 59.6703L133.736 62.9784L132.896 61.3308L134.602 48.7256L136.662 47.6762L141.349 56.8756L143.291 55.8861L144.19 57.6515ZM137.39 54.0997C137.23 53.7859 137.077 53.4851 136.93 53.1974C136.797 52.9031 136.67 52.6218 136.55 52.3536C136.423 52.0723 136.303 51.8205 136.189 51.5982C136.083 51.3562 135.989 51.1403 135.909 50.9506L135.83 50.9906C135.859 51.3054 135.865 51.6401 135.848 51.9947C135.844 52.3426 135.817 52.6611 135.767 52.9503L134.798 60.2137L139.329 57.905L137.39 54.0997Z" fill="#F2F6FF"/>
      <path d="M192.311 38.2739C193.343 38.1289 194.269 38.1839 195.091 38.439C195.912 38.6941 196.581 39.1336 197.099 39.7574C197.631 40.3792 197.966 41.1842 198.105 42.1725C198.258 43.2625 198.158 44.2326 197.803 45.0827C197.448 45.9329 196.857 46.631 196.03 47.1771C195.217 47.7211 194.178 48.0819 192.914 48.2596C192.115 48.372 191.349 48.4055 190.616 48.3603C189.884 48.315 189.251 48.1891 188.718 47.9824L188.421 45.8678C188.987 46.0994 189.654 46.2577 190.422 46.3424C191.204 46.4251 191.936 46.4185 192.62 46.3225C193.361 46.2183 193.978 46.0205 194.47 45.729C194.975 45.4208 195.341 45.0211 195.569 44.5297C195.809 44.0218 195.88 43.419 195.781 42.7214C195.649 41.7767 195.25 41.0992 194.584 40.6888C193.932 40.2618 192.973 40.1372 191.709 40.3149C191.302 40.3721 190.849 40.4727 190.35 40.6169C189.867 40.759 189.477 40.8879 189.182 41.0034L188.025 40.5213L187.557 32.9176L195.557 31.7932L195.845 33.8424L189.85 34.6849L190.074 38.8106C190.315 38.7322 190.622 38.6447 190.993 38.548C191.363 38.4368 191.802 38.3454 192.311 38.2739Z" fill="#F2F6FF"/>
      <path d="M242.971 40.5526C243.145 39.6594 243.373 38.7918 243.657 37.9498C243.954 37.1106 244.329 36.3386 244.78 35.6339C245.248 34.9175 245.813 34.3172 246.475 33.833C247.14 33.3343 247.923 33.0005 248.823 32.8316C249.74 32.6511 250.796 32.677 251.992 32.9094C252.295 32.9683 252.63 33.0485 252.999 33.1501C253.386 33.2401 253.694 33.3449 253.925 33.4646L253.551 35.3878C253.294 35.2482 253.004 35.1246 252.681 35.0169C252.373 34.9121 252.06 34.8289 251.743 34.7673C250.749 34.5741 249.899 34.5657 249.191 34.7422C248.484 34.9187 247.892 35.2371 247.414 35.6974C246.935 36.1576 246.541 36.7239 246.231 37.3962C245.924 38.0541 245.669 38.7894 245.466 39.6022L245.596 39.6274C245.879 39.3237 246.206 39.0657 246.576 38.8536C246.946 38.6415 247.377 38.501 247.869 38.4321C248.36 38.3633 248.909 38.3877 249.514 38.5053C250.407 38.6789 251.149 39.0174 251.739 39.5208C252.343 40.027 252.757 40.668 252.98 41.444C253.217 42.2227 253.238 43.1163 253.042 44.1247C252.831 45.2052 252.441 46.1011 251.869 46.8122C251.314 47.5117 250.622 47.9976 249.791 48.2698C248.975 48.5447 248.049 48.5814 247.012 48.3798C246.262 48.2342 245.59 47.9615 244.995 47.5618C244.4 47.162 243.912 46.6336 243.532 45.9765C243.151 45.3195 242.906 44.5393 242.798 43.6362C242.692 42.7186 242.75 41.6907 242.971 40.5526ZM247.36 46.4739C248.181 46.6336 248.902 46.4972 249.525 46.065C250.15 45.6184 250.573 44.826 250.794 43.6879C250.971 42.7803 250.88 42.0151 250.523 41.3925C250.18 40.7726 249.554 40.3745 248.647 40.1981C248.027 40.0777 247.462 40.1023 246.95 40.272C246.439 40.4417 246.014 40.7031 245.677 41.056C245.339 41.409 245.129 41.7944 245.048 42.2122C244.961 42.6588 244.941 43.1108 244.987 43.5682C245.032 44.0256 245.142 44.4582 245.317 44.8659C245.507 45.2765 245.768 45.6263 246.1 45.9152C246.436 46.1897 246.855 46.3759 247.36 46.4739Z" fill="#F2F6FF"/>
      <path d="M296.921 60.4538L309.179 51.7705L302.03 47.6429L303.064 45.8508L312.387 51.2332L311.551 52.6822L299.114 61.7196L296.921 60.4538Z" fill="#F2F6FF"/>
      <path d="M355.551 84.1822C356.158 84.88 356.586 85.5965 356.837 86.3318C357.098 87.0575 357.153 87.7583 357.002 88.4344C356.86 89.1215 356.474 89.7394 355.842 90.2882C355.366 90.7023 354.864 90.9636 354.336 91.0724C353.808 91.1811 353.262 91.1897 352.696 91.0981C352.141 90.9969 351.586 90.8281 351.03 90.5915C351.202 91.2589 351.307 91.9165 351.345 92.5641C351.404 93.2132 351.34 93.8225 351.155 94.3921C350.979 94.9728 350.62 95.499 350.077 95.9708C349.412 96.5485 348.692 96.8831 347.916 96.9744C347.16 97.0672 346.39 96.9301 345.604 96.5631C344.818 96.1961 344.079 95.6138 343.385 94.8163C342.644 93.9634 342.136 93.1217 341.861 92.291C341.596 91.4715 341.561 90.7044 341.757 89.9899C341.963 89.2657 342.405 88.61 343.08 88.0226C343.623 87.5508 344.19 87.2524 344.781 87.1273C345.373 87.0022 345.971 86.9972 346.577 87.1124C347.183 87.2276 347.773 87.4145 348.348 87.6732C348.242 87.104 348.193 86.544 348.2 85.9932C348.218 85.4327 348.333 84.905 348.545 84.41C348.756 83.915 349.1 83.4606 349.576 83.0465C350.197 82.5073 350.851 82.2202 351.54 82.1852C352.24 82.1405 352.937 82.2933 353.63 82.6434C354.333 83.0047 354.974 83.5176 355.551 84.1822ZM344.587 89.6884C344.044 90.1602 343.759 90.7385 343.732 91.4232C343.716 92.0982 344.045 92.8234 344.719 93.5988C345.162 94.1083 345.605 94.4618 346.049 94.6593C346.514 94.8582 346.962 94.9259 347.392 94.8624C347.835 94.7893 348.238 94.5939 348.604 94.2762C348.969 93.9584 349.204 93.5795 349.307 93.1394C349.421 92.7104 349.433 92.2328 349.345 91.7065C349.278 91.1816 349.14 90.6206 348.932 90.0235L348.815 89.6876C348.232 89.3972 347.69 89.198 347.188 89.0901C346.685 88.9821 346.218 88.9703 345.786 89.0545C345.363 89.1497 344.963 89.361 344.587 89.6884ZM354.158 85.3643C353.686 84.8216 353.159 84.483 352.575 84.3485C352.001 84.2252 351.459 84.3849 350.95 84.8279C350.584 85.1456 350.351 85.5038 350.25 85.9025C350.15 86.3012 350.135 86.7319 350.207 87.1946C350.29 87.6477 350.402 88.1237 350.544 88.6226C351.007 88.8422 351.448 89.0135 351.866 89.1363C352.295 89.2495 352.709 89.2785 353.108 89.2232C353.518 89.1582 353.906 88.9669 354.272 88.6492C354.781 88.2063 355.015 87.692 354.972 87.1065C354.93 86.521 354.659 85.9403 354.158 85.3643Z" fill="white" fillOpacity="0.9"/>
      <path d="M387.727 140.024C386.952 140.472 386.144 140.862 385.302 141.195C384.474 141.521 383.639 141.749 382.799 141.878C381.971 142 381.147 141.968 380.327 141.78C379.527 141.598 378.758 141.22 378.02 140.646C377.302 140.078 376.639 139.266 376.03 138.211C375.883 137.957 375.723 137.651 375.551 137.293C375.378 136.935 375.257 136.624 375.189 136.358L376.886 135.379C376.949 135.664 377.046 135.964 377.176 136.278C377.314 136.605 377.464 136.909 377.625 137.188C378.132 138.065 378.673 138.71 379.25 139.123C379.848 139.54 380.477 139.779 381.138 139.838C381.806 139.909 382.496 139.842 383.207 139.635C383.917 139.428 384.63 139.135 385.343 138.757L385.277 138.642C384.875 138.621 384.472 138.54 384.069 138.399C383.667 138.259 383.278 138.026 382.903 137.7C382.536 137.387 382.191 136.951 381.868 136.391C381.42 135.616 381.189 134.834 381.175 134.046C381.168 133.271 381.377 132.548 381.804 131.878C382.243 131.201 382.908 130.605 383.798 130.091C384.764 129.534 385.692 129.235 386.584 129.194C387.496 129.159 388.327 129.366 389.077 129.814C389.835 130.275 390.47 130.95 390.984 131.84C391.366 132.501 391.601 133.187 391.69 133.898C391.778 134.61 391.7 135.324 391.453 136.043C391.207 136.761 390.779 137.457 390.168 138.132C389.558 138.806 388.744 139.437 387.727 140.024ZM389.336 132.816C388.918 132.092 388.335 131.64 387.588 131.462C386.841 131.283 385.972 131.48 384.98 132.052C384.167 132.522 383.635 133.083 383.385 133.736C383.142 134.401 383.256 135.141 383.725 135.954C384.048 136.514 384.442 136.93 384.905 137.205C385.381 137.472 385.857 137.621 386.332 137.652C386.82 137.675 387.255 137.577 387.636 137.357C388.018 137.137 388.366 136.859 388.681 136.525C388.996 136.19 389.251 135.823 389.444 135.424C389.637 135.024 389.729 134.598 389.722 134.145C389.722 133.704 389.593 133.261 389.336 132.816Z" fill="white" fillOpacity="0.9"/>
      <path d="M390.871 185.792L390.515 183.508L400.825 181.9C401.188 181.844 401.521 181.792 401.826 181.744C402.147 181.709 402.454 181.676 402.746 181.645C403.053 181.612 403.345 181.581 403.623 181.553C403.405 181.394 403.193 181.226 402.987 181.051C402.782 180.875 402.543 180.674 402.27 180.449L400.635 178.967L401.931 177.561L406.103 181.456L406.402 183.37L390.871 185.792ZM401.125 200.397C399.863 200.593 398.724 200.667 397.706 200.618C396.691 200.583 395.802 200.41 395.04 200.098C394.296 199.798 393.689 199.336 393.22 198.711C392.753 198.1 392.447 197.324 392.3 196.381C392.114 195.192 392.281 194.163 392.799 193.295C393.317 192.427 394.141 191.712 395.271 191.15C396.416 190.585 397.822 190.172 399.49 189.912C401.172 189.65 402.634 189.593 403.875 189.741C405.118 189.904 406.112 190.321 406.855 190.992C407.613 191.661 408.09 192.626 408.287 193.888C408.472 195.077 408.306 196.105 407.788 196.974C407.286 197.854 406.47 198.575 405.34 199.138C404.212 199.715 402.807 200.134 401.125 200.397ZM399.85 192.218C398.501 192.428 397.392 192.698 396.522 193.027C395.653 193.355 395.026 193.765 394.642 194.256C394.26 194.761 394.125 195.369 394.235 196.079C394.346 196.79 394.652 197.321 395.153 197.674C395.67 198.039 396.393 198.246 397.321 198.294C398.267 198.354 399.413 198.28 400.762 198.069C402.111 197.859 403.211 197.583 404.064 197.242C404.934 196.914 405.56 196.497 405.941 195.992C406.325 195.501 406.462 194.9 406.351 194.19C406.24 193.479 405.926 192.941 405.409 192.577C404.894 192.226 404.172 192.027 403.243 191.978C402.329 191.928 401.198 192.008 399.85 192.218Z" fill="white" fillOpacity="0.9"/>
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

function CountKPI({ value, previousValue }: { value: number | null; previousValue: number | null }) {
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
      {delta != null && <p className="text-[13px] text-primary-500">vs. período anterior</p>}
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
        missingData: value === null,
        metric: (ind.escala_descricao as string) ?? "—",
        valueType: vt,
        value,
        previousValue,
        valueText,
        respondents: resp,
        scaleMin,
        scaleMax,
        categoryCounts,
        channelData,
        districtData,
      });

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
  }, [id, selectedService]);

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
          const isDisabled = tab === "Visualização ao Longo do Tempo";
          return (
            <button
              key={tab}
              onClick={() => !isDisabled && setActiveTab(tab)}
              disabled={isDisabled}
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
              channelData={indicator.channelData}
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
                  <CountKPI value={displayValue} previousValue={indicator.previousValue} />
                ) : indicator.valueType === "decimal" ? (
                  /Tempo|R[áa]cio/i.test(indicator.metric) ? (
                    <RatioStat value={displayValue} unit={indicator.metric.match(/\(([^)]+)\)/)?.[1] ?? null} />
                  ) : (
                    <CountKPI value={displayValue} previousValue={indicator.previousValue} />
                  )
                ) : (
                  <FigmaGauge value={displayValue} min={indicator.scaleMin ?? 1} max={indicator.scaleMax ?? 10} />
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
      />

      {/* Get Help */}
      <GetHelpSection />
    </AppLayout>
  );
}
