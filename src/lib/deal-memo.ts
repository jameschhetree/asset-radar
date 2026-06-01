import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ListingForMemo {
  name: string;
  url: string;
  source: string;
  askingPrice: number | null;
  monthlyRevenue: number | null;
  monthlyProfit: number | null;
  revenueMultiple: number | null;
  profitMultiple: number | null;
  assetType: string;
  niche: string;
  age: string;
  trafficSources: string;
  monthlyVisitors: number | null;
  emailListSize: number | null;
  monetization: string;
  techStack: string;
  ownerWorkload: string;
  reasonForSale: string;
  sellerClaims: string;
  evidenceAvailable: string;
  score: number;
  scoreBreakdown: Record<string, number> | null;
}

export async function generateDealMemo(listing: ListingForMemo): Promise<string> {
  const askingPrice = listing.askingPrice || 0;
  const monthlyProfit = listing.monthlyProfit || 0;
  const annualProfit = monthlyProfit * 12;
  const paybackMonths = monthlyProfit > 0 ? Math.round(askingPrice / monthlyProfit) : Infinity;

  const prompt = `You are a private equity analyst writing a deal memo for a small online asset acquisition.
Budget: $1,000-$5,000. Be skeptical, thorough, and honest. No hype.

Write a deal memo with these 14 sections:

1. ONE-LINE VERDICT: One sentence summary of whether to pursue or pass.
2. ASSET SUMMARY: What it is, what it does, key metrics.
3. WHY IT IS INTERESTING: The bull case in 2-3 sentences.
4. WHY IT MAY BE A TRAP: The bear case in 2-3 sentences.
5. DEAL MATH:
   - Asking Price: $${askingPrice.toLocaleString()}
   - Monthly Profit: $${monthlyProfit.toLocaleString()}
   - Annual Profit: $${annualProfit.toLocaleString()}
   - Payback Period: ${paybackMonths === Infinity ? "N/A (no profit)" : paybackMonths + " months"}
   - Current Multiple: ${listing.profitMultiple || "N/A"}x
   - Target Monthly Profit After Improvements: (estimate)
   - Estimated Resale Value at 24x: $${(monthlyProfit * 24).toLocaleString()}
   - Estimated Resale Value at 30x: $${(monthlyProfit * 30).toLocaleString()}
   - Estimated Resale Value at 36x: $${(monthlyProfit * 36).toLocaleString()}
6. PAYBACK PERIOD ANALYSIS: Is the payback period reasonable? What could shorten/lengthen it?
7. AI IMPROVEMENT PLAN: Specific AI tools and techniques to improve the asset.
8. 30-DAY GROWTH PLAN: Concrete steps for the first month.
9. 90-DAY GROWTH PLAN: Medium-term growth strategy.
10. DUE DILIGENCE QUESTIONS: 5-8 specific questions to ask the seller.
11. EVIDENCE NEEDED BEFORE BUYING: What must be verified before closing.
12. ESTIMATED UPSIDE CASE: Best realistic scenario in 12 months.
13. ESTIMATED DOWNSIDE CASE: Worst realistic scenario.
14. FINAL RECOMMENDATION: Buy, Watch, or Pass with reasoning.

LISTING DATA:
Name: ${listing.name}
Source: ${listing.source}
URL: ${listing.url}
Asking Price: $${askingPrice.toLocaleString()}
Monthly Revenue: ${listing.monthlyRevenue ? "$" + listing.monthlyRevenue.toLocaleString() : "Unknown"}
Monthly Profit: $${monthlyProfit.toLocaleString()}
Asset Type: ${listing.assetType || "Unknown"}
Niche: ${listing.niche || "Unknown"}
Age: ${listing.age || "Unknown"}
Traffic Sources: ${listing.trafficSources || "Unknown"}
Monthly Visitors: ${listing.monthlyVisitors ? listing.monthlyVisitors.toLocaleString() : "Unknown"}
Email List Size: ${listing.emailListSize || "Unknown"}
Monetization: ${listing.monetization || "Unknown"}
Tech Stack: ${listing.techStack || "Unknown"}
Owner Workload: ${listing.ownerWorkload || "Unknown"}
Reason for Sale: ${listing.reasonForSale || "Unknown"}
Seller Claims: ${listing.sellerClaims || "None"}
Evidence Available: ${listing.evidenceAvailable || "None"}
Asset Radar Score: ${listing.score}/100
Score Breakdown: ${listing.scoreBreakdown ? JSON.stringify(listing.scoreBreakdown) : "N/A"}

Write the memo in clean markdown. Be direct and honest. No filler.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return text;
  } catch (error) {
    console.error("Deal memo generation error for", listing.name, error);
    return `# Deal Memo: ${listing.name}\n\nDeal memo generation failed. Manual review required.\n\nAsking Price: $${askingPrice.toLocaleString()}\nMonthly Profit: $${monthlyProfit.toLocaleString()}\nPayback Period: ${paybackMonths === Infinity ? "N/A" : paybackMonths + " months"}`;
  }
}
