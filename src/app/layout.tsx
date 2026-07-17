import type { Metadata } from "next";
import "./globals.css";
import { SelectedServiceProvider } from "@/context/SelectedServiceContext";
import { SelectedEntityProvider } from "@/context/SelectedEntityContext";
import { SelectedChannelProvider } from "@/context/SelectedChannelContext";

export const metadata: Metadata = {
  title: "Matriz para a Avaliação nos Serviços Públicos",
  description: "Plataforma de monitorização de serviços públicos — OCDE/OPSI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50">
        <SelectedEntityProvider>
          <SelectedChannelProvider>
            <SelectedServiceProvider>{children}</SelectedServiceProvider>
          </SelectedChannelProvider>
        </SelectedEntityProvider>
      </body>
    </html>
  );
}
