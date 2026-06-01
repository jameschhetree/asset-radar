import { prisma } from "./db";

export async function buildDigest(): Promise<string> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get recent scan runs
  const recentScans = await prisma.scanRun.findMany({
    where: {
      startedAt: { gte: twentyFourHoursAgo },
    },
  });

  const totalScanned = recentScans.reduce((sum, s) => sum + s.listingsFound, 0);
  const totalNew = recentScans.reduce((sum, s) => sum + s.newAdded, 0);
  const totalRejected = recentScans.reduce((sum, s) => sum + s.autoRejected, 0);

  // Get top 5 within budget, not auto-rejected, from last 24h
  const topListings = await prisma.listing.findMany({
    where: {
      createdAt: { gte: twentyFourHoursAgo },
      status: { not: "AutoRejected" },
      withinBudget: true,
    },
    orderBy: { score: "desc" },
    take: 5,
  });

  // If no within-budget listings, show top from any budget
  const showListings = topListings.length > 0
    ? topListings
    : await prisma.listing.findMany({
        where: {
          createdAt: { gte: twentyFourHoursAgo },
          status: { not: "AutoRejected" },
        },
        orderBy: { score: "desc" },
        take: 5,
      });

  // Source health
  const sourceHealth = await prisma.sourceHealth.findMany();

  let digest = `ASSET RADAR - Daily Digest\n`;
  digest += `${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}\n\n`;
  digest += `Scanned: ${totalScanned} listings\n`;
  digest += `New: ${totalNew}\n`;
  digest += `Auto-Rejected: ${totalRejected}\n`;
  digest += `Passed Filter: ${totalNew - totalRejected}\n\n`;

  if (showListings.length === 0) {
    digest += `No promising deals found today.\n`;
  } else {
    digest += `TOP OPPORTUNITIES\n\n`;

    for (let i = 0; i < showListings.length; i++) {
      const l = showListings[i];
      const paybackMonths =
        l.monthlyProfit && l.monthlyProfit > 0 && l.askingPrice
          ? Math.round(l.askingPrice / l.monthlyProfit)
          : null;

      const breakdown = l.scoreBreakdown as Record<string, unknown> | null;
      const verdict = breakdown && typeof breakdown === "object" ? "" : "";

      digest += `${i + 1}. ${l.name}\n`;
      digest += `   Score: ${l.score}/100${l.withinBudget ? " [IN BUDGET]" : ""}\n`;
      digest += `   Price: ${l.askingPrice ? "$" + l.askingPrice.toLocaleString() : "N/A"}\n`;
      digest += `   Monthly Profit: ${l.monthlyProfit ? "$" + l.monthlyProfit.toLocaleString() : "N/A"}\n`;
      digest += `   Payback: ${paybackMonths ? paybackMonths + " months" : "N/A"}\n`;
      digest += `   Source: ${l.source}\n`;
      digest += `   ${l.url}\n\n`;
    }
  }

  // Source health summary
  digest += `SOURCE HEALTH\n`;
  for (const sh of sourceHealth) {
    const status = sh.isPaused
      ? "PAUSED"
      : sh.consecutiveFails > 0
        ? `FAILING (${sh.consecutiveFails}x)`
        : "OK";
    digest += `  ${sh.source}: ${status}\n`;
  }

  return digest;
}
