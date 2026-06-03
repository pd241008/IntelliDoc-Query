// components/ui/DocCard.tsx
"use client";

import Image from "next/image";
import { LucideExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface DocCardProps {
  title: string;
  imageUrl: string;
  date: string;
  id: string;
  onClick: () => void;
}

export default function DocCard({
  title,
  imageUrl,
  date,
  id,
  onClick,
}: DocCardProps) {
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        if (!res.ok) return;

        const data = await res.json();
        
        // Typical structure from our FastAPI Redis repo
        if (data && data.status) {
          setProcessingStatus(data.status);
          setProcessingStep(data.step || null);
          setProcessingMessage(data.message || null);

          // If the status is final (Completed or Error), stop polling
          if (data.status !== "Running" && data.status !== "Pending") {
            clearInterval(interval);
          }
        }
      } catch (e) {
        console.error(`Error fetching status for ${id}:`, e);
      }
    };

    // Only start polling if we suspect it might be processing,
    // or we just aggressively poll initially until we know the status.
    checkStatus();
    interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [id]);

  const isProcessing = processingStatus === "Running" || processingStatus === "Pending";

  return (
    <div
      className={`group relative border-[3px] border-black bg-white rounded-xl overflow-hidden shadow-[8px_8px_0px_black] transition-all ${isProcessing ? "opacity-90 grayscale-[0.2]" : "hover:translate-x-2px hover:translate-y-2px hover:shadow-none cursor-pointer"}`}
      onClick={isProcessing ? undefined : onClick}>
      {/* Parent container must be 'relative' for Next.js 'fill' to work.
          'aspect-video' maintains symmetry across the grid.
      */}
      <div className="relative aspect-video w-full bg-gray-100 border-b-[3px] border-black overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isProcessing ? (
          <div className="absolute inset-0 bg-[#faf9f3]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
            <Loader2 className="animate-spin text-[#ff5c00] mb-2" size={24} strokeWidth={3} />
            <h4 className="font-black uppercase tracking-tight text-xs mb-1">
              {processingStep || "PROCESSING"}
            </h4>
            <p className="text-[10px] font-bold text-gray-600 uppercase max-w-full truncate">
              {processingMessage || "Please wait..."}
            </p>
            {/* Indeterminate animated progress bar */}
            <div className="w-3/4 h-2 mt-3 bg-white border-2 border-black rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-[#ffde59] border-r-2 border-black w-full animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest z-10">
            {date}
          </div>
        )}
      </div>

      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-black uppercase tracking-tight text-lg truncate">
            {title}
          </h3>
          <div className="flex gap-1">
            <div className="h-1 w-8 bg-black rounded-full" />
            <div className="h-1 w-2 bg-black rounded-full opacity-30" />
          </div>
        </div>

        <button 
          disabled={isProcessing}
          className="h-10 w-10 shrink-0 bg-[#cfe9ff] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_black] group-hover:translate-x-1px group-hover:translate-y-1px group-hover:shadow-none transition-all disabled:opacity-50">
          <LucideExternalLink
            size={18}
            strokeWidth={3}
          />
        </button>
      </div>
    </div>
  );
}
