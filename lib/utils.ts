import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getToday(timezone?: string): string {
  const now = new Date();
  if (timezone) {
    return now.toLocaleDateString("en-CA", { timeZone: timezone });
  }
  return formatDate(now);
}
