"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDocuments } from "@/context/DocumentContext";
import { Document } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const { addDocument } = useDocuments();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("license");

  const submit = () => {
    if (!fileRef.current?.files?.[0]) return;

    const file = fileRef.current.files[0];

    const doc: Document = {
      id: Date.now().toString(),
      name,
      type,
      uploadDate: new Date().toISOString().split("T")[0],
      expiryDate: "AI_EXTRACTED", // 🔥 placeholder
      fileUrl: URL.createObjectURL(file),
    };

    addDocument(doc);
    router.push("/gallerypage");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md border-2 border-black rounded-xl p-8 bg-white shadow-[6px_6px_0px_black]">
        <h2 className="text-2xl font-bold mb-1">Upload Document</h2>
        <p className="text-sm text-gray-600 mb-6">
          AI will automatically detect expiry & details.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Document Name</label>
            <input
              className="mt-1 w-full border-2 border-black rounded-lg px-3 py-2"
              placeholder="e.g. Driving License"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Document Type</label>
            <select
              className="mt-1 w-full border-2 border-black rounded-lg px-3 py-2"
              onChange={(e) => setType(e.target.value)}>
              <option value="license">License</option>
              <option value="insurance">Insurance</option>
              <option value="id">ID</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Upload File</label>
            <input
              type="file"
              ref={fileRef}
              className="mt-1 w-full text-sm"
            />
          </div>

          <button
            onClick={submit}
            className="w-full mt-4 border-2 border-black rounded-lg py-2 font-semibold bg-black text-white hover:translate-x-1 hover:translate-y-1 transition">
            Upload & Analyze
          </button>
        </div>
      </div>
    </main>
  );
}
