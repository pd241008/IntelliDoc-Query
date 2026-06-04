"use client";

import { useEffect, useState } from "react";

interface ActivityItem {
  action: string;
  user: string;
  time: string;
}

interface DashboardStats {
  total_documents: number;
  active_users: number;
  recent_activity: ActivityItem[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data: DashboardStats = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Total Documents",
      value: stats ? stats.total_documents.toLocaleString() : "—",
      color: "bg-[#cfe9ff]",
    },
    {
      label: "Active Users",
      value: stats ? stats.active_users.toLocaleString() : "—",
      color: "bg-[#ffde59]",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex justify-between items-end border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
            Overview
          </h1>
          <p className="text-xl font-bold opacity-70">
            Real-time system intelligence.
          </p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-black text-white font-bold text-sm">
          Status:{" "}
          <span className={error ? "text-[#ff5c00]" : "text-[#00ff00]"}>
            {error ? "BACKEND ERROR" : isLoading ? "LOADING..." : "ALL SYSTEMS GO"}
          </span>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={`border-4 border-black p-6 ${stat.color} shadow-[6px_6px_0px_black] transform transition-transform hover:-translate-y-1`}
          >
            <h3 className="text-lg font-black uppercase tracking-widest mb-4 opacity-80">
              {stat.label}
            </h3>
            <p className="text-5xl font-black mb-2">
              {isLoading ? (
                <span className="animate-pulse text-3xl">Loading...</span>
              ) : (
                stat.value
              )}
            </p>
          </div>
        ))}
      </section>

      {/* Activity Log */}
      <section className="mt-8 border-4 border-black bg-white shadow-[8px_8px_0px_black] overflow-hidden">
        <div className="bg-black text-white p-4">
          <h3 className="text-xl font-black uppercase">Recent Activity Log</h3>
        </div>
        <div className="p-6">
          {error && (
            <p className="text-red-500 font-bold text-sm mb-4">⚠ {error}</p>
          )}
          {isLoading ? (
            <p className="font-bold animate-pulse uppercase tracking-widest text-sm opacity-50">
              Fetching activity...
            </p>
          ) : !stats || stats.recent_activity.length === 0 ? (
            <p className="font-bold opacity-40 uppercase text-sm">
              No recent activity found.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {stats.recent_activity.map((log, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2"
                >
                  <div>
                    <p className="font-bold">{log.action}</p>
                    <p className="text-sm opacity-60 text-black">{log.user}</p>
                  </div>
                  <div className="text-sm font-bold opacity-50 bg-[#faf9f3] px-2 py-1 border border-black">
                    {new Date(log.time).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
