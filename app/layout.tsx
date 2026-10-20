import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://witness-chaitu0608.vercel.app"),
  title: {
    default: "Witness — the flight recorder for AI agents",
    template: "%s · Witness",
  },
  description:
    "Browsy captures the web. Clinqy captures the Mac. Witness turns both into a verifiable, tamper-evident run you can replay, audit, and share.",
  keywords: [
    "AI agents",
    "agent observability",
    "browser automation",
    "Browsy",
    "Clinqy",
    "MCP",
    "flight recorder",
  ],
  authors: [{ name: "Chaitu" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Witness — the flight recorder for AI agents",
    description:
      "Cross-surface agent runs with receipts. Browsy + Clinqy, sealed with a SHA-256 chain.",
    type: "website",
    url: "/",
    siteName: "Witness",
  },
  twitter: {
    card: "summary_large_image",
    title: "Witness — the flight recorder for AI agents",
    description:
      "Cross-surface agent runs with receipts. Browsy + Clinqy, sealed with a SHA-256 chain.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
