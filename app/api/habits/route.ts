import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHabitSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timezone = searchParams.get("tz") || undefined;

  const today = new Date();
  if (timezone) {
    const localDate = today.toLocaleDateString("en-CA", { timeZone: timezone });
    today.setTime(new Date(localDate + "T00:00:00Z").getTime());
  } else {
    today.setUTCHours(0, 0, 0, 0);
  }

  const habits = await prisma.habit.findMany({
    where: { userId: session.user.id, archived: false },
    include: {
      checkIns: {
        where: { date: today },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const result = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    color: habit.color,
    icon: habit.icon,
    isCheckedInToday: habit.checkIns.length > 0 && habit.checkIns[0].completed,
  }));

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createHabitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Free tier: max 3 habits
  if (session.user.subscriptionStatus !== "active") {
    const habitCount = await prisma.habit.count({
      where: { userId: session.user.id, archived: false },
    });
    if (habitCount >= 3) {
      return NextResponse.json(
        { error: "無料プランでは3つまで習慣を登録できます。Proにアップグレードしてください。" },
        { status: 403 }
      );
    }
  }

  const habit = await prisma.habit.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      color: parsed.data.color || "#6366f1",
      icon: parsed.data.icon || null,
    },
  });

  return NextResponse.json(habit, { status: 201 });
}
