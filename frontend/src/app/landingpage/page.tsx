"use client";

import Link from "next/link";

export default function HomePage() {
  const items = [
    { label: "📤 Upload Page", path: "/uploadpage" },
    { label: "📁 Document Gallery", path: "/gallerypage" },
    { label: "📅 Important Dates", path: "/profilepage" },
    { label: "👤 User Info", path: "/dashboard" },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[70%]">
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="cursor-pointer border-2 border-black rounded-xl p-10 text-center text-xl font-semibold bg-white shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 transition">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
