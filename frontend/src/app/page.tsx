"use client";

import { useRouter } from "next/navigation";

export default function DefaultLandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Hero Section */}
      <section className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
          📄 SmartDoc Manager
        </h1>

        <p className="text-lg md:text-xl text-gray-700 mb-10">
          A smart document management and reminder system to upload, track,
          manage, and never miss important document deadlines again.
        </p>

        <button
          onClick={() => router.push("/landingpage")}
          className="border-2 border-black px-8 py-4 text-lg font-semibold rounded-xl
          bg-white shadow-[6px_6px_0px_black]
          hover:translate-x-1 hover:translate-y-1 transition">
          Get Started →
        </button>
      </section>

      {/* Features Section */}
      <section className="mt-20 w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-center mb-10">Why SmartDoc?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "📤 Easy Uploads",
              desc: "Upload and store important documents securely with metadata support.",
            },
            {
              title: "⏰ Smart Reminders",
              desc: "Never miss expiry dates with automated alerts and notifications.",
            },
            {
              title: "📁 Organized Access",
              desc: "View, search, and manage documents from a clean dashboard.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="border-2 border-black rounded-xl p-6 bg-white
              shadow-[4px_4px_0px_black]">
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 text-sm text-gray-600">
        Built with ❤️ using Next.js, Tailwind & Smart Architecture
      </footer>
    </main>
  );
}
