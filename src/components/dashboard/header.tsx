import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-background border-b border-border lg:justify-end h-[72px] text-foreground">
      {/* Mobile Hamburger Menu */}
      <MobileSidebar />
      
      {/* Desktop & Mobile Profile summary in Header */}
      <div className="flex items-center gap-x-4">
        <div className="hidden flex-col items-end sm:flex text-sm">
          <span className="font-bold text-foreground uppercase tracking-widest text-[11px]">Elena Vane</span>
          <span className="text-[9px] text-[#D5A754] font-bold uppercase tracking-widest">Member</span>
        </div>
        <div className="relative">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src="https://i.pravatar.cc/150?img=12" />
            <AvatarFallback className="bg-secondary text-foreground">EV</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#D5A754] rounded-full border border-[#0A0A0A]"></div>
        </div>
      </div>
    </div>
  );
};
