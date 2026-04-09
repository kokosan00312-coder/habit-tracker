"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        await update({ name });
        setMessage("プロフィールを更新しました");
      } else {
        setMessage("更新に失敗しました");
      }
    } catch {
      setMessage("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前を入力"
          />

          <Input
            id="email"
            label="メールアドレス"
            value={session?.user?.email ?? ""}
            disabled
          />

          {message && (
            <p className="text-sm text-green-600">{message}</p>
          )}

          <Button type="submit" loading={loading}>
            更新
          </Button>
        </form>
      </Card>
    </div>
  );
}
