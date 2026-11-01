import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/figtree";
import "@fontsource/pinyon-script";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import ConsentBanner from "@/components/ConsentBanner";
import { DecorDefs } from "@/components/Decor";
import { pixelId, siteUrl } from "@/lib/config";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vianočné darčekové poukážky | Relax Žilina",
  description:
    "Darčekové poukážky na kozmetické ošetrenia, lash lifting a EMSzero v Relax Žilina. Zaplatíte online, poukážka v PDF príde hneď e-mailom.",
  openGraph: {
    title: "Vianočné darčekové poukážky | Relax Žilina",
    description: "Vyberte darček online, poukážka v PDF príde hneď e-mailom.",
    locale: "sk_SK",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#2A0D1B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk">
      <body>
        <DecorDefs />
        {children}
        <ConsentBanner />
        <MetaPixel pixelId={pixelId} />
      </body>
    </html>
  );
}
