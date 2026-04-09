"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import AchievementGraph from "@/components/dashboard/AchievementGraph";

interface StatsData {
  date: string;
  rate: number;
}

export default function StatsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);

  const isPro = session?.user?.subscriptionStatus === "active";

  useEffect(() => {
    async function fetchStats() {
      if (!isPro) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/habits/stats?days=14");
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data: StatsData[] = await res.json();
      setStats(data);
      setLoading(false);
    }
    fetchStats();
  }, [isPro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Pro機能</h2>
          <p className="mt-2 text-gray-500">
            詳細な統計グラフはProプランで利用できます
          </p>
          <Button className="mt-6" onClick={() => router.push("/billing")}>
            Proにアップグレード
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">統計</h1>
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">過去14日間の達成率</h2>
        {stats.length > 0 ? (
          <AchievementGraph data={stats} />
        ) : (
          <p className="text-center text-gray-500 py-8">データがありません</p>
        )}
      </Card>
    </div>
  );
}
