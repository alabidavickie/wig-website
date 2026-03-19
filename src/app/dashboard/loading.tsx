export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl animate-pulse space-y-24 p-8 md:p-12 bg-[#0A0A0A]">
      <div className="space-y-6">
        <div className="h-4 w-48 bg-zinc-800 rounded-full"></div>
        <div className="h-24 w-full max-w-lg bg-zinc-800 rounded-2xl"></div>
        <div className="h-12 w-full max-w-md bg-zinc-800 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-zinc-900 rounded-[2px] border border-zinc-800"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 h-[500px] bg-zinc-900 rounded-[2px] border border-zinc-800"></div>
        <div className="space-y-12">
          <div className="h-64 bg-zinc-900 rounded-[2px] border border-zinc-800"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-zinc-900 rounded-[2px] border border-zinc-800"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
