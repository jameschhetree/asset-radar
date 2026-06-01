import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const digests = await prisma.digestArchive.findMany({
    orderBy: { sentAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ digests });
}
