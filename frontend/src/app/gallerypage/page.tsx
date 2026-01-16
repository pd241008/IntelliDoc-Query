"use client";

import { useRouter } from "next/navigation";
import DocCard from "@/components/ui/DocCard";

export default function GalleryPage() {
  const router = useRouter();

  // Updated mock data with reliable Unsplash IDs
  const documents = [
    {
      id: "1",
      title: "Driving License",
      date: "2024-05-20",
      img: "https://images.unsplash.com/photo-1580124030116-b51b16ee7f0b?q=80&w=800",
    },
    {
      id: "2",
      title: "Passport Main",
      date: "2025-11-10",
      img: "https://images.unsplash.com/photo-1569974498991-d3c12a504f95?q=80&w=800",
    },
    {
      id: "3",
      title: "Rental Agreement",
      date: "2023-12-01",
      img: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=800",
    },
    {
      id: "4",
      title: "Insurance Policy",
      date: "2024-01-15",
      img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800",
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {documents.map((doc) => (
          <DocCard
            key={doc.id}
            title={doc.title}
            date={doc.date}
            imageUrl={doc.img}
            onClick={() => router.push(`/gallerypage/${doc.id}`)}
          />
        ))}
      </div>
    </div>
  );
}
