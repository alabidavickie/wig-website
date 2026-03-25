import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="flex flex-col min-h-screen bg-[#0A0A0A] text-white font-sans" suppressHydrationWarning>
      <Header />
      <main className="flex-1 mt-[80px] md:mt-[100px]" suppressHydrationWarning>
        <div className="h-full overflow-auto bg-[#0A0A0A]" suppressHydrationWarning>
          {children}
        </div>
      </main>
      <Footer />
    </div>
   );
}

export default DashboardLayout;
