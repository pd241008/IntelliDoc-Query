// components/ui/NavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface UserProfile {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  [key: string]: unknown;
}

const navItems = [
  { name: "Home", path: "/landingpage" },
  { name: "Gallery", path: "/gallerypage" },
  { name: "Calendar", path: "/document-status" },
];

export default function NavBar({ user }: { user?: UserProfile }) {
  const pathname = usePathname();

  return (
    <>
      <div className="fixed top-0 w-full h-24 bg-[#faf9f3]/60 backdrop-blur-md z-90 pointer-events-none border-b-2 border-black/5" />

      <header className="fixed top-6 w-full flex justify-center z-100 px-4 pointer-events-auto">
        <div className="flex items-center gap-6 md:gap-8 px-5 py-3 border-[3px] border-black bg-white/90 backdrop-blur-xl rounded-2xl shadow-[8px_8px_0px_black]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 border-2 border-black px-3 py-1 rounded-xl bg-white
              shadow-[4px_4px_0px_black]
              hover:translate-x-px hover:translate-y-px
              hover:shadow-[2px_2px_0px_black]
              transition-all">
            <span className="text-xl">✦</span>
            <span className="font-black tracking-tighter text-lg uppercase">
              IntelliDoc
            </span>
          </Link>

          <div className="w-0.5 h-8 bg-black/10" />

          {/* Navigation */}
          <nav className="flex items-center gap-2 md:gap-4">
            {navItems.map((item) => {
              const active = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={active ? "page" : undefined}
                  className={`px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs md:text-sm uppercase transition-all
                    ${
                      active
                        ? "bg-[#ffde59] shadow-[4px_4px_0px_black] -translate-y-0.5"
                        : "bg-white hover:bg-[#cfe9ff] hover:shadow-[4px_4px_0px_black] hover:-translate-y-0.5 active:translate-y-0"
                    }`}>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* AUTHENTICATION SECTION */}
          <div className="flex items-center gap-4 pl-4 md:pl-6 border-l-2 border-black/10">
            {user ? (
              <>
                <div className="flex items-center gap-3 bg-white border-2 border-black px-2 py-1 rounded-xl shadow-[4px_4px_0px_black]">
                  <Image
                    src={
                      user.picture ||
                      `https://ui-avatars.com/api/?name=${user.name || "User"}`
                    }
                    alt="User Avatar"
                    width={32}
                    height={32}
                    unoptimized
                    className="w-8 h-8 rounded-full border-2 border-black bg-gray-200"
                    referrerPolicy="no-referrer"
                  />
                  <span className="hidden md:block text-xs font-bold uppercase truncate max-w-25">
                    {user.name ||
                      (typeof user.email === "string"
                        ? user.email.split("@")[0]
                        : "USER")}
                  </span>
                </div>

                <Link
                  href="/auth/logout"
                  className="px-4 py-1.5 border-2 border-black rounded-xl font-black text-xs md:text-sm uppercase transition-all bg-[#ff8f8f] hover:bg-[#ff6b6b] hover:shadow-[4px_4px_0px_black] hover:-translate-y-0.5 active:translate-y-0">
                  Log Out
                </Link>
              </>
            ) : (
              // ✅ UPDATED: Added returnTo logic here
              <Link
                href="/auth/login?returnTo=/landingpage"
                className="px-6 py-1.5 border-2 border-black rounded-xl font-black text-xs md:text-sm uppercase transition-all bg-[#bde3ff] hover:bg-[#99d1ff] hover:shadow-[4px_4px_0px_black] hover:-translate-y-0.5 active:translate-y-0">
                Log In
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
