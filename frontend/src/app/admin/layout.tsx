import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
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
          <Link
            href="/admin"
            className="border-2 border-black p-3 font-bold bg-[#bde3ff] shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="border-2 border-black p-3 font-bold bg-white shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/settings"
            className="border-2 border-black p-3 font-bold bg-white shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm"
          >
            System Settings
          </Link>
        </nav>

        <div className="mt-8 pt-6 border-t-4 border-black">
          <button
            onClick={() => {
              document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
        {/* Background Grid Pattern (optional subtle effect) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
