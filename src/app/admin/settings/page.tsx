"use client";

import { Save, Shield, Globe, Mail, Bell, CreditCard, ExternalLink, Sliders, Palette, Zap, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert("Administrative settings have been successfully synchronized.");
  };

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "notifications", label: "Store", icon: ShoppingBag },
    { id: "security", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Branding", icon: Palette },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-white">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">System Configuration</h1>
          <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-widest font-bold">Manage global parameters for Silk Haus.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all flex items-center gap-3 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Synchronize Changes
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        {/* Navigation Sidebar */}
        <aside className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 text-[11px] font-bold uppercase tracking-widest transition-all ${
                selectedTab === tab.id 
                ? 'bg-white border border-gray-100 text-[#C5A880] shadow-sm' 
                : 'text-gray-400 hover:text-black'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className="bg-[#141414] p-8 md:p-12 border border-[#2A2A2D] shadow-sm space-y-12 rounded-sm text-white">
           
           {selectedTab === "general" && (
             <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <section className="space-y-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Public Master Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Official Contact Email</label>
                          <input defaultValue="follienn@gmail.com" className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Support Phone Line</label>
                          <input defaultValue="+234 800 000 0000" className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" />
                       </div>
                    </div>
                 </section>
 
                 <section className="space-y-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Social Architecture</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Instagram Handle</label>
                          <input defaultValue="@follienn_hair" className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">TikTok Identifier</label>
                          <input defaultValue="@follienn_hair" className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" />
                       </div>
                    </div>
                 </section>
 
                 <section className="space-y-6 pt-10 border-t border-[#2A2A2D]">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-[12px] font-bold uppercase tracking-widest">Maintenance Mode</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Temporarily disable storefront access for updates.</p>
                        </div>
                        <button className="w-12 h-6 bg-[#2A2A2D] rounded-full relative transition-colors"><span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span></button>
                     </div>
                 </section>
             </div>
           )}

            {selectedTab !== "general" && (
              <div className="py-20 text-center space-y-4">
                 <Sliders className="w-12 h-12 text-[#2A2A2D] mx-auto" />
                 <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 italic">This master control module is currently being calibrated.</p>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}
