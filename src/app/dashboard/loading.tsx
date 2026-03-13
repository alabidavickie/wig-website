export default function DashboardLoading() {
  return (
    <div className="w-full max-w-7xl animate-pulse space-y-24 p-8 md:p-12">
      <div className="space-y-6">
        <div className="h-4 w-48 bg-gray-100 rounded-full"></div>
        <div className="h-24 w-full max-w-lg bg-gray-100 rounded-2xl"></div>
        <div className="h-12 w-full max-w-md bg-gray-100 rounded-xl"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-56 bg-gray-100 rounded-[32px]"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 h-[500px] bg-gray-100 rounded-[40px]"></div>
        <div className="space-y-12">
          <div className="h-64 bg-gray-100 rounded-[40px]"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-[20px]"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
