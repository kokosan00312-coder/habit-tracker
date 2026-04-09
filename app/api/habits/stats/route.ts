import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  if (session.user.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "Pro機能です" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(parseInt(searchParams.get("days") || "14"), 90);

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archived: false },
    select: { id: true },
  });

  if (habits.length === 0) {
    return NextResponse.json([]);
  }

  const habitIds = habits.map((h) => h.id);
  const totalHabits = habits.length;

  // Get check-ins for the last N days
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  const checkIns = await prisma.checkIn.findMany({
    where: {
      habitId: { in: habitIds },
      date: { gte: startDate },
      completed: true,
    },
    select: { date: true },
  });

  // Count completions per day
  const countByDate = new Map<string, number>();
  for (const ci of checkIns) {
    const key = ci.date.toISOString().split("T")[0];
    countByDate.set(key, (countByDate.get(key) || 0) + 1);
  }

  // Build result array
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().split("T")[0];
    const completed = countByDate.get(key) || 0;
    const date = new Date(key + "T00:00:00Z");
    result.push({
      date: date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" }),
      rate: Math.round((completed / totalHabits) * 100),
    });
  }

  return NextResponse.json(result);
}
