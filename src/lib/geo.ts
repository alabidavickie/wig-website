export interface GeoData {
  country: string;
  isNigeria: boolean;
  currency: "NGN" | "GBP";
  symbol: "₦" | "£";
}

// Fallback data if API fails
const DEFAULT_GEO: GeoData = {
  country: "GB",
  isNigeria: false,
  currency: "GBP",
  symbol: "£",
};

/**
 * Fetches the user's location based on their IP address 
 * using the free ipapi.co service.
 */
export async function getUserLocation(): Promise<GeoData> {
  try {
    // We use ipapi.co (or ip-api.com) for simple geo detection without an API key
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    
    if (!res.ok) {
      console.warn("Geo API failed, using default (GBP/Stripe)");
      return DEFAULT_GEO;
    }

    const data = await res.json();
    const isNigeria = data.country_code === "NG";

    return {
      country: data.country_code || "GB",
      isNigeria,
      currency: isNigeria ? "NGN" : "GBP",
      symbol: isNigeria ? "₦" : "£",
    };
  } catch (error) {
    console.warn("Could not determine user location (network/adblocker), defaulting to GB.");
    return DEFAULT_GEO;
  }
}
