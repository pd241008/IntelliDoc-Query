"use client";

import { useRouter } from "next/navigation";
import DocCard from "@/components/ui/DocCard";
import { useDocuments } from "@/context/DocumentContext";
import { LucideFileArchive } from "lucide-react";

export default function GalleryPage() {
  const router = useRouter();
  const { documents, isLoading } = useDocuments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2 className="text-2xl font-black uppercase animate-pulse">Loading Vault...</h2>
      </div>
    );
  }

  return (
    /* pt-16 ensures content starts comfortably below the navbar island */
    <div className="flex flex-col gap-10 pt-16 px-4 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-end justify-between border-b-[3px] border-black pb-6 relative">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Document Vault
          </h1>
          <p className="text-black/60 font-bold uppercase text-xs tracking-widest">
            Storage // {documents.length.toString().padStart(2, "0")} Files
            Found
          </p>
        </div>

        <input
          type="text"
          placeholder="SEARCH_VAULT..."
          className="hidden md:block border-2 border-black bg-white px-4 py-2 rounded-lg shadow-[4px_4px_0px_black] font-black focus:outline-none focus:translate-x-2px focus:translate-y-2px focus:shadow-none transition-all"
        />
      </div>

      {/* Main Grid Layout - constrained to 2 columns for a cleaner look */}
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white border-4 border-black rounded-[40px] shadow-[12px_12px_0px_black] text-center">
          <LucideFileArchive size={64} className="mb-6 opacity-20" />
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Vault is Empty</h2>
          <p className="text-gray-500 font-medium max-w-sm mb-8">
            You haven't uploaded any documents yet. Head over to the upload page to securely add your first document.
          </p>
          <button
            onClick={() => router.push("/uploadpage")}
            className="px-8 py-4 rounded-full bg-[#cfe9ff] border-4 border-black font-black text-lg shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
            UPLOAD DOCUMENT
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {documents.map((doc) => (
            <DocCard
              key={doc.id}
              id={doc.id}
              title={doc.name}
              date={doc.uploadDate || ""}
              imageUrl={doc.fileUrl || ""}
              onClick={() => router.push(`/gallerypage/${doc.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
