"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useDocuments } from "@/context/DocumentContext";
import Image from "next/image";

export default function DocumentDetailPage() {
  const { id } = useParams();
  const { documents, updateDocument } = useDocuments();

  const doc = documents.find((d) => d.id === id);
  const [expiryDate, setExpiryDate] = useState(doc?.expiryDate || "");

  if (!doc) return <p>Not found</p>;

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="card flex gap-6 w-600px">
        <Image
          src={doc.fileUrl}
          className="w-1/2 rounded-md"
          alt=""
        />

        <div>
          <h2 className="font-bold text-xl">{doc.name}</h2>
          <input
            type="date"
            className="input"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
          <button
            onClick={() => updateDocument(doc.id, { expiryDate })}
            className="btn-primary">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
