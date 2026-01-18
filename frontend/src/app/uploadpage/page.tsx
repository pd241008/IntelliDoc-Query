"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/context/DocumentContext";
import { Document } from "@/types";
import UploadError from "./error";

export default function UploadPage() {
  const router = useRouter();
  const { addDocument } = useDocuments();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const handleUploadLogic = async (selectedFile: File) => {
    if (!name) {
      alert("Please enter a document name first.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", name);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Intellidoc AI failed to process this document.",
        );
      }

      const doc: Document = {
        id: data.id || Date.now().toString(),
        name,
        type: "document",
        uploadDate: new Date().toISOString().split("T")[0],
        expiryDate: data.expiryDate || "AI_EXTRACTED",
        fileUrl: data.fileUrl || URL.createObjectURL(selectedFile),
      };

      addDocument(doc);
      router.push("/gallerypage");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(
        error instanceof Error ? error : new Error("Upload failed"),
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (uploadError) {
    return (
      <UploadError
        error={uploadError}
        reset={() => setUploadError(null)}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f3] flex items-center justify-center p-6 font-sans text-black">
      {/* THE MAIN CARD - Fixed Border to Black */}
      <div className="w-full max-w-6xl bg-[#faf9f3] border-[6px] border-black rounded-[60px] p-12 md:p-20 shadow-[20px_20px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="flex flex-col z-10">
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
              {isUploading ? "Processing..." : "Upload Your File Here"}
            </h1>

            <p className="text-lg font-medium text-gray-700 mb-10 max-w-sm leading-relaxed">
              Upload your document once. SmartDoc will automatically extract
              expiry dates and important metadata using AI.
            </p>

            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) handleUploadLogic(selected);
              }}
            />

            {/* Document Name Input - Added Shadow to match buttons */}
            <input
              type="text"
              placeholder="Document name (e.g. Driving License)"
              value={name}
              disabled={isUploading}
              onChange={(e) => setName(e.target.value)}
              className="mb-8 w-full max-w-md border-[3px] border-black rounded-2xl px-6 py-4 bg-white text-lg shadow-[6px_6px_0px_black] focus:outline-none focus:translate-x-2px focus:translate-y-2px focus:shadow-none transition-all disabled:opacity-50"
            />

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="px-10 py-3 rounded-full bg-[#cfe9ff] border-[3px] border-black font-black text-lg shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {isUploading ? "WORKING..." : "UPLOAD"}
              </button>

              <button
                onClick={() => router.push("/gallerypage")}
                disabled={isUploading}
                className="px-10 py-3 rounded-full bg-[#cfe9ff] border-[3px] border-black font-black text-lg shadow-[6px_6px_0px_black] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50">
                Doc Gallery
              </button>
            </div>
          </div>

          {/* RIGHT ILLUSTRATION */}
          <div className="relative flex justify-center items-center h-full">
            <div className="relative w-full aspect-4/3 bg-white border-[3px] border-black p-4 flex items-center justify-center">
              {/* Decorative Scribbles */}
              <div className="absolute -top-4 right-8 text-4xl opacity-40 font-mono">
                {"//"}
              </div>
              <div className="absolute -bottom-4 left-8 text-4xl opacity-40 font-mono">
                {"//"}
              </div>

              {/* Inner Frame - Fixed Border to Black */}
              <div className="w-full h-full bg-[#e1e1e1] border-[3px] border-black flex items-center justify-center relative">
                {/* Large Document Icon */}
                <div
                  className={`relative w-32 h-44 bg-white border-[3px] border-black shadow-[8px_8px_0px_#ffcc80] flex flex-col p-4 gap-3 transform transition-all duration-500 ${isUploading ? "animate-bounce" : "-rotate-1"}`}>
                  <div className="w-full h-3 bg-[#ffcc80] border-b-2 border-black -mt-4 -mx-4 mb-2" />
                  <div className="h-2 w-full bg-black rounded-full" />
                  <div className="h-2 w-full bg-black rounded-full" />
                  <div className="h-2 w-full bg-black rounded-full" />
                  <div className="h-2 w-3/4 bg-black rounded-full" />
                  <div className="mt-auto flex gap-1">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <div className="w-2 h-2 bg-black rounded-full" />
                  </div>
                </div>

                {/* Red Sparkle */}
                <div className="absolute -bottom-10 -right-8 text-7xl text-[#ff5a5a] drop-shadow-md">
                  ✷
                </div>
              </div>

              {/* Lightbulb Badge */}
              <div className="absolute -left-10 top-1/4 w-16 h-16 rounded-full bg-[#fcd34d] border-[3px] border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_black]">
                💡
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
