import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sources = await prisma.sourceHealth.findMany({
    orderBy: { source: "asc" },
  });

  return NextResponse.json({ sources });
}
