import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import NavBar from "@/components/ui/NavBar";
import Providers from "@/app/provider";
import SystemHealthTooltip from "@/components/ui/SystemHealthTooltip";
import { auth0 } from "@/lib/auth0"; // ⭐ add this

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth0.getSession(); // ⭐ get user session

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
          {/* NAVBAR */}
          <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
            <NavBar user={session?.user} /> {/* ⭐ pass user */}
          </header>

          <div
            className="
              relative h-screen overflow-y-auto overflow-x-hidden
              perspective-1200px
            ">
            <main
              className="
                relative pt-140px
                will-change-transform
                translate-z-0 pt-15
              ">
              {children}
            </main>
          </div>

          <SystemHealthTooltip />
        </Providers>
      </body>
    </html>
  );
}
