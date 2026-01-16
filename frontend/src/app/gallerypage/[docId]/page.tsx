"use client";

import { useParams, useRouter } from "next/navigation";
import { LucideArrowLeft, LucideZap, LucideSend } from "lucide-react";

export default function DocAIDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.docId;

  return (
    /* Symmetric padding and centered layout */
    <div className="min-h-screen pt-20 pb-16 px-6 max-w-6xl mx-auto">
      {/* Back Navigation Bar */}
      <button
        onClick={() => router.push("/gallerypage")}
        className="
          mb-10 flex items-center gap-3
          px-6 py-3
          border-4 border-black
          rounded-2xl
          bg-white
          font-black uppercase tracking-widest
          shadow-[6px_6px_0px_black]
          transition-all
          hover:-translate-y-0.5 hover:shadow-[8px_8px_0px_black]
          active:translate-y-0 active:shadow-[3px_3px_0px_black]
        ">
        <LucideArrowLeft size={22} />
        Back to Vault
      </button>

      {/* Interaction Hub Card */}
      <div className="w-full bg-white border-4px border-black rounded-[40px] shadow-[12px_12px_0px_black] overflow-hidden flex flex-col lg:flex-row min-h-600px max-h-800px">
        {/* LEFT: Document Preview */}
        <div className="flex-[1.6] bg-[#e1e1e1] border-b-4px lg:border-b-0 lg:border-r-4px border-black p-10 flex flex-col">
          <div className="bg-white border-2 border-black rounded-3xl h-full shadow-inner p-8 flex flex-col items-center justify-center text-center">
            {/* Large Document Placeholder */}
            <div className="w-56 h-72 border-4 border-black rounded-2xl mb-8 bg-[#faf9f3] flex items-center justify-center shadow-[8px_8px_0px_black]">
              <span className="text-7xl">📄</span>
            </div>

            <p className="font-black opacity-20 uppercase tracking-widest text-2xl rotate-6">
              Processing Preview: {docId}
            </p>
          </div>
        </div>

        {/* RIGHT: RAG Interaction Panel */}
        <div className="flex-1 bg-[#faf9f3] flex flex-col">
          {/* Header */}
          <div className="p-8 border-b-4 border-black">
            <div className="flex items-center gap-2 text-[#ff5c00] mb-4">
              <LucideZap
                size={22}
                fill="currentColor"
              />
              <span className="font-black uppercase tracking-widest text-sm">
                IntelliDoc AI
              </span>
            </div>

            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              Analysis Hub
            </h2>
          </div>

          {/* AI Message Stream */}
          <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-white/30">
            <div className="p-5 bg-[#cfe9ff] border-2 border-black rounded-2xl rounded-tl-none shadow-[4px_4px_0px_black]">
              <p className="font-bold text-sm leading-relaxed italic">
                System Ready. I have retrieved the context for Document #{docId}
                . How can I assist with your metadata extraction today?
              </p>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-8 border-t-4 border-black bg-white">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="PROMPT_INTELLIDOC..."
                className="flex-1 border-2 border-black px-6 py-3 rounded-xl font-bold shadow-[4px_4px_0px_black] outline-none focus:shadow-none transition-all"
              />
              <button className="bg-black text-white p-4 rounded-xl hover:bg-[#ffde59] hover:text-black transition-all hover:-translate-y-0.5">
                <LucideSend size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
