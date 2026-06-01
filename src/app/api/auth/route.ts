import { NextRequest, NextResponse } from "next/server";
import { validateCredentials } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (validateCredentials(username, password)) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 }
  );
}
