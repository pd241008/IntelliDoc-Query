"use client";

import Link from "next/link";

export default function HomePage() {
  const items = [
    {
      title: "Upload Documents",
      icon: "📤",
      desc: "Upload and manage your important documents securely",
      path: "/uploadpage",
    },
    {
      title: "Document Gallery",
      icon: "📁",
      desc: "Browse, search, and organize uploaded documents",
      path: "/gallerypage",
    },
    {
      title: "Important Dates",
      icon: "📅",
      desc: "Track expiry dates and upcoming reminders",
      path: "/profilepage",
    },
    {
      title: "User Dashboard",
      icon: "👤",
      desc: "View user info and overall document insights",
      path: "/dashboard",
    },
  ];

  return (
    <main className="min-h-screen px-6 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="text-center mb-14 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          SmartDoc Control Center
        </h1>
        <p className="text-gray-700 text-lg">
          Manage documents, track important dates, and stay organized — all from
          one place.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {items.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="
              group
              border-2 border-black rounded-xl p-8 bg-white
              shadow-[5px_5px_0px_black]
              hover:translate-x-1 hover:translate-y-1
              transition
            ">
            <div className="flex items-start gap-4">
              <div className="text-3xl">{item.icon}</div>

              <div>
                <h2 className="text-xl font-semibold mb-2 group-hover:underline">
                  {item.title}
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
