"use client";

import { Save, Shield, Globe, Mail, Bell, CreditCard, ExternalLink, Sliders, Palette, Zap, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState("general");

  // General state
  const [generalConfig, setGeneralConfig] = useState({
    email: "follienn@gmail.com",
    phone: "+234 800 000 0000",
    instagram: "@follienn_hair",
    tiktok: "@follienn_hair",
    maintenance: false
  });

  // Store state
  const [storeConfig, setStoreConfig] = useState({
    currency: "GBP",
    shipping_base: "15.00",
    tax_rate: "20",
    order_prefix: "SH-"
  });

  // Privacy state
  const [privacyConfig, setPrivacyConfig] = useState({
    require_auth: true,
    cookie_consent: true,
    marketing_opt_in: false
  });

  // Branding state
  const [brandingConfig, setBrandingConfig] = useState({
    store_name: "Silk Haus",
    primary_color: "#D5A754",
    font_family: "Inter"
  });

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
          <h1 className="text-2xl font-bold tracking-tight uppercase tracking-[0.1em]">Settings</h1>
          <p className="text-zinc-400 text-[10px] mt-1 uppercase tracking-widest font-bold">Manage global parameters for Silk Haus.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-white text-black px-8 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-[#D5A754] transition-all flex items-center gap-3 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
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
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Store Profile</h3>
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
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Social Media</h3>
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
                        <button 
                          onClick={() => setGeneralConfig({...generalConfig, maintenance: !generalConfig.maintenance})}
                          className={`w-12 h-6 rounded-full relative transition-colors ${generalConfig.maintenance ? 'bg-[#D5A754]' : 'bg-[#2A2A2D]'}`}
                        >
                          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${generalConfig.maintenance ? 'left-7' : 'left-1'}`}></span>
                        </button>
                     </div>
                 </section>
             </div>
           )}

            {selectedTab === "notifications" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <section className="space-y-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Commerce Logic</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Default Currency</label>
                          <select 
                            value={storeConfig.currency}
                            onChange={(e) => setStoreConfig({...storeConfig, currency: e.target.value})}
                            className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold"
                          >
                            <option value="GBP">GBP (£)</option>
                            <option value="NGN">NGN (₦)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Base Shipping Fee</label>
                          <input 
                            value={storeConfig.shipping_base}
                            onChange={(e) => setStoreConfig({...storeConfig, shipping_base: e.target.value})}
                            className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" 
                          />
                       </div>
                    </div>
                 </section>
              </div>
            )}

            {selectedTab === "security" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <section className="space-y-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Access & Compliance</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-6 bg-[#0A0A0A] border border-[#2A2A2D]">
                          <div>
                             <p className="text-[12px] font-bold uppercase tracking-widest">Require Authentication for Checkout</p>
                             <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Disables guest checkout globally.</p>
                          </div>
                          <button 
                            onClick={() => setPrivacyConfig({...privacyConfig, require_auth: !privacyConfig.require_auth})}
                            className={`w-12 h-6 rounded-full relative transition-colors ${privacyConfig.require_auth ? 'bg-[#D5A754]' : 'bg-[#2A2A2D]'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacyConfig.require_auth ? 'left-7' : 'left-1'}`}></span>
                          </button>
                      </div>

                      <div className="flex items-center justify-between p-6 bg-[#0A0A0A] border border-[#2A2A2D]">
                          <div>
                             <p className="text-[12px] font-bold uppercase tracking-widest">Strict Cookie Consent</p>
                             <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Limits tracking until user accepts banner.</p>
                          </div>
                          <button 
                            onClick={() => setPrivacyConfig({...privacyConfig, cookie_consent: !privacyConfig.cookie_consent})}
                            className={`w-12 h-6 rounded-full relative transition-colors ${privacyConfig.cookie_consent ? 'bg-[#D5A754]' : 'bg-[#2A2A2D]'}`}
                          >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacyConfig.cookie_consent ? 'left-7' : 'left-1'}`}></span>
                          </button>
                      </div>
                    </div>
                 </section>
              </div>
            )}

            {selectedTab === "appearance" && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                 <section className="space-y-6">
                    <h3 className="text-[12px] font-bold uppercase tracking-widest border-l-2 border-[#D5A754] pl-4 text-white">Visual Identity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Store Name</label>
                          <input 
                            value={brandingConfig.store_name}
                            onChange={(e) => setBrandingConfig({...brandingConfig, store_name: e.target.value})}
                            className="w-full h-12 px-4 border border-[#2A2A2D] text-[13px] outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Primary Brand Color (Hex)</label>
                          <div className="flex gap-4">
                            <input 
                              type="color"
                              value={brandingConfig.primary_color}
                              onChange={(e) => setBrandingConfig({...brandingConfig, primary_color: e.target.value})}
                              className="w-12 h-12 border border-[#2A2A2D] bg-[#0A0A0A] cursor-pointer" 
                            />
                            <input 
                              value={brandingConfig.primary_color}
                              onChange={(e) => setBrandingConfig({...brandingConfig, primary_color: e.target.value})}
                              className="flex-1 h-12 px-4 border border-[#2A2A2D] text-[13px] uppercase outline-none focus:border-[#D5A754] bg-[#0A0A0A] font-bold" 
                            />
                          </div>
                       </div>
                    </div>
                 </section>
              </div>
            )}

        </div>
      </div>
    </div>
  );
}
