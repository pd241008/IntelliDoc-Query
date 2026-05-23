"use client";

import { useEffect } from "react";
import {
  LucideFileWarning,
  LucideRotateCcw,
  LucideLayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UploadError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log specifically as a document processing failure
    console.error("Upload AI Processing Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf9f3] px-6 font-sans">
      {/* NEO-BRUTALIST ERROR CARD */}
      <div className="max-w-md w-full border-[6px] border-black rounded-[40px] bg-white p-10 shadow-[20px_20px_0px_#ff5a5a] text-center relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#ffde59] border-4px border-black rounded-full opacity-10" />

        {/* Warning Icon Container */}
        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-[#ff5a5a] border-4px border-black rounded-2xl shadow-[6px_6px_0px_black] rotate- -3deg animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <LucideFileWarning
              size={48}
              strokeWidth={3}
            />
          </div>
        </div>

        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-black leading-none">
          Extraction <br /> Failed
        </h2>

        {/* AI Processing Context */}
        <p className="text-black font-bold opacity-60 mb-8 uppercase text-[10px] tracking-[0.2em]">
          Intellidoc AI failed to read metadata
        </p>

        {/* Specific Error Message Box using DaisyUI Alert base */}
        <div className="alert border-4 border-black bg-[#fff0f0] rounded-2xl mb-8 flex flex-col items-center p-4 shadow-[4px_4px_0px_black]">
          <span className="text-xs font-mono font-black text-black uppercase leading-tight text-center">
            {error.message ||
              "The AI engine encountered a timeout while analyzing your document."}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Action: Retry local state reset */}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 py-4 rounded-full border-4 border-black bg-[#cfe9ff] text-black font-black text-lg shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
            <LucideRotateCcw
              size={20}
              strokeWidth={3}
            />
            RE-UPLOAD
          </button>

          {/* Action: Safe navigation to gallery */}
          <button
            onClick={() => router.push("/gallerypage")}
            className="flex items-center justify-center gap-2 py-4 rounded-full border-4 border-black bg-white text-black font-black text-lg shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
            <LucideLayoutGrid
              size={20}
              strokeWidth={3}
            />
            VIEW VAULT
          </button>
        </div>

        {/* Corner Error Label */}
        <div className="absolute -bottom-2 -right-4 bg-black text-[#ffde59] text-[9px] font-black px-6 py-2 rotate-[-10deg] uppercase tracking-widest border-l-4 border-t-4 border-black">
          ERR_EXTRACT_04
        </div>
      </div>
    </main>
  );
}
