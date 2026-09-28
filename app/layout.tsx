import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KPI Dashboard",
  description: "De Vlasschuur KPI Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} bg-soft`}
      >
        {children}
      </body>
    </html>
  );
}
