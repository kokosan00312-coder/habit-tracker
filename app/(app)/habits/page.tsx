"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HabitCard from "@/components/habits/HabitCard";
import HabitForm from "@/components/habits/HabitForm";
import Button from "@/components/ui/Button";
import type { HabitWithCheckIn } from "@/types";

export default function HabitsPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<HabitWithCheckIn[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHabits = useCallback(async () => {
    const res = await fetch("/api/habits");
    if (res.ok) {
      const data = await res.json();
      setHabits(data);
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

  async function handleDelete(habitId: string) {
    if (!confirm("この習慣を削除しますか？")) return;
    const res = await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
    if (res.ok) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">習慣一覧</h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            + 新しい習慣
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <HabitForm
            onSuccess={() => {
              setShowForm(false);
              fetchHabits();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">まだ習慣が登録されていません</p>
          <p className="text-sm text-gray-400 mt-1">上の「新しい習慣」ボタンから追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              {...habit}
              onToggle={handleToggle}
              onEdit={(id) => router.push(`/habits/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
