"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import SwapServiceBar from "./SwapServiceBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-[316px] mt-[72px]">
        <SwapServiceBar />
        <div className="px-[32px] pt-[40px] pb-[40px]">{children}</div>
      </main>
    </div>
  );
}
