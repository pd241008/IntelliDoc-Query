export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f3]">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="w-14 h-14 border-4 border-black border-t-transparent rounded-full animate-spin" />

        <p className="text-lg font-semibold tracking-wide">
          Loading IntelliDoc…
          <span className="loading loading-infinity loading-xl"></span>
        </p>
      </div>
    </div>
  );
}
