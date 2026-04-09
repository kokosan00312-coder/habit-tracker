import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkInSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkInSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { habitId, date } = parsed.data;

  // Verify the habit belongs to this user
  const habit = await prisma.habit.findUnique({ where: { id: habitId } });
  if (!habit || habit.userId !== session.user.id) {
    return NextResponse.json({ error: "習慣が見つかりません" }, { status: 404 });
  }

  const checkInDate = new Date(date + "T00:00:00Z");

  // Toggle: if check-in exists, delete it; otherwise create it
  const existing = await prisma.checkIn.findUnique({
    where: { habitId_date: { habitId, date: checkInDate } },
  });

  if (existing) {
    await prisma.checkIn.delete({ where: { id: existing.id } });
    return NextResponse.json({ checked: false });
  }

  await prisma.checkIn.create({
    data: {
      habitId,
      date: checkInDate,
      completed: true,
    },
  });

  return NextResponse.json({ checked: true }, { status: 201 });
}
