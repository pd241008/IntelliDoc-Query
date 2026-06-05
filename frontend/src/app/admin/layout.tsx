"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/users", label: "Manage Users", exact: false },
  { href: "/admin/settings", label: "System Settings", exact: false },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#faf9f3] flex flex-col md:flex-row font-sans text-black">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r-4 border-black bg-white flex flex-col p-6 z-10 shadow-[4px_0px_0px_black] md:shadow-[8px_0px_0px_black]">
        <div className="mb-10 text-center md:text-left">
          <div className="inline-block px-3 py-1 border-2 border-black bg-[#ffde59] rounded-full font-black text-xs uppercase mb-2">
            System Admin
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            IntelliDoc
          </h2>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-2 border-black p-3 font-bold shadow-[4px_4px_0px_black] uppercase text-sm transition-all
                  ${
                    active
                      ? "bg-[#ffde59] translate-x-1 translate-y-1 shadow-none"
                      : "bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                  }`}
              >
                {active && <span className="mr-2">→</span>}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t-4 border-black">
          <button
            onClick={() => {
              document.cookie =
                "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              window.location.href = "/";
            }}
            className="w-full border-2 border-black p-3 font-bold bg-[#ffcccc] shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm text-center"
          >
            Exit Portal
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto relative">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(black 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
