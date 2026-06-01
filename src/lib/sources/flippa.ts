import { NormalizedListing } from "../types";
import crypto from "crypto";

interface FlippaListing {
  id: string;
  listing_url: string;
  title: string;
  price: number;
  category: string;
  monetization: string;
  profit_average: number | null;
  revenue_average: number | null;
  multiple: number;
  revenue_multiple: number;
  property_name: string;
  property_type: string;
  formatted_age_in_years: string;
  has_verified_traffic: boolean;
  has_verified_revenue: boolean;
  uniques_per_month: number | null;
  key_data: Array<{ label: string; value: string }>;
  status: string;
  country_name: string;
  summary: string;
}

function parseProfit(keyData: Array<{ label: string; value: string }>): number | null {
  const profitEntry = keyData.find((k) => k.label === "Net Profit");
  if (!profitEntry) return null;
  const match = profitEntry.value.match(/\$([\d,]+)/);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ""));
}

function parseRevenue(keyData: Array<{ label: string; value: string }>): number | null {
  const revenueEntry = keyData.find((k) => k.label === "Revenue");
  if (!revenueEntry) return null;
  const match = revenueEntry.value.match(/\$([\d,]+)/);
  if (!match) return null;
  return parseFloat(match[1].replace(/,/g, ""));
}

export async function fetchFlippaListings(): Promise<NormalizedListing[]> {
  const url = "https://flippa.com/websites?price_max=5000&sort_alias=most_recent";

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
  });

  if (!response.ok) {
    throw new Error(`Flippa fetch failed: ${response.status}`);
  }

  const html = await response.text();

  // Extract the STATE JSON from the embedded script
  const stateMatch = html.match(/const STATE = (\{[\s\S]*?\});/);
  if (!stateMatch) {
    throw new Error("Could not find STATE JSON in Flippa page");
  }

  const state = JSON.parse(stateMatch[1]);
  const results: FlippaListing[] = state.results || [];

  return results.map((listing): NormalizedListing => {
    const monthlyProfit = parseProfit(listing.key_data);
    const monthlyRevenue = listing.revenue_average || parseRevenue(listing.key_data) || null;
    const askingPrice = listing.price;

    return {
      name: listing.property_name || listing.title?.slice(0, 80) || "Unknown",
      url: listing.listing_url,
      source: "Flippa",
      askingPrice,
      monthlyRevenue: monthlyRevenue,
      monthlyProfit: monthlyProfit,
      revenueMultiple: listing.revenue_multiple || null,
      profitMultiple: listing.multiple || null,
      assetType: listing.property_type || "",
      niche: listing.category || "",
      age: listing.formatted_age_in_years || "",
      trafficSources: listing.has_verified_traffic ? "Verified" : "Unverified",
      monthlyVisitors: listing.uniques_per_month || null,
      emailListSize: null,
      monetization: listing.monetization || "",
      techStack: "",
      ownerWorkload: "",
      reasonForSale: "",
      sellerClaims: listing.summary || "",
      evidenceAvailable: [
        listing.has_verified_traffic ? "Verified Traffic" : "",
        listing.has_verified_revenue ? "Verified Revenue" : "",
      ]
        .filter(Boolean)
        .join(", ") || "None",
      riskNotes: "",
      upsideNotes: "",
      sourceHash: crypto
        .createHash("sha256")
        .update(`flippa-${listing.id}`)
        .digest("hex"),
    };
  });
}

export const flippaAdapter = {
  name: "Flippa",
  fetch: fetchFlippaListings,
};
