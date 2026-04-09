"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setReminderEnabled(data.reminderEnabled);
      }
    }
    fetchSettings();
  }, []);

  async function handleToggle() {
    setLoading(true);
    setMessage("");
    const newValue = !reminderEnabled;

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEnabled: newValue }),
      });

      if (res.ok) {
        setReminderEnabled(newValue);
        setMessage("設定を更新しました");
      }
    } catch {
      setMessage("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">設定</h1>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">リマインダー通知</h3>
            <p className="text-sm text-gray-500">毎日のチェックインを忘れないようにリマインド</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              reminderEnabled ? "bg-indigo-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                reminderEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
      </Card>

      <Card>
        <h3 className="font-medium text-gray-900">アカウント情報</h3>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>メール: {session?.user?.email}</p>
          <p>
            プラン:{" "}
            <span className="font-medium">
              {session?.user?.subscriptionStatus === "active" ? "Pro" : "Free"}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
