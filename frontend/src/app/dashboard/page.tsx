"use client";

import { useDocuments } from "@/context/DocumentContext";

export default function DashboardPage() {
  const { documents } = useDocuments();
  const percent = Math.round(
    (documents.filter((d) => d.expiryDate).length / documents.length) * 100 || 0
  );

  return (
    <div className="px-10 py-6 flex gap-10">
      <div className="card bg-[#f3f7cc] w-[320px] text-center">
        <div className="circle">{percent}%</div>
        <p>With Expiry</p>
      </div>

      <div className="card w-[320px]">
        <input
          className="input"
          value="Prathmesh"
          readOnly
        />
        <input
          className="input"
          value="prathmesh@email.com"
          readOnly
        />
        <button className="btn-primary">Save</button>
      </div>
    </div>
  );
}
