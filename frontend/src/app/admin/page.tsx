export default function AdminDashboard() {
  const stats = [
    { label: "Total Documents", value: "1,245", color: "bg-[#cfe9ff]", trend: "+12% this week" },
    { label: "Active Users", value: "89", color: "bg-[#ffde59]", trend: "+5% this week" },
    { label: "Storage Used", value: "45.2 GB", color: "bg-[#ffd1dc]", trend: "Normal" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex justify-between items-end border-b-4 border-black pb-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Overview</h1>
          <p className="text-xl font-bold opacity-70">Real-time system intelligence.</p>
        </div>
        <div className="hidden md:block px-4 py-2 bg-black text-white font-bold text-sm">
          Status: <span className="text-[#00ff00]">ALL SYSTEMS GO</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`border-4 border-black p-6 ${stat.color} shadow-[6px_6px_0px_black] transform transition-transform hover:-translate-y-1`}
          >
            <h3 className="text-lg font-black uppercase tracking-widest mb-4 opacity-80">
              {stat.label}
            </h3>
            <p className="text-5xl font-black mb-2">{stat.value}</p>
            <p className="text-sm font-bold opacity-70">{stat.trend}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 border-4 border-black bg-white shadow-[8px_8px_0px_black] overflow-hidden">
        <div className="bg-black text-white p-4">
          <h3 className="text-xl font-black uppercase">Recent Activity Log</h3>
        </div>
        <div className="p-6">
          <ul className="flex flex-col gap-4">
            {[
              { action: "Document Uploaded", user: "john@example.com", time: "2 mins ago" },
              { action: "User Registered", user: "sarah@example.com", time: "15 mins ago" },
              { action: "Vector Re-indexed", user: "SYSTEM", time: "1 hour ago" },
              { action: "OTP Generated", user: "ADMIN", time: "2 hours ago" },
            ].map((log, i) => (
              <li key={i} className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
                <div>
                  <p className="font-bold">{log.action}</p>
                  <p className="text-sm opacity-60 text-black">{log.user}</p>
                </div>
                <div className="text-sm font-bold opacity-50 bg-[#faf9f3] px-2 py-1 border border-black">
                  {log.time}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
