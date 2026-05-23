"use client";

import { useEffect } from "react";
import {
  LucideFileWarning,
  LucideRotateCcw,
  LucideLayoutGrid,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface UploadErrorProps {
  error: Error;
  reset: () => void;
}

export default function UploadError({ error, reset }: UploadErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Upload AI Processing Error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#faf9f3] px-6 font-sans text-black">
      <div className="max-w-md w-full border-[6px] border-black rounded-[40px] bg-white p-10 shadow-[20px_20px_0px_#ff5a5a] text-center relative overflow-hidden">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#ffde59] border-4 border-black rounded-full opacity-10" />

        <div className="relative mx-auto w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-[#ff5a5a] border-4 border-black rounded-2xl shadow-[6px_6px_0px_black] -rotate-3 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <LucideFileWarning
              size={48}
              strokeWidth={3}
            />
          </div>
        </div>

        <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter leading-none">
          Extraction <br /> Failed
        </h2>

        <p className="font-bold opacity-60 mb-8 uppercase text-[10px] tracking-[0.2em]">
          Intellidoc AI failed to read metadata
        </p>

        <div className="border-4 border-black bg-[#fff0f0] rounded-2xl mb-8 flex flex-col items-center p-4 shadow-[4px_4px_0px_black]">
          <span className="text-xs font-mono font-black uppercase leading-tight text-center">
            {error.message ||
              "The AI engine encountered a timeout while analyzing your document."}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 py-4 rounded-full border-4 border-black bg-[#cfe9ff] font-black text-lg shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <LucideRotateCcw
              size={20}
              strokeWidth={3}
            />
            RE-UPLOAD
          </button>

          <button
            onClick={() => router.push("/gallerypage")}
            className="flex items-center justify-center gap-2 py-4 rounded-full border-4 border-black bg-white font-black text-lg shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <LucideLayoutGrid
              size={20}
              strokeWidth={3}
            />
            VIEW VAULT
          </button>
        </div>

        <div className="absolute -bottom-2 -right-4 bg-black text-[#ffde59] text-[9px] font-black px-6 py-2 rotate-[-10deg] uppercase tracking-widest border-l-4 border-t-4 border-black">
          ERR_EXTRACT_04
        </div>
      </div>
    </main>
  );
}
