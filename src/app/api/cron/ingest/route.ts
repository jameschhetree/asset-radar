import { NextResponse } from "next/server";
import { runIngestion } from "@/lib/ingest";
import { sendTelegramMessage } from "@/lib/telegram";

export async function GET() {
  try {
    const results = await runIngestion();

    // Send real-time alerts for high-score listings
    for (const result of results) {
      for (const alert of result.highScoreAlerts) {
        sendTelegramMessage(
          `ASSET RADAR HIGH SCORE ALERT\n\n${alert.name} scored ${alert.score}/100\n${alert.url}\n\nReview immediately.`
        );
      }
    }

    return NextResponse.json({
      success: true,
      results,
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
