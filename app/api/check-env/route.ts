import { NextResponse } from "next/server";

export async function GET() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  return NextResponse.json({
    secretPrefix: secret.substring(0, 10) + "...",
    secretLength: secret.length,
  });
}
