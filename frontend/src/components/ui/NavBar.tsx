"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", path: "/landingpage" },
  { name: "Gallery", path: "/gallerypage" },
  { name: "Profile", path: "/profilepage" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Blurred bridge (NON interactive) */}
      <div className="fixed top-0 w-full h-24 bg-[#faf9f3]/60 backdrop-blur-md z-90 pointer-events-none border-b-2 border-black/5" />

      {/* Nav island (INTERACTIVE) */}
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
        </div>
      </header>
    </>
  );
}
