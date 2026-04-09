"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import HabitCard from "@/components/habits/HabitCard";
import { useRouter } from "next/navigation";
import type { HabitWithCheckIn } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [habits, setHabits] = useState<HabitWithCheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    if (res.ok) {
      setHabits(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  function handleToggle(habitId: string, checked: boolean) {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, isCheckedInToday: checked } : h))
    );
  }

  const completedToday = habits.filter((h) => h.isCheckedInToday).length;
  const totalHabits = habits.length;
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        こんにちは、{session?.user?.name || "ユーザー"}さん
      </h1>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <p className="text-3xl font-bold text-indigo-600">{completedToday}</p>
          <p className="text-sm text-gray-500 mt-1">今日完了</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-purple-600">{totalHabits}</p>
          <p className="text-sm text-gray-500 mt-1">習慣数</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
          <p className="text-sm text-gray-500 mt-1">達成率</p>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">今日の習慣</h2>
        {habits.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500">
              まだ習慣が登録されていません。
              <button
                onClick={() => router.push("/habits")}
                className="text-indigo-600 hover:underline ml-1"
              >
                習慣を追加
              </button>
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                {...habit}
                onToggle={handleToggle}
                onEdit={(id) => router.push(`/habits/${id}`)}
                onDelete={async (id) => {
                  if (!confirm("削除しますか？")) return;
                  const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
                  if (res.ok) fetchHabits();
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
