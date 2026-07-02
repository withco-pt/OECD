"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import SwapServiceBar from "./SwapServiceBar";

export default function AppLayout({
  children,
  hideSwapBar = false,
}: {
  children: React.ReactNode;
  hideSwapBar?: boolean;
}) {
  return (
    <div className="bg-neutral-50 min-h-screen">
      <Header />
      <Sidebar />
      <main className="ml-[316px] mt-[72px]">
        {!hideSwapBar && <SwapServiceBar />}
        <div className="px-[32px] pt-[40px] pb-[40px]">{children}</div>
      </main>
    </div>
  );
}
