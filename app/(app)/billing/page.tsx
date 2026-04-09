"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BillingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const isPro = session?.user?.subscriptionStatus === "active";

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">プラン</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={!isPro ? "ring-2 ring-indigo-600" : ""}>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Free</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ¥0<span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>習慣3つまで</li>
              <li>デイリーチェックイン</li>
              <li>基本ダッシュボード</li>
            </ul>
            {!isPro && (
              <div className="mt-6">
                <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
                  現在のプラン
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className={isPro ? "ring-2 ring-indigo-600" : ""}>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">Pro</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              $4.99<span className="text-sm font-normal text-gray-500">/月</span>
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-600">
              <li>習慣 無制限</li>
              <li>デイリーチェックイン</li>
              <li>詳細な統計グラフ</li>
              <li>連続日数トラッキング</li>
            </ul>
            <div className="mt-6">
              {isPro ? (
                <span className="inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
                  現在のプラン
                </span>
              ) : (
                <Button onClick={handleUpgrade} loading={loading} className="w-full">
                  アップグレード
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>

      <p className="text-xs text-gray-400 text-center">
        ※ テストモードのため、実際の課金は発生しません
      </p>
    </div>
  );
}
