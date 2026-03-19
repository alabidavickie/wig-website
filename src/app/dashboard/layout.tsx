import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="h-full relative bg-[#0A0A0A] text-white font-sans" suppressHydrationWarning>
      <div className="hidden h-full md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-[80] bg-[#0A0A0A] border-r border-[#2A2A2D]" suppressHydrationWarning>
        <Sidebar />
      </div>
      <main className="md:pl-64 h-full flex flex-col bg-[#0A0A0A]" suppressHydrationWarning>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-[#2A2A2D] bg-[#0A0A0A]" suppressHydrationWarning>
          <MobileSidebar />
          <h1 className="text-xl font-serif tracking-widest uppercase text-[#D5A754]">SILK HAUS</h1>
          <div className="w-8 h-8"></div> {/* Placeholder to balance flex */}
        </div>
        
        <div className="flex-1 overflow-auto bg-[#0A0A0A]" suppressHydrationWarning>
          {children}
        </div>
      </main>
    </div>
   );
}
 
export default DashboardLayout;
