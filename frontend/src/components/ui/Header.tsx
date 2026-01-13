"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", path: "/landingpage" },
  { name: "Gallery", path: "/gallerypage" },
  { name: "Profile", path: "/profilepage" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="w-full border-b-2 border-black bg-[#faf9f3]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/landingpage"
          className="border-2 border-black px-4 py-1 rounded-md bg-white shadow-[3px_3px_0px_black] font-bold text-lg">
          ✦ IntelliDoc
        </Link>

        {/* Navigation */}
        <nav className="flex gap-3">
          {navItems.map((item) => {
            const active = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-1 border-2 border-black rounded-md font-medium transition
                  ${
                    active
                      ? "bg-yellow-300 shadow-[3px_3px_0px_black]"
                      : "bg-white hover:bg-blue-200 shadow-[2px_2px_0px_black]"
                  }`}>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
