import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-[#0A0A0A] border-b border-[#2A2A2D] lg:justify-end h-[72px] text-white">
      {/* Mobile Hamburger Menu */}
      <MobileSidebar />
      
      {/* Desktop & Mobile Profile summary in Header */}
      <div className="flex items-center gap-x-4">
        <div className="hidden flex-col items-end sm:flex text-sm">
          <span className="font-bold text-white uppercase tracking-widest text-[11px]">Elena Vane</span>
          <span className="text-[9px] text-[#D5A754] font-bold uppercase tracking-widest">Diamond Elite</span>
        </div>
        <div className="relative">
          <Avatar className="h-9 w-9 border border-[#2A2A2D]">
            <AvatarImage src="https://i.pravatar.cc/150?img=12" />
            <AvatarFallback className="bg-[#1A1A1D] text-white">EV</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#D5A754] rounded-full border border-[#0A0A0A]"></div>
        </div>
      </div>
    </div>
  );
};
