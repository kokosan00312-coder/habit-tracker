"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import HabitForm from "@/components/habits/HabitForm";

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [habit, setHabit] = useState<{
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHabit() {
      const res = await fetch(`/api/habits/${id}`);
      if (res.ok) {
        setHabit(await res.json());
      }
      setLoading(false);
    }
    fetchHabit();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!habit) {
    return <p className="text-center text-gray-500 py-12">習慣が見つかりません</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <HabitForm
        initialData={habit}
        onSuccess={() => router.push("/habits")}
        onCancel={() => router.back()}
      />
    </div>
  );
}
