import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import NavBar from "@/components/ui/NavBar";
import Providers from "../app/provider";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#faf9f3]`}>
        <Providers>
          <NavBar />
          <main className="min-h-[calc(100vh-64px)] px-6 py-4">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
