"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Note: adjust the URL if the auth microservice uses a different base path
      const res = await fetch("http://localhost:5000/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setStep("OTP");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to verify OTP");

      // Set cookie in browser
      document.cookie = `admin_token=${data.adminToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
      
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f3] flex items-center justify-center p-6 font-sans text-black">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0px_black]">
        <div className="text-center mb-8">
          <div className="inline-block px-4 py-1 border-2 border-black bg-[#ffde59] rounded-full font-black text-sm uppercase shadow-[3px_3px_0px_black] mb-4">
            Authorized Personnel Only
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Portal</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#ffcccc] border-2 border-black font-bold text-sm">
            ❌ {error}
          </div>
        )}

        {step === "EMAIL" ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-6">
            <div>
              <label className="block text-xl font-bold mb-2 uppercase">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full p-4 border-4 border-black text-xl font-bold bg-[#faf9f3] focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_black] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#bde3ff] border-4 border-black p-4 text-2xl font-black uppercase shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
            <div>
              <label className="block text-xl font-bold mb-2 uppercase">Enter OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full p-4 border-4 border-black text-center text-3xl tracking-widest font-black bg-[#faf9f3] focus:outline-none focus:bg-white focus:shadow-[4px_4px_0px_black] transition-all"
              />
              <p className="text-sm font-bold mt-2 opacity-60">Sent to {email}</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffde59] border-4 border-black p-4 text-2xl font-black uppercase shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Secure Login"}
            </button>
            <button
              type="button"
              onClick={() => setStep("EMAIL")}
              className="text-sm font-bold underline text-center opacity-70 hover:opacity-100 uppercase"
            >
              Back to Email
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
