"use client";

import { Heart, ArrowLeftRight } from "lucide-react";

export default function SwapServiceBar() {
  return (
    <div className="bg-secondary-200 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.05)] flex flex-col gap-[6px] px-[32px] py-[16px] w-full">
      <p className="font-semibold text-[16px] leading-[23px] text-primary-900">
        Serviço Selecionado
      </p>
      <button className="bg-[#B5E0FF] flex items-center justify-between px-[12px] py-[6px] rounded-[10px] w-full cursor-pointer">
        <div className="flex gap-[8px] items-center">
          <Heart className="size-[20px] text-primary-900" />
          <span className="font-semibold text-[20px] leading-[27px] text-primary-900">
            Alteração de Morada
          </span>
        </div>
        <div className="bg-secondary-800 hover:bg-secondary-900 transition-colors flex gap-[6px] items-center justify-center px-[12px] py-[8px] rounded-[15px] h-[36px]">
          <span className="font-medium text-[14px] leading-[20px] text-white whitespace-nowrap">
            Alterar Serviço
          </span>
          <ArrowLeftRight className="size-[18px] text-white" />
        </div>
      </button>
    </div>
  );
}
