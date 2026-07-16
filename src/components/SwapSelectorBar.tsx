"use client";

import { useSelectedChannel } from "@/context/SelectedChannelContext";
import SwapServiceBar from "@/components/SwapServiceBar";
import SwapChannelBar from "@/components/SwapChannelBar";

// Mostra o banner da lente ativa. O alternador Serviço | Canal vive dentro de
// cada banner (componente ModeSwitch), no lugar do antigo título.
export default function SwapSelectorBar() {
  const { viewMode } = useSelectedChannel();
  return viewMode === "service" ? <SwapServiceBar /> : <SwapChannelBar />;
}
