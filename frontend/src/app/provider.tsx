"use client";

import { DocumentProvider } from "@/context/DocumentContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <DocumentProvider>{children}</DocumentProvider>;
}
