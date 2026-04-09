export type SubscriptionStatus = "free" | "active" | "canceled" | "past_due";

export interface HabitWithCheckIn {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  archived: boolean;
  createdAt: Date;
  isCheckedInToday: boolean;
}

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  completionRate: number;
}
