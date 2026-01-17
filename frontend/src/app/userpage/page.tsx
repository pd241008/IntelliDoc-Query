"use client";

import { useDocuments } from "@/context/DocumentContext";
import {
  LucideUser,
  LucidePieChart,
  LucideLogOut,
  LucideMail,
} from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register ChartJS elements
ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardPage() {
  const { documents } = useDocuments();

  const withExpiry = documents.filter(
    (d) => d.expiryDate && d.expiryDate !== "AI_EXTRACTED",
  ).length;

  const withoutExpiry = documents.length - withExpiry;
  const percent =
    documents.length > 0
      ? Math.round((withExpiry / documents.length) * 100)
      : 0;

  // Chart Data Configuration
  const data = {
    datasets: [
      {
        data: [withExpiry, withoutExpiry],
        backgroundColor: ["#000000", "#ffffff"], // Black for filled, White for empty
        borderColor: "#000000",
        borderWidth: 4,
        hoverOffset: 0,
      },
    ],
  };

  // Chart Options for Neo-brutalist look
  const options: ChartOptions<"doughnut"> = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col gap-10">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-b-4 border-black pb-6">
        <div className="p-3 bg-[#cfe9ff] border-2 border-black rounded-xl shadow-[4px_4px_0px_black]">
          <LucideUser
            size={32}
            strokeWidth={3}
          />
        </div>
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">
            User Dashboard
          </h1>
          <p className="text-black/60 font-bold uppercase text-xs tracking-widest">
            System // Account Overview
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* LEFT: STORAGE ANALYSIS (ChartJS Card) */}
        <div className="flex-[1.5] w-full bg-[#f3f7cc] `border-[4px]` border-black rounded-[40px] p-10 shadow-[12px_12px_0px_black] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <LucidePieChart size={24} /> Storage Analysis
            </h2>
            <span className="text-xs font-black uppercase opacity-40">
              Live Data
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-10">
            {/* ChartJS Container */}
            <div className="relative w-72 h-72 group">
              {/* Thick Shadow Ring Backdrop */}
              <div className="absolute inset-0 border-[6px] border-black rounded-full shadow-[10px_10px_0px_black] bg-white"></div>

              <div className="relative w-full h-full p-4">
                <Doughnut
                  data={data}
                  options={options}
                />
              </div>

              {/* Centered Percentage Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                <span className="text-7xl font-black tracking-tighter">
                  {percent}%
                </span>
                <p className="text-xs font-black uppercase opacity-60">
                  Secure Storage
                </p>
              </div>
            </div>

            <p className="mt-12 text-center max-w-sm font-bold leading-relaxed text-black/80">
              Your document vault is currently processing{" "}
              <span className="underline decoration-[3px] decoration-black">
                {documents.length} active files
              </span>{" "}
              with IntelliDoc RAG-extraction enabled.
            </p>
          </div>
        </div>

        {/* RIGHT: USER PROFILE */}
        <div className="flex-1 w-full bg-white `border-[4px]` border-black rounded-[40px] p-10 shadow-[12px_12px_0px_black]">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8">
            User Profile
          </h2>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase opacity-40 ml-2">
                Full Name
              </label>
              <div className="flex items-center gap-3 border-[3px] border-black p-4 rounded-2xl bg-[#faf9f3] font-bold shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                <LucideUser
                  size={18}
                  className="opacity-40"
                />
                <span>Prathmesh</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase opacity-40 ml-2">
                Email Address
              </label>
              <div className="flex items-center gap-3 border-[3px] border-black p-4 rounded-2xl bg-[#faf9f3] font-bold shadow-[inset_2px_2px_0px_rgba(0,0,0,0.1)]">
                <LucideMail
                  size={18}
                  className="opacity-40"
                />
                <span className="truncate">prathmesh@email.com</span>
              </div>
            </div>

            <div className="pt-6">
              <button className="w-full flex items-center justify-center gap-3 bg-[#ff5a5a] text-white border-[3px] border-black p-5 rounded-2xl font-black uppercase tracking-widest shadow-[6px_6px_0px_black] hover:translate-x-px hover:translate-y-px hover:shadow-none transition-all active:scale-95">
                <LucideLogOut
                  size={22}
                  strokeWidth={3}
                />
                Logout Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
