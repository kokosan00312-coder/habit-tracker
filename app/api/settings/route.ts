import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod/v4";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.notificationSetting.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({
    reminderEnabled: settings?.reminderEnabled ?? false,
    reminderTime: settings?.reminderTime ?? null,
  });
}

const updateSettingsSchema = z.object({
  reminderEnabled: z.boolean(),
});

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  await prisma.notificationSetting.upsert({
    where: { userId: session.user.id },
    update: { reminderEnabled: parsed.data.reminderEnabled },
    create: {
      userId: session.user.id,
      reminderEnabled: parsed.data.reminderEnabled,
    },
  });

  return NextResponse.json({ message: "Updated" });
}
