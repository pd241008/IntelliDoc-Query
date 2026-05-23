"use client";

import { useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay, parseISO, isValid, compareAsc } from "date-fns";
import { useDocuments } from "@/context/DocumentContext";
import { LucideCalendar, LucideChevronRight, LucideClock } from "lucide-react";
import { useRouter } from "next/navigation";
import "react-day-picker/dist/style.css";

/* ----------------------------------
   Types
----------------------------------- */

type DocumentFromContext = {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  fileUrl: string;
  expiryDate?: string;
};

type DocumentWithExpiry = DocumentFromContext & {
  parsedExpiry: Date;
};

export default function DocumentStatusPage() {
  const { documents } = useDocuments();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const router = useRouter();

  /* ----------------------------------
     Normalize & sort expiry documents
  ----------------------------------- */
  const expiringDocs = useMemo<DocumentWithExpiry[]>(() => {
    return documents
      .filter(
        (doc): doc is DocumentFromContext =>
          typeof doc.expiryDate === "string" &&
          doc.expiryDate !== "AI_EXTRACTED"
      )
      .map((doc) => {
        const parsed = parseISO(doc.expiryDate!);

        if (!isValid(parsed)) {
          return null;
        }

        return {
          ...doc,
          parsedExpiry: parsed,
        };
      })
      .filter((doc): doc is DocumentWithExpiry => doc !== null)
      .sort((a, b) => compareAsc(a.parsedExpiry, b.parsedExpiry));
  }, [documents]);

  /* ----------------------------------
     Filter by selected date
  ----------------------------------- */
  const filteredDocs = useMemo<DocumentWithExpiry[]>(() => {
    if (!selected) return expiringDocs;

    return expiringDocs.filter((doc) => isSameDay(doc.parsedExpiry, selected));
  }, [expiringDocs, selected]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col gap-10">
      {/* HEADER */}
      <div className="flex items-center gap-4 border-b-4 border-black pb-6">
        <div className="p-3 bg-[#ffde59] border-2 border-black rounded-xl shadow-[4px_4px_0px_black]">
          <LucideCalendar
            size={32}
            strokeWidth={3}
          />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            Important Dates
          </h1>
          <p className="text-black/60 font-bold uppercase text-xs tracking-widest">
            Tracking // {expiringDocs.length} Deadlines
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* CALENDAR */}
        <div className="shrink-0">
          <div className="bg-white border-[3px] border-black rounded-4xl p-6 shadow-[10px_10px_0px_black]">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={setSelected}
              className="neo-calendar"
            />
          </div>
        </div>

        {/* EXPIRY LIST */}
        <div className="flex-1 bg-[#f3f7cc] border-[3px] border-black rounded-[40px] p-8 shadow-[12px_12px_0px_black]">
          <div className="flex items-center justify-between mb-6 border-b-2 border-black/20 pb-4">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <LucideClock size={22} />
              Upcoming Expiries
            </h2>

            <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
              {format(selected ?? new Date(), "MMM dd, yyyy")}
            </span>
          </div>

          <div className="space-y-4">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => router.push(`/gallerypage/${doc.id}`)}
                  className="
                    group flex items-center justify-between
                    bg-white border-[3px] border-black
                    p-5 rounded-2xl
                    shadow-[6px_6px_0px_black]
                    hover:translate-x-px hover:translate-y-px hover:shadow-none
                    transition-all cursor-pointer
                  ">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-lg uppercase tracking-tight">
                      {doc.name}
                    </span>
                    <span className="text-sm font-bold opacity-60">
                      Expires on {format(doc.parsedExpiry, "dd MMM yyyy")}
                    </span>
                  </div>

                  <div className="p-2 bg-[#cfe9ff] border-2 border-black rounded-lg shadow-[3px_3px_0px_black] group-hover:bg-[#ffde59] transition-colors">
                    <LucideChevronRight
                      size={20}
                      strokeWidth={3}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-56 border-2 border-black border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 text-black/40">
                <span className="font-black uppercase tracking-wide">
                  No Expiries
                </span>
                <span className="text-xs font-bold">Select another date</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
