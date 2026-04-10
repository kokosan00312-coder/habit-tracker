import { NextResponse } from "next/server";

export async function GET() {
  const results: Record<string, unknown> = {};

  // Check env vars
  results.hasDbUrl = !!process.env.DATABASE_URL;
  results.dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 30) + "...";
  results.hasAuthSecret = !!process.env.AUTH_SECRET;
  results.nodeEnv = process.env.NODE_ENV;

  // Test Prisma connection
  try {
    const { prisma } = await import("@/lib/prisma");
    const count = await prisma.user.count();
    results.dbConnected = true;
    results.userCount = count;
  } catch (error: unknown) {
    const err = error as Error & { code?: string; meta?: unknown };
    results.dbConnected = false;
    results.dbError = err.message;
    results.dbErrorCode = err.code;
    results.dbErrorName = err.constructor?.name;
    results.dbErrorMeta = err.meta;
  }

  return NextResponse.json(results);
}
