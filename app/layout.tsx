import type { Metadata } from "next";
import {
  Instrument_Sans,
  Instrument_Serif,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vouch-chaitu0608.vercel.app"),
  title: {
    default: "Vouch — receipts for agent work",
    template: "%s · Vouch",
  },
  description:
    "Vouch records a run across the browser and the Mac, seals every event into a SHA-256 chain, and gives you an evidence room you can replay, verify, and share.",
  keywords: [
    "AI agents",
    "agent observability",
    "agent receipts",
    "browser automation",
    "native automation",
    "MCP",
    "flight recorder",
    "evidence",
    "tamper-evident",
  ],
  authors: [{ name: "Chaitu" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Vouch — receipts for agent work",
    description:
      "Cross-surface agent runs with receipts. Browser + native, sealed with a SHA-256 chain.",
    type: "website",
    url: "/",
    siteName: "Vouch",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vouch — receipts for agent work",
    description:
      "Cross-surface agent runs with receipts. Browser + native, sealed with a SHA-256 chain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable}`}
    >
      <body className="font-sans">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
