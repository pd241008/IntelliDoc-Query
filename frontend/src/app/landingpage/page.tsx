"use client";

import Link from "next/link";

export default function HomePage() {
  const items = [
    {
      title: "Upload Documents",
      icon: "📤",
      desc: "Upload and manage your important documents securely",
      path: "/uploadpage",
      color: "bg-white",
    },
    {
      title: "Document Gallery",
      icon: "📁",
      desc: "Browse, search, and organize uploaded documents",
      path: "/gallerypage",
      color: "bg-[#cfe9ff]", // IntelliDoc Blue accent
    },
    {
      title: "Important Dates",
      icon: "📅",
      desc: "Track expiry dates and upcoming reminders",
      path: "/document-status",
      color: "bg-[#cfe9ff]",
    },
    {
      title: "User Dashboard",
      icon: "👤",
      desc: "View user info and overall document insights",
      path: "/userpage",
      color: "bg-white",
    },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      {/* Header Section */}
      <div className="text-center mb-16 max-w-2xl relative">
        {/* Decorative Badge */}
        <div className="inline-block mb-4 px-4 py-1 border-2 border-black bg-[#ffde59] rounded-full font-black text-xs uppercase shadow-[3px_3px_0px_black]">
          Centralized Management
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic">
          IntelliDoc
        </h1>

        <p className="text-black font-bold text-lg opacity-80 leading-relaxed">
          Manage documents, track important dates, and stay organized — all from
          one powerful hub.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl px-4">
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`
              group relative
              border-= 4px border-black rounded-32px p-10 ${item.color}
              shadow-[10px_10px_0px_black]
              hover:translate-x-4px hover:translate-y-4px hover:shadow-none
              transition-all duration-200
            `}>
            <div className="flex items-start gap-6">
              {/* Icon Circle */}
              <div className="w-16 h-16 shrink-0 border-4 border-black rounded-2xl bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_black] group-hover:rotate-6 transition-transform">
                {item.icon}
              </div>

              <div className="flex flex-col">
                <h2 className="text-2xl font-black uppercase tracking-tight mb-3">
                  {item.title}
                </h2>
                <p className="text-black font-medium text-sm leading-relaxed opacity-70">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Corner Decorative Element */}
            <div className="absolute top-4 right-6 text-2xl font-black opacity-10 group-hover:opacity-100 transition-opacity">
              →
            </div>
          </Link>
        ))}
      </div>

      {/* Footer Branding */}
      <div className="mt-20 flex items-center gap-4">
        <div className="h-2px w-12 bg-black" />
        <span className="font-black text-sm uppercase tracking-widest opacity-30">
          IntelliDoc Systems
        </span>
        <div className="h-2px w-12 bg-black" />
      </div>
    </main>
  );
}
