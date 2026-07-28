"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const goals = [
  { value: "lose", label: "减重", icon: "📉", desc: "控制热量" },
  { value: "maintain", label: "保持", icon: "⚖️", desc: "维持现状" },
  { value: "gain", label: "增重", icon: "📈", desc: "增加摄入" },
];

interface Props {
  currentGoal: string;
}

export function GoalSelector({ currentGoal }: Props) {
  const [goal, setGoal] = useState(currentGoal);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(value: string) {
    if (value === goal || saving) return;
    setSaving(true);
    setGoal(value);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: value }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {goals.map((g) => {
        const isActive = goal === g.value;
        return (
          <button
            key={g.value}
            type="button"
            disabled={saving}
            onClick={() => handleChange(g.value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              isActive
                ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span className="text-xl">{g.icon}</span>
            <span className="text-sm font-medium">{g.label}</span>
            <span className="text-[10px] opacity-60">{g.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
