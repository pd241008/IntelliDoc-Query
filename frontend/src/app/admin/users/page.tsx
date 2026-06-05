"use client";

import { useEffect, useState } from "react";

interface User {
  user_id: string;
  document_count: number;
  last_active: string | null;
  statuses: string[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setUsers(data.users ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <header className="flex justify-between items-end border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">
            Manage Users
          </h1>
          <p className="text-xl font-bold opacity-70">
            {isLoading ? "Loading..." : `${users.length} unique users found.`}
          </p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-black text-white font-bold text-sm">
          {error ? (
            <span className="text-[#ff5c00]">BACKEND ERROR</span>
          ) : (
            <span className="text-[#00ff00]">LIVE DATA</span>
          )}
        </div>
      </header>

      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="SEARCH BY USER ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border-4 border-black px-4 py-3 font-black text-sm uppercase bg-white shadow-[4px_4px_0px_black] focus:outline-none focus:translate-x-0.5 focus:translate-y-0.5 focus:shadow-none transition-all"
        />
        <div className="px-4 py-3 bg-[#ffde59] border-4 border-black font-black text-sm shadow-[4px_4px_0px_black]">
          {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="border-4 border-black bg-[#fff0f0] p-4 shadow-[6px_6px_0px_#ff5a5a]">
          <p className="font-black text-sm uppercase">⚠ {error}</p>
        </div>
      )}

      {/* User Table */}
      <section className="border-4 border-black bg-white shadow-[8px_8px_0px_black] overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 bg-black text-white px-6 py-4 text-xs font-black uppercase tracking-widest">
          <div className="col-span-5">User ID</div>
          <div className="col-span-2 text-center">Docs</div>
          <div className="col-span-3">Last Active</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Rows */}
        <div className="divide-y-2 divide-dashed divide-black/20">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-12 px-6 py-4 animate-pulse gap-2"
              >
                <div className="col-span-5 h-4 bg-gray-200 rounded" />
                <div className="col-span-2 h-4 bg-gray-200 rounded" />
                <div className="col-span-3 h-4 bg-gray-200 rounded" />
                <div className="col-span-2 h-4 bg-gray-200 rounded" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-black uppercase text-2xl opacity-20">
                No Users Found
              </p>
            </div>
          ) : (
            filtered.map((user, i) => {
              const hasActive = user.statuses.includes("completed");
              const hasPending = user.statuses.includes("pending");
              return (
                <div
                  key={i}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-[#faf9f3] transition-colors"
                >
                  {/* User ID */}
                  <div className="col-span-5">
                    <p className="font-mono font-bold text-sm truncate max-w-xs">
                      {user.user_id}
                    </p>
                  </div>

                  {/* Doc Count */}
                  <div className="col-span-2 text-center">
                    <span className="inline-block border-2 border-black px-3 py-0.5 font-black text-sm bg-[#cfe9ff] shadow-[2px_2px_0px_black]">
                      {user.document_count}
                    </span>
                  </div>

                  {/* Last Active */}
                  <div className="col-span-3">
                    <p className="font-bold text-xs opacity-70">
                      {user.last_active
                        ? new Date(user.last_active).toLocaleString()
                        : "—"}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-end gap-1 flex-wrap">
                    {hasActive && (
                      <span className="px-2 py-0.5 bg-[#b8f5c8] border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_black]">
                        Active
                      </span>
                    )}
                    {hasPending && (
                      <span className="px-2 py-0.5 bg-[#ffde59] border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_black]">
                        Pending
                      </span>
                    )}
                    {!hasActive && !hasPending && (
                      <span className="px-2 py-0.5 bg-gray-100 border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_black]">
                        {user.statuses[0] ?? "—"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
