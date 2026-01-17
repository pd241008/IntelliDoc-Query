import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import NavBar from "@/components/ui/NavBar";
import Providers from "@/app/provider";
import SystemHealthTooltip from "@/components/ui/SystemHealthTooltip"; // ✅ added

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntelliDoc",
  description: "Smart document management with reminders",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} ${geistMono.variable}
          antialiased bg-[#faf9f3] text-black
          overflow-hidden
        `}>
        <Providers>
          {/* NAVBAR (fixed, isolated layer) */}
          <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
            <NavBar />
          </header>

          {/* SCROLL CONTEXT */}
          <div
            className="
              relative h-screen overflow-y-auto overflow-x-hidden
              perspective-1200px
            ">
            {/* PAGE CANVAS */}
            <main
              className="
                relative pt-140px
                will-change-transform
                translate-z-0 pt-15
              ">
              {children}
            </main>
          </div>

          {/* ✅ SYSTEM HEALTH INDICATOR (global, non-intrusive) */}
          <SystemHealthTooltip />
        </Providers>
      </body>
    </html>
  );
}
