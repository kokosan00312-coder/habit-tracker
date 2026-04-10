import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        notification: {
          create: {
            reminderEnabled: false,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "アカウントが作成されました", userId: user.id },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error & { code?: string; meta?: unknown };
    console.error("Register error:", err.message);
    console.error("Register error code:", err.code);
    console.error("Register error meta:", JSON.stringify(err.meta));
    console.error("Register error stack:", err.stack);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました", detail: err.message },
      { status: 500 }
    );
  }
}
