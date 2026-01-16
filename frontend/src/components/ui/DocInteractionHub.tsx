// components/ui/DocInteractionHub.tsx
"use client";

import { LucideX, LucideZap, LucideSend } from "lucide-react";
import Image from "next/image";

interface DocInteractionHubProps {
  doc: { title: string; imageUrl: string; expiryDate: string; id: string };
  onClose: () => void;
}

export default function DocInteractionHub({
  doc,
  onClose,
}: DocInteractionHubProps) {
  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-8 bg-[#faf9f3]/80 backdrop-blur-xl">
      {/* Main Container */}
      <div className="relative w-full h-full max-w-7xl bg-white border-4px border-black rounded-[40px] shadow-[16px_16px_0px_black] overflow-hidden flex flex-col lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-210 p-2 bg-[#ff5a5a] border-2 border-black rounded-full shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <LucideX
            size={24}
            strokeWidth={3}
          />
        </button>

        {/* LEFT: Document Preview Area */}
        <div className="flex-1 bg-[#e1e1e1] border-b-4 lg:border-b-0 lg:border-r-4 border-black p-8 flex flex-col gap-6 overflow-hidden">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">
              {doc.title}
            </h2>
            <div className="px-3 py-1 bg-black text-white text-xs font-black rounded-md">
              ID: {doc.id}
            </div>
          </div>

          <div className="flex-1 border-[3px] border-black bg-white rounded-2xl overflow-auto shadow-[8px_8px_0px_rgba(0,0,0,0.1)] p-4">
            <Image
              src={doc.imageUrl}
              alt="Document"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>

        {/* RIGHT: AI Context Panel (RAG Interface) */}
        <div className="w-full lg:w-400px flex flex-col bg-[#faf9f3]">
          {/* Metadata/Insights Header */}
          <div className="p-6 border-b-4 border-black flex flex-col gap-4">
            <div className="flex items-center gap-2 text-[#ff5c00]">
              <LucideZap
                size={20}
                fill="currentColor"
              />
              <span className="font-black uppercase text-sm tracking-widest">
                AI Insights
              </span>
            </div>

            <div className="p-4 bg-[#ffde59] border-2 border-black rounded-xl shadow-[4px_4px_0px_black]">
              <p className="text-xs font-black uppercase mb-1 opacity-60">
                Calculated Expiry
              </p>
              <p className="text-xl font-black">
                {doc.expiryDate || "ANALYZING..."}
              </p>
            </div>
          </div>

          {/* AI Chat History (The RAG Interaction) */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            <div className="p-4 bg-[#cfe9ff] border-2 border-black rounded-2xl rounded-tl-none self-start max-w-[90%] shadow-[4px_4px_0px_black]">
              <p className="text-sm font-bold leading-relaxed">
                I&apos;ve processed this document. Would you like me to
                summarize the clauses or check for specific compliance dates?
              </p>
            </div>
            {/* User Message Placeholder */}
            <div className="p-4 bg-white border-2 border-black rounded-2xl rounded-tr-none self-end max-w-[85%] shadow-[4px_4px_0px_black]">
              <p className="text-sm font-bold">
                When exactly does the insurance period end?
              </p>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t-4 border-black bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask IntelliDoc..."
                className="flex-1 border-2 border-black px-4 py-2 rounded-xl font-bold focus:outline-none"
              />
              <button className="p-3 bg-black text-white rounded-xl hover:bg-[#ffde59] hover:text-black transition-colors shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                <LucideSend size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
