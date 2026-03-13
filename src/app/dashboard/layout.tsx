import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full relative bg-white text-[#1A1A1D] font-sans" suppressHydrationWarning>
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#FAF9F6] border-r border-gray-200" suppressHydrationWarning>
        <Sidebar />
      </div>
      <main className="md:pl-64 h-full flex flex-col" suppressHydrationWarning>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white" suppressHydrationWarning>
          <MobileSidebar />
          <h1 className="text-xl font-serif tracking-widest uppercase text-[#1A1A1D]">SOLACE</h1>
          <div className="w-8 h-8"></div> {/* Placeholder to balance flex */}
        </div>
        
        <div className="flex-1 overflow-auto bg-white" suppressHydrationWarning>
          {children}
        </div>
      </main>
    </div>
   );
}
 
export default DashboardLayout;
