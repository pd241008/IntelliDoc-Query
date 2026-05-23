"use client";

import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f3] px-6 font-sans">
      {/* Neo-brutalist Error Card */}
      <div className="max-w-md w-full border-4 border-black rounded-[40px] bg-white p-10 shadow-[16px_16px_0px_black] text-center relative overflow-hidden">
        {/* Warning Icon */}
        <div className="mx-auto w-20 h-20 bg-[#ff5a5a] border-4 border-black rounded-full flex items-center justify-center text-4xl mb-6 shadow-[4px_4px_0px_black] animate-pulse">
          ✕
        </div>

        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter text-black">
          System Error
        </h2>

        {/* DaisyUI Alert Style within the card */}
        <div className="alert border-2 border-black bg-[#fff0f0] rounded-2xl mb-8 flex flex-col items-center p-4">
          <span className="text-sm font-mono font-bold text-black break-all">
            {error.message ||
              "An unexpected error occurred during document processing."}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={reset}
            className="btn btn-lg w-full rounded-full border-4 border-black bg-[#cfe9ff] text-black font-black shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            TRY AGAIN
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="text-black font-black uppercase text-sm underline decoration-4 hover:bg-black hover:text-white transition-colors p-2">
            Back to Dashboard
          </button>
        </div>

        {/* Decorative Corner Text */}
        <div className="absolute -top-2 -right-4 text-xs font-black italic opacity-20 rotate-12">
          CRITICAL_FAIL_01
        </div>
      </div>
    </div>
  );
}
