"use client";

import { useRouter } from "next/navigation";
import { useDocuments } from "@/context/DocumentContext";
import Image from "next/image";

export default function GalleryPage() {
  const { documents } = useDocuments();
  const router = useRouter();

  return (
    <div className="px-10 py-6">
      <h2 className="text-2xl font-bold mb-6">Your Documents</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => router.push(`/document/${doc.id}`)}
            className="border-2 border-black rounded-xl p-4 bg-white shadow-[4px_4px_0px_black] cursor-pointer">
            <Image
              src={doc.fileUrl}
              className="mb-3 rounded-md"
              alt=""
            />
            <button className="btn-secondary">Click Me</button>
          </div>
        ))}
      </div>
    </div>
  );
}
