import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Header = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b lg:justify-end shadow-sm h-[72px]">
      {/* Mobile Hamburger Menu */}
      <MobileSidebar />
      
      {/* Desktop & Mobile Profile summary in Header */}
      <div className="flex items-center gap-x-4">
        <div className="hidden flex-col items-end sm:flex text-sm">
          <span className="font-semibold text-zinc-900">Augustus</span>
        </div>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>AU</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
