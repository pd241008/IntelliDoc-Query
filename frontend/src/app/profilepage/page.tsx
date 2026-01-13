"use client";

import { useDocuments } from "@/context/DocumentContext";

export default function CalendarPage() {
  const { documents } = useDocuments();

  return (
    <div className="px-10 py-6 flex gap-10">
      <div className="card w-300px">
        <input
          type="date"
          className="input"
        />
      </div>

      <div className="card bg-[#f3f7cc] flex-1">
        {documents
          .filter((d) => d.expiryDate)
          .map((doc) => (
            <div
              key={doc.id}
              className="row">
              <span>{doc.name}</span>
              <span>{doc.expiryDate}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
