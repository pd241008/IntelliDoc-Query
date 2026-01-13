"use client";

import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  const cards = [
    { label: "📤 Upload Page", path: "/upload" },
    { label: "📁 Document Gallery", path: "/gallerypage" },
    { label: "📅 Important Dates", path: "/calendar" },
    { label: "👤 User Info", path: "/profilepage" },
  ];

  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    router.push(path);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#faf9f3]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-[70%]">
        {cards.map((card) => (
          <div
            key={card.path}
            onClick={() => handleNavigate(card.path)}
            className="cursor-pointer border-2 border-black rounded-xl p-10 text-center text-xl font-semibold bg-white shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 transition">
            {card.label}
          </div>
        ))}
      </div>
    </div>
  );
}
