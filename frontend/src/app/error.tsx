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
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f3] px-6">
      <div className="max-w-md w-full border-2 border-black rounded-xl bg-white p-8 shadow-[6px_6px_0px_black] text-center space-y-4">
        <h2 className="text-2xl font-bold">⚠️ Something went wrong</h2>

        <p className="text-sm text-gray-700">
          {error.message || "An unexpected error occurred."}
        </p>

        <button
          onClick={reset}
          className="mt-4 px-6 py-2 border-2 border-black rounded-lg bg-[#faf9f3] font-semibold shadow-[3px_3px_0px_black] hover:translate-x-1 hover:translate-y-1 transition">
          Try Again
        </button>
      </div>
    </div>
  );
}
