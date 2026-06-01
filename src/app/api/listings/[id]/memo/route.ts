import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDealMemo } from "@/lib/deal-memo";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
  });

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const memo = await generateDealMemo({
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
      score: listing.score,
      scoreBreakdown: listing.scoreBreakdown as Record<string, number> | null,
    });

    await prisma.listing.update({
      where: { id },
      data: { dealMemo: memo },
    });

    return NextResponse.json({ success: true, memo });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
