// app/page.tsx
import { auth0 } from "@/lib/auth0";
import Link from "next/link";

export default async function DefaultLandingPage() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <main className="min-h-screen bg-[#faf9f3] relative overflow-hidden font-sans text-black">
      <div className="absolute inset-0 border-x-12px border-black pointer-events-none z-0" />
      <div className="absolute top-20 w-full border-t-2 border-black z-0" />
      <div className="absolute bottom-20 w-full border-t-2 border-black z-0" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-24">
        <section className="text-center max-w-4xl flex flex-col items-center">
          <div className="mb-6 px-4 py-1 border-2 border-black bg-[#ffde59] rounded-full font-black text-sm uppercase shadow-[3px_3px_0px_black]">
            AI Powered Management
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
            IntelliDoc
          </h1>

          <p className="text-xl md:text-2xl font-bold text-gray-800 mb-12 max-w-2xl leading-relaxed">
            The smart document reminder system to upload, track, and
            <span className="bg-[#cfe9ff] px-2 ml-1 border-b-4 border-black inline-block transform -rotate-1">
              never miss deadlines
            </span>{" "}
            again.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 mt-4">
            {user ? (
              <>
                {/* ✅ UPDATED: Points to /landingpage instead of /dashboard */}
                <Link
                  href="/landingpage"
                  className="group relative inline-flex items-center gap-3 border-4 border-black px-10 py-5 text-2xl font-black rounded-2xl bg-[#bde3ff] shadow-[10px_10px_0px_black] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95">
                  ENTER VAULT
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </Link>
                <Link
                  href="/auth/logout"
                  className="group relative inline-flex items-center gap-3 border-4 border-black px-8 py-5 text-xl font-black rounded-2xl bg-white shadow-[10px_10px_0px_black] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95">
                  LOGOUT
                </Link>
              </>
            ) : (
              // ✅ UPDATED: Added returnTo logic here
              <Link
                href="/auth/login?returnTo=/landingpage"
                className="group relative inline-flex items-center gap-3 border-4 border-black px-10 py-5 text-2xl font-black rounded-2xl bg-white shadow-[10px_10px_0px_black] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none active:scale-95">
                SECURE LOGIN
                <span className="group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </Link>
            )}
          </div>
        </section>

        {/* ... (Features Section and Footer remain exactly the same) ... */}

        <section className="mt-32 w-full max-w-6xl">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tight">
              Why IntelliDoc?
            </h2>
            <div className="flex-1 h-1 bg-black" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                title: "📤 Easy Uploads",
                color: "bg-white",
                desc: "Upload and store important documents securely with instant metadata support.",
              },
              {
                title: "⏰ Smart Alerts",
                color: "bg-[#cfe9ff]",
                desc: "Automated AI notifications so you never miss an expiry date or renewal.",
              },
              {
                title: "📁 Pro Dashboard",
                color: "bg-white",
                desc: "A clean, brutalist interface to view, search, and manage your vault.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className={`border-4 border-black rounded-[30px] p-8 ${feature.color} shadow-[8px_8px_0px_black] transform transition hover:-rotate-1`}>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">
                  {feature.title}
                </h3>
                <p className="text-lg font-bold leading-snug opacity-80">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-32 flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white text-xl font-bold">
            iD
          </div>
          <p className="text-sm font-black uppercase tracking-widest opacity-40">
            Built with ❤️ using Smart Architecture
          </p>
        </footer>
      </div>
    </main>
  );
}
