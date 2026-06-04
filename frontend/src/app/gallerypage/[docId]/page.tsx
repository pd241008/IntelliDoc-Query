"use client";

import { useParams, useRouter } from "next/navigation";
import { LucideArrowLeft } from "lucide-react";
import DocInteractionHub from "@/components/ui/DocInteractionHub";
import { useDocuments } from "@/context/DocumentContext";

export default function DocAIDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.docId;
  const { documents } = useDocuments();
  const doc = documents.find((d) => d.id === docId);

  if (!doc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-2xl font-black uppercase">Document Not Found</h2>
      </div>
    );
  }

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
      <DocInteractionHub doc={{
        title: doc.name,
        imageUrl: doc.fileUrl || "",
        expiryDate: doc.expiryDate || "ANALYZING...",
        id: doc.id
      }} />
    </div>
  );
}
