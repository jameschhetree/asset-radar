import { NextResponse } from "next/server";
import { buildDigest } from "@/lib/digest";
import { prisma } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  try {
    const digest = await buildDigest();

    // Archive the digest
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const listingCount = await prisma.listing.count({
      where: { createdAt: { gte: twentyFourHoursAgo } },
    });

    await prisma.digestArchive.create({
      data: {
        content: digest,
        listings: listingCount,
      },
    });

    // Send to Telegram (only works locally)
    sendTelegramMessage(digest);

    return NextResponse.json({
      success: true,
      digest,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
