"use client";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f3] p-6 font-sans">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Document Card */}
        <div className="relative w-24 h-32 bg-white border-4 border-black shadow-[8px_8px_0px_black] animate-bounce flex flex-col p-4 gap-3">
          {/* Document Lines */}
          <div className="h-2 w-full bg-black/10 rounded-full" />
          <div className="h-2 w-full bg-black/10 rounded-full" />
          <div className="h-2 w-2/3 bg-black/10 rounded-full" />

          {/* Scanning Bar - Tailwind 4 supports arbitrary values easily */}
          <div className="absolute inset-x-0 top-0 h-1.5 bg-[#bde3ff] border-y-2 border-black animate-[pulse_1.5s_infinite]" />

          {/* DaisyUI Infinity Icon at bottom */}
          <div className="mt-auto flex justify-center">
            <span className="loading loading-infinity loading-md text-black"></span>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-black">
            Analyzing...
          </h2>
          <p className="text-black font-bold opacity-70">
            IntelliDoc AI is reading your file
          </p>
        </div>

        {/* Brutalist Progress Bar */}
        <div className="w-64 h-6 border-4 border-black bg-white shadow-[4px_4px_0px_black] p-1">
          <div className="h-full bg-[#cfe9ff] border-r-4 border-black animate-[loading_2s_infinite] w-1/3" />
        </div>
      </div>

      {/* Basic inline style for the loading slider if not defined in global CSS */}
      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
}
