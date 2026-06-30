"use client";

import { Bell, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  return (
    <header className="bg-primary-600 drop-shadow-[0px_2px_2px_rgba(0,0,0,0.05)] flex items-center justify-between px-[35px] py-[12px] w-full h-[72px] fixed top-0 z-50">
      <p className="font-bold leading-[24px] text-[20px] text-white w-[295px]">
        Matriz para a Inovação nos Serviços Públicos
      </p>
      <div className="flex gap-[32px] items-center">
        <div className="flex gap-[8px] items-center">
          <div className="inline-grid place-items-center relative">
            <div className="col-start-1 row-start-1 size-[42px] rounded-full bg-primary-200 flex items-center justify-center">
              <span className="font-bold text-[16px] text-primary-700">MS</span>
            </div>
          </div>
          <div className="flex flex-col gap-[8px] text-[14px] text-white whitespace-nowrap">
            <span className="font-semibold leading-[16px]">Maria Silva</span>
            <span className="font-normal leading-[16px]">Autoridade Tributária e Aduaneira</span>
          </div>
        </div>
        <div className="flex gap-[16px] items-center">
          <button className="bg-primary-400 flex items-center justify-center size-[42px] rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
            <Bell className="size-[18px] text-white" />
          </button>
          <button onClick={() => router.push("/entrada")} className="bg-primary-800 flex items-center justify-center size-[42px] rounded-full cursor-pointer hover:bg-primary-900 transition-colors">
            <LogOut className="size-[18px] text-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
