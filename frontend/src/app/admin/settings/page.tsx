"use client";

import { useEffect, useState } from "react";

interface SystemInfo {
  platform: {
    python_version: string;
    os: string;
    arch: string;
  };
  database: {
    status: string;
    mongo_version: string;
    db_name: string;
  };
  data: {
    total_documents: number;
    total_users: number;
    vector_indexed: number;
    pending_processing: number;
  };
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between border-b-2 border-dashed border-black/20 py-3 last:border-0">
      <span className="text-sm font-black uppercase tracking-widest opacity-60">{label}</span>
      <span
        className={`font-mono font-bold text-sm px-3 py-1 border-2 border-black shadow-[2px_2px_0px_black] ${
          accent ?? "bg-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function SectionCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`border-4 border-black ${color} shadow-[6px_6px_0px_black]`}>
      <div className="bg-black text-white px-6 py-3">
        <h3 className="font-black text-sm uppercase tracking-widest">{title}</h3>
      </div>
      <div className="px-6 py-2">{children}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data: SystemInfo = await res.json();
        setInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const dbOnline = info?.database.status === "connected";

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <header className="flex justify-between items-end border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
            System Settings
          </h1>
          <p className="text-xl font-bold opacity-70">
            Read-only system health &amp; configuration overview.
          </p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-black text-white font-bold text-sm">
          {isLoading ? (
            <span className="animate-pulse">LOADING...</span>
          ) : error ? (
            <span className="text-[#ff5c00]">BACKEND ERROR</span>
          ) : (
            <span className={dbOnline ? "text-[#00ff00]" : "text-[#ff5c00]"}>
              DB {dbOnline ? "ONLINE" : "OFFLINE"}
            </span>
          )}
        </div>
      </header>

      {error && (
        <div className="border-4 border-black bg-[#fff0f0] p-4 shadow-[6px_6px_0px_#ff5a5a]">
          <p className="font-black text-sm uppercase">⚠ {error}</p>
        </div>
      )}

      {/* Info Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border-4 border-black bg-gray-100 h-48 animate-pulse shadow-[6px_6px_0px_black]"
            />
          ))}
        </div>
      ) : info ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Platform */}
            <SectionCard title="🖥 Platform" color="bg-[#cfe9ff]">
              <InfoRow label="Python" value={info.platform.python_version} />
              <InfoRow label="OS" value={info.platform.os} />
              <InfoRow label="Arch" value={info.platform.arch} />
            </SectionCard>

            {/* Database */}
            <SectionCard title="🗄 Database" color={dbOnline ? "bg-[#b8f5c8]" : "bg-[#ffd1dc]"}>
              <InfoRow
                label="Status"
                value={info.database.status.toUpperCase()}
                accent={dbOnline ? "bg-[#b8f5c8]" : "bg-[#ffd1dc]"}
              />
              <InfoRow label="MongoDB" value={`v${info.database.mongo_version}`} />
              <InfoRow label="DB Name" value={info.database.db_name} />
            </SectionCard>

            {/* Data Counters */}
            <SectionCard title="📊 Data" color="bg-[#ffde59]">
              <InfoRow label="Total Docs" value={info.data.total_documents.toLocaleString()} />
              <InfoRow label="Users" value={info.data.total_users.toLocaleString()} />
              <InfoRow label="Vector Indexed" value={info.data.vector_indexed.toLocaleString()} />
              <InfoRow
                label="Pending"
                value={info.data.pending_processing.toLocaleString()}
                accent={info.data.pending_processing > 0 ? "bg-[#ffde59]" : "bg-white"}
              />
            </SectionCard>
          </div>

          {/* Indexing Health Bar */}
          <section className="border-4 border-black bg-white shadow-[8px_8px_0px_black] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg uppercase tracking-tight">
                Vector Index Coverage
              </h3>
              <span className="font-black text-2xl">
                {info.data.total_documents > 0
                  ? `${Math.round(
                      (info.data.vector_indexed / info.data.total_documents) * 100
                    )}%`
                  : "—"}
              </span>
            </div>
            <div className="w-full h-6 border-4 border-black bg-[#e1e1e1] rounded-none overflow-hidden">
              <div
                className="h-full bg-[#ffde59] border-r-4 border-black transition-all duration-700"
                style={{
                  width:
                    info.data.total_documents > 0
                      ? `${(info.data.vector_indexed / info.data.total_documents) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs font-black uppercase opacity-50">
              <span>0</span>
              <span>{info.data.total_documents} Total Documents</span>
            </div>
          </section>

          {/* Config Reminders */}
          <section className="border-4 border-black bg-black text-white p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.3)]">
            <h3 className="font-black text-lg uppercase tracking-tight mb-4">
              ⚙ Production Checklist
            </h3>
            <ul className="flex flex-col gap-3 text-sm font-bold">
              {[
                { label: "ADMIN_API_SECRET", hint: "Set a real random secret in .env" },
                { label: "SMTP credentials", hint: "Replace placeholder in auth/.env" },
                { label: "ADMIN_EMAILS", hint: "Add your real admin email in auth/.env" },
                { label: "DEVTRACE_ENABLED", hint: "Set to true if you want request tracing" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-[#ffde59] mt-0.5">→</span>
                  <div>
                    <code className="bg-white/10 px-2 py-0.5 rounded text-xs">{item.label}</code>
                    <span className="ml-2 opacity-60">{item.hint}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </div>
  );
}
