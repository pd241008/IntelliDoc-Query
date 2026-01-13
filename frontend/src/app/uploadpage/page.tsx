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
  const [expiryDate, setExpiryDate] = useState("");

  const submit = () => {
    if (!fileRef.current?.files?.[0]) return;

    const file = fileRef.current.files[0];

    const doc: Document = {
      id: Date.now().toString(),
      name,
      type,
      uploadDate: new Date().toISOString().split("T")[0],
      expiryDate,
      fileUrl: URL.createObjectURL(file),
    };

    addDocument(doc);
    router.push("/gallery");
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="border-2 border-black rounded-xl p-8 bg-white shadow-[4px_4px_0px_black] w-420px">
        <h2 className="font-bold text-xl mb-4">Upload Document</h2>

        <input
          className="input"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="input"
          onChange={(e) => setType(e.target.value)}>
          <option>license</option>
          <option>insurance</option>
          <option>id</option>
        </select>
        <input
          type="date"
          className="input"
          onChange={(e) => setExpiryDate(e.target.value)}
        />
        <input
          type="file"
          ref={fileRef}
          className="mb-4"
        />

        <button
          onClick={submit}
          className="btn-primary">
          Upload
        </button>
      </div>
    </div>
  );
}
