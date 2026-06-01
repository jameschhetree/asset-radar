import Anthropic from "@anthropic-ai/sdk";
import { NormalizedListing, ScoreResult } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SCORING_PROMPT = `You are a skeptical private equity analyst evaluating small online asset acquisitions.
Your job is to protect the buyer from bad deals, not find exciting ones.

The buyer's budget is $1,000-$5,000. Listings priced $1-5K are ideal. Listings $5-10K can pass but offer no budget bonus. Listings >$10K are outside realistic acquisition range.

Score this listing across 10 categories (0-10 each, where 10 = excellent):

1. Valuation Quality (is the price fair relative to earnings? favor low multiples under 24x)
2. Niche Quality (boring, evergreen niches score higher. Trendy/AI/crypto score lower)
3. Traffic Quality (diverse sources score higher. Single source = risky)
4. Revenue Quality (verified, recurring, multiple streams = higher. Unverified = lower)
5. Monetization Upside (room to add new revenue streams? e.g., adding affiliates to an AdSense site)
6. AI Improvement Potential (can AI tools meaningfully improve content, SEO, or operations?)
7. Workload Simplicity (passive income scores higher. Heavy manual work = lower)
8. Resale Potential (could this be flipped at a higher multiple in 12-24 months?)
9. Risk Level (10 = very low risk, 0 = very high risk. Invert: lower risk = higher score)
10. Scam/Fake Metric Risk (10 = clearly legitimate, 0 = highly suspicious)

Also check these AUTO-REJECT filters (boolean). If ANY are true, the listing should be auto-rejected:
- noRevenueHighPrice: No revenue and asking price > $500
- vagueSellerClaims: Seller claims are vague with no specifics
- badFinancials: Missing or clearly fabricated financial data
- singleTrafficSource: Only one traffic source with no diversification
- singleCustomer: Revenue depends on a single customer
- decliningTraffic: Clear evidence of declining traffic
- unverifiedRevenue: Revenue claimed but no verification available
- heavyManualWork: Requires >20 hours/week of manual work
- founderDependency: Business cannot operate without the founder
- platformDependency: Entirely dependent on one platform (e.g., single Amazon affiliate)
- trademarkRisk: Potential trademark or IP issues
- aiSpamSite: Appears to be an AI-generated spam/content farm
- regulatedNiche: Health/finance/legal claims that create liability
- adultGamblingCrypto: Adult, gambling, or crypto content

IMPORTANT: Be skeptical. Most listings on these marketplaces are overpriced or have hidden problems.
Default to scoring conservatively. A score of 50 is "maybe worth looking at." A score of 70+ is genuinely promising.

Respond with ONLY valid JSON in this exact format:
{
  "scores": {
    "valuationQuality": <0-10>,
    "nicheQuality": <0-10>,
    "trafficQuality": <0-10>,
    "revenueQuality": <0-10>,
    "monetizationUpside": <0-10>,
    "aiImprovementPotential": <0-10>,
    "workloadSimplicity": <0-10>,
    "resalePotential": <0-10>,
    "riskLevel": <0-10>,
    "scamRisk": <0-10>
  },
  "autoReject": {
    "noRevenueHighPrice": <boolean>,
    "vagueSellerClaims": <boolean>,
    "badFinancials": <boolean>,
    "singleTrafficSource": <boolean>,
    "singleCustomer": <boolean>,
    "decliningTraffic": <boolean>,
    "unverifiedRevenue": <boolean>,
    "heavyManualWork": <boolean>,
    "founderDependency": <boolean>,
    "platformDependency": <boolean>,
    "trademarkRisk": <boolean>,
    "aiSpamSite": <boolean>,
    "regulatedNiche": <boolean>,
    "adultGamblingCrypto": <boolean>
  },
  "oneLineVerdict": "<one sentence verdict>",
  "biggestUpside": "<one sentence>",
  "biggestRisk": "<one sentence>"
}`;

export async function scoreListing(listing: NormalizedListing): Promise<ScoreResult & { verdict: string; biggestUpside: string; biggestRisk: string }> {
  const listingContext = `
LISTING DATA:
Name: ${listing.name}
Source: ${listing.source}
URL: ${listing.url}
Asking Price: ${listing.askingPrice ? "$" + listing.askingPrice.toLocaleString() : "Not listed"}
Monthly Revenue: ${listing.monthlyRevenue ? "$" + listing.monthlyRevenue.toLocaleString() : "Not disclosed"}
Monthly Profit: ${listing.monthlyProfit ? "$" + listing.monthlyProfit.toLocaleString() : "Not disclosed"}
Revenue Multiple: ${listing.revenueMultiple || "Unknown"}
Profit Multiple: ${listing.profitMultiple || "Unknown"}
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
`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: SCORING_PROMPT + "\n\n" + listingContext,
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in scoring response");
    }

    const result = JSON.parse(jsonMatch[0]);
    const raw = result.scores || {};

    // Ensure all scores are numbers with defaults
    const scores = {
      valuationQuality: Number(raw.valuationQuality) || 0,
      nicheQuality: Number(raw.nicheQuality) || 0,
      trafficQuality: Number(raw.trafficQuality) || 0,
      revenueQuality: Number(raw.revenueQuality) || 0,
      monetizationUpside: Number(raw.monetizationUpside) || 0,
      aiImprovementPotential: Number(raw.aiImprovementPotential) || 0,
      workloadSimplicity: Number(raw.workloadSimplicity) || 0,
      resalePotential: Number(raw.resalePotential) || 0,
      riskLevel: Number(raw.riskLevel) || 0,
      scamRisk: Number(raw.scamRisk) || 0,
    };

    // Calculate total score
    let totalScore =
      scores.valuationQuality +
      scores.nicheQuality +
      scores.trafficQuality +
      scores.revenueQuality +
      scores.monetizationUpside +
      scores.aiImprovementPotential +
      scores.workloadSimplicity +
      scores.resalePotential +
      scores.riskLevel +
      scores.scamRisk;

    // Budget fit adjustment
    if (listing.askingPrice !== null) {
      if (listing.askingPrice <= 5000) {
        totalScore += 10; // Budget fit bonus
      } else if (listing.askingPrice > 10000) {
        totalScore -= 20; // Over budget penalty
      }
    }

    // Clamp to 0-100
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Determine auto-reject reasons
    const autoReject = result.autoReject;
    const autoRejectReasons: string[] = [];
    for (const [key, value] of Object.entries(autoReject)) {
      if (value === true) {
        autoRejectReasons.push(key);
      }
    }

    return {
      totalScore,
      breakdown: {
        valuationQuality: scores.valuationQuality,
        nicheQuality: scores.nicheQuality,
        trafficQuality: scores.trafficQuality,
        revenueQuality: scores.revenueQuality,
        monetizationUpside: scores.monetizationUpside,
        aiImprovementPotential: scores.aiImprovementPotential,
        workloadSimplicity: scores.workloadSimplicity,
        resalePotential: scores.resalePotential,
        riskLevel: scores.riskLevel,
        scamRisk: scores.scamRisk,
      },
      autoRejectReasons,
      shouldAutoReject: autoRejectReasons.length > 0,
      verdict: result.oneLineVerdict || "",
      biggestUpside: result.biggestUpside || "",
      biggestRisk: result.biggestRisk || "",
    };
  } catch (error) {
    console.error("Scoring error for", listing.name, error);
    // Return a conservative default score
    return {
      totalScore: 20,
      breakdown: {
        valuationQuality: 2,
        nicheQuality: 2,
        trafficQuality: 2,
        revenueQuality: 2,
        monetizationUpside: 2,
        aiImprovementPotential: 2,
        workloadSimplicity: 2,
        resalePotential: 2,
        riskLevel: 2,
        scamRisk: 2,
      },
      autoRejectReasons: ["scoringError"],
      shouldAutoReject: true,
      verdict: "Scoring failed - auto-rejected for safety",
      biggestUpside: "Unknown",
      biggestRisk: "Could not evaluate",
    };
  }
}
