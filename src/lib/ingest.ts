import { prisma } from "./db";
import { adapters } from "./sources";
import { scoreListing } from "./scoring";
import { generateDealMemo } from "./deal-memo";
import { NormalizedListing } from "./types";

interface IngestResult {
  source: string;
  listingsFound: number;
  newAdded: number;
  autoRejected: number;
  errors: string;
  highScoreAlerts: Array<{ name: string; score: number; url: string }>;
}

export async function runIngestion(): Promise<IngestResult[]> {
  const results: IngestResult[] = [];

  for (const adapter of adapters) {
    const result: IngestResult = {
      source: adapter.name,
      listingsFound: 0,
      newAdded: 0,
      autoRejected: 0,
      errors: "",
      highScoreAlerts: [],
    };

    const scanRun = await prisma.scanRun.create({
      data: { source: adapter.name },
    });

    try {
      // Fetch listings from source
      const listings = await adapter.fetch();
      result.listingsFound = listings.length;

      // Process each listing
      for (const listing of listings) {
        try {
          await processListing(listing, result);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors += `Error processing ${listing.name}: ${msg}\n`;
        }
      }

      // Update source health
      await prisma.sourceHealth.upsert({
        where: { source: adapter.name },
        update: {
          lastSuccess: new Date(),
          consecutiveFails: 0,
        },
        create: {
          source: adapter.name,
          lastSuccess: new Date(),
        },
      });

      // Update scan run
      await prisma.scanRun.update({
        where: { id: scanRun.id },
        data: {
          finishedAt: new Date(),
          listingsFound: result.listingsFound,
          newAdded: result.newAdded,
          autoRejected: result.autoRejected,
          errors: result.errors,
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.errors = `Adapter error: ${msg}`;

      // Update source health for failure
      await prisma.sourceHealth.upsert({
        where: { source: adapter.name },
        update: {
          lastFailure: new Date(),
          consecutiveFails: { increment: 1 },
        },
        create: {
          source: adapter.name,
          lastFailure: new Date(),
          consecutiveFails: 1,
        },
      });

      await prisma.scanRun.update({
        where: { id: scanRun.id },
        data: {
          finishedAt: new Date(),
          errors: result.errors,
        },
      });
    }

    results.push(result);
  }

  return results;
}

async function processListing(
  listing: NormalizedListing,
  result: IngestResult
): Promise<void> {
  // Check for existing listing by sourceHash
  const existing = await prisma.listing.findUnique({
    where: { sourceHash: listing.sourceHash },
  });

  if (existing) {
    // Update lastSeen
    await prisma.listing.update({
      where: { id: existing.id },
      data: { lastSeen: new Date() },
    });
    return;
  }

  // Score the listing
  const scoreResult = await scoreListing(listing);

  const withinBudget = listing.askingPrice !== null && listing.askingPrice <= 5000;

  const status = scoreResult.shouldAutoReject
    ? "AutoRejected" as const
    : "NeedsReview" as const;

  if (status === "AutoRejected") {
    result.autoRejected++;
  }

  // Create the listing
  const created = await prisma.listing.create({
    data: {
      name: listing.name,
      url: listing.url,
      source: listing.source,
      askingPrice: listing.askingPrice,
      monthlyRevenue: listing.monthlyRevenue,
      monthlyProfit: listing.monthlyProfit,
      revenueMultiple: listing.revenueMultiple,
      profitMultiple: listing.profitMultiple,
      assetType: listing.assetType,
      niche: listing.niche,
      age: listing.age,
      trafficSources: listing.trafficSources,
      monthlyVisitors: listing.monthlyVisitors,
      emailListSize: listing.emailListSize,
      monetization: listing.monetization,
      techStack: listing.techStack,
      ownerWorkload: listing.ownerWorkload,
      reasonForSale: listing.reasonForSale,
      sellerClaims: listing.sellerClaims,
      evidenceAvailable: listing.evidenceAvailable,
      withinBudget,
      status,
      score: scoreResult.totalScore,
      scoreBreakdown: scoreResult.breakdown,
      sourceHash: listing.sourceHash,
    },
  });

  result.newAdded++;

  // Generate deal memo for promising listings
  if (status === "NeedsReview" && scoreResult.totalScore >= 60) {
    try {
      const memo = await generateDealMemo({
        ...listing,
        score: scoreResult.totalScore,
        scoreBreakdown: scoreResult.breakdown,
      });
      await prisma.listing.update({
        where: { id: created.id },
        data: { dealMemo: memo },
      });
    } catch (err) {
      console.error("Deal memo generation failed for", listing.name, err);
    }
  }

  // High score alert
  if (scoreResult.totalScore >= 85) {
    result.highScoreAlerts.push({
      name: listing.name,
      score: scoreResult.totalScore,
      url: listing.url,
    });
  }
}
