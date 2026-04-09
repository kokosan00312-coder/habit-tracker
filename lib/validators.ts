import { z } from "zod/v4";

export const registerSchema = z.object({
  name: z.string().min(1, "名前を入力してください").max(50),
  email: z.email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上にしてください")
    .max(100),
});

export const loginSchema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export const createHabitSchema = z.object({
  name: z.string().min(1, "習慣名を入力してください").max(50).transform((s) => s.trim()),
  description: z.string().max(200).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "無効な色コードです").optional(),
  icon: z.string().max(10).optional(),
});

export const updateHabitSchema = createHabitSchema.partial();

export const checkInSchema = z.object({
  habitId: z.string().min(1),
  date: z.iso.date(),
});
