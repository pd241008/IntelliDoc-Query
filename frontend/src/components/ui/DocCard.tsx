// components/ui/DocCard.tsx
"use client";

import Image from "next/image";
import { LucideExternalLink } from "lucide-react";

interface DocCardProps {
  title: string;
  imageUrl: string;
  date: string;
  onClick: () => void;
}

export default function DocCard({
  title,
  imageUrl,
  date,
  onClick,
}: DocCardProps) {
  return (
    <div
      className="group relative border-[3px] border-black bg-white rounded-xl overflow-hidden shadow-[8px_8px_0px_black] transition-all hover:translate-x- 2px hover:translate-y-2px hover:shadow-none cursor-pointer"
      onClick={onClick}>
      {/* Parent container must be 'relative' for Next.js 'fill' to work.
          'aspect-video' maintains symmetry across the grid.
      */}
      <div className="relative aspect-video w-full bg-gray-100 border-b-[3px] border-black overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase tracking-widest z-10">
          {date}
        </div>
      </div>

      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-black uppercase tracking-tight text-lg truncate">
            {title}
          </h3>
          <div className="flex gap-1">
            <div className="h-1 w-8 bg-black rounded-full" />
            <div className="h-1 w-2 bg-black rounded-full opacity-30" />
          </div>
        </div>

        <button className="h-10 w-10 shrink-0 bg-[#cfe9ff] border-2 border-black rounded-lg flex items-center justify-center shadow-[3px_3px_0px_black] group-hover:translate-x-1px group-hover:translate-y-1px group-hover:shadow-none transition-all">
          <LucideExternalLink
            size={18}
            strokeWidth={3}
          />
        </button>
      </div>
    </div>
  );
}
