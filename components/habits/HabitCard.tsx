"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  isCheckedInToday: boolean;
  onToggle: (habitId: string, checked: boolean) => void;
  onEdit: (habitId: string) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({
  id,
  name,
  description,
  color,
  icon,
  isCheckedInToday,
  onToggle,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [checked, setChecked] = useState(isCheckedInToday);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const newState = !checked;
    setChecked(newState);

    try {
      const today = new Date().toLocaleDateString("en-CA");
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId: id, date: today }),
      });

      if (!res.ok) {
        setChecked(!newState);
      } else {
        onToggle(id, newState);
      }
    } catch {
      setChecked(!newState);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          checked
            ? "border-transparent text-white"
            : "border-gray-300 bg-white hover:border-gray-400"
        )}
        style={checked ? { backgroundColor: color } : {}}
      >
        {checked && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <h3 className={cn("font-medium", checked ? "text-gray-400 line-through" : "text-gray-900")}>
            {name}
          </h3>
        </div>
        {description && (
          <p className="mt-0.5 text-sm text-gray-500 truncate">{description}</p>
        )}
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => onEdit(id)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(id)}
          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  );
}
