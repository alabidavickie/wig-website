import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getUserLocation, GeoData } from "@/lib/geo";

interface GeoState {
  geo: GeoData | null;
  rate: number;
  lastFetched: number | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  refreshRate: () => Promise<void>;
  getExchangeRate: () => number;
  formatPrice: (amount: number) => string;
}

const RATE_EXPIRY = 60000; // 1 minute — keep rates fresh to avoid financial discrepancy

export const useGeoStore = create<GeoState>()(
  persist(
    (set, get) => ({
      geo: null,
      rate: 1500, // Default fallback
      lastFetched: null,
      loading: false,
      initialized: false,

      initialize: async () => {
        const { initialized, lastFetched } = get();
        const now = Date.now();
        
        // If already initialized and rate is fresh, skip
        if (initialized && lastFetched && (now - lastFetched < RATE_EXPIRY)) return;
        
        set({ loading: true });
        try {
          // 1. Get Location
          let geoData = get().geo;
          if (!geoData) {
            geoData = await getUserLocation();
          }

          // 2. Get Exchange Rate (always GBP base)
          let currentRate = get().rate;
          try {
            const rateRes = await fetch("https://open.er-api.com/v6/latest/GBP");
            const rateData = await rateRes.json();
            if (rateData?.rates?.NGN) {
              currentRate = rateData.rates.NGN;
              console.log(`[GEO_STORE] Live Rate Fetched: 1 GBP = ${currentRate} NGN`);
            }
          } catch (e) {
            console.warn("[GEO_STORE] Failed to fetch live rate, using fallback:", e);
          }

          set({ 
            geo: geoData, 
            rate: currentRate,
            lastFetched: now,
            initialized: true 
          });
        } catch (error) {
          console.error("Failed to initialize geo store:", error);
        } finally {
          set({ loading: false });
        }
      },

      // Force-refresh the exchange rate (bypasses cache). 
      // Call this before checkout to ensure the price is accurate.
      refreshRate: async () => {
        set({ loading: true });
        try {
          const rateRes = await fetch("https://open.er-api.com/v6/latest/GBP");
          const rateData = await rateRes.json();
          if (rateData?.rates?.NGN) {
            set({ 
              rate: rateData.rates.NGN, 
              lastFetched: Date.now() 
            });
            console.log(`[GEO_STORE] Rate Refreshed: 1 GBP = ${rateData.rates.NGN} NGN`);
          }
        } catch (e) {
          console.warn("[GEO_STORE] Failed to refresh rate:", e);
        } finally {
          set({ loading: false });
        }
      },

      getExchangeRate: () => {
        const { geo, rate } = get();
        return geo?.currency === "NGN" ? rate : 1;
      },

      formatPrice: (amount: number) => {
        const { geo, getExchangeRate } = get();
        const rate = getExchangeRate();
        const convertedAmount = amount * rate;
        const symbol = geo?.symbol || "£";
        
        return `${symbol}${convertedAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      },
    }),
    {
      name: "silk-haus-geo",
      partialize: (state) => ({ 
        geo: state.geo,
        initialized: state.initialized, 
        rate: state.rate,
        lastFetched: state.lastFetched
      }),
    }
  )
);
