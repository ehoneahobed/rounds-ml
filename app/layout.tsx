import type { ReactNode } from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Source_Sans_3 } from "next/font/google";
import "katex/dist/katex.min.css";
import { Shell } from "@/components/shell";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Rounds",
    template: "%s · Rounds",
  },
  description:
    "Machine learning study modules: concepts, knowledge checks, and auto-graded tasks on synthetic practice data.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${newsreader.variable} ${plex.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
