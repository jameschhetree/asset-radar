import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const sort = searchParams.get("sort") || "score";
  const order = searchParams.get("order") || "desc";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }

  const listings = await prisma.listing.findMany({
    where,
    orderBy: { [sort]: order },
    take: limit,
    skip: offset,
  });

  const total = await prisma.listing.count({ where });

  return NextResponse.json({ listings, total });
}
