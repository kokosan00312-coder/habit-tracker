"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#06b6d4",
];

const ICONS = ["📚", "🏃", "💧", "🧘", "✍️", "🎯", "💪", "🌙"];

interface HabitFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string | null;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function HabitForm({ initialData, onSuccess, onCancel }: HabitFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [color, setColor] = useState(initialData?.color ?? "#6366f1");
  const [icon, setIcon] = useState(initialData?.icon ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isEditing = !!initialData;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const url = isEditing ? `/api/habits/${initialData.id}` : "/api/habits";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, color, icon: icon || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      onSuccess();
    } catch {
      setError("エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isEditing ? "習慣を編集" : "新しい習慣を追加"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <Input
          id="habit-name"
          label="習慣名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 毎日読書する"
          maxLength={50}
          required
        />

        <Input
          id="habit-desc"
          label="説明（任意）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="例: 1日30分以上読書する"
          maxLength={200}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">カラー</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#1f2937" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">アイコン（任意）</label>
          <div className="flex gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(icon === i ? "" : i)}
                className={`h-10 w-10 rounded-lg border-2 text-lg transition-colors ${
                  icon === i ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={loading}>
            {isEditing ? "更新" : "追加"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  );
}
