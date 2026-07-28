"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const goals = [
  { value: "lose", label: "减重", icon: "📉", desc: "控制热量摄入，逐步减重" },
  { value: "maintain", label: "保持", icon: "⚖️", desc: "维持当前体重，均衡饮食" },
  { value: "gain", label: "增重", icon: "📈", desc: "增加热量摄入，健康增重" },
];

const goalLabels: Record<string, string> = {
  lose: "减重",
  maintain: "保持",
  gain: "增重",
};

interface Props {
  currentGoal: string;
  showOnboarding: boolean;
}

export function GoalSelector({ currentGoal, showOnboarding }: Props) {
  const [goal, setGoal] = useState(currentGoal);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (showOnboarding) {
      setDialogOpen(true);
    }
  }, [showOnboarding]);

  async function handleChange(value: string) {
    if (saving) return;
    setSaving(true);
    setGoal(value);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal: value }),
    });
    setSaving(false);
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border bg-muted/50 hover:bg-muted transition-colors"
      >
        <span className="text-muted-foreground">目标：</span>
        <span className="font-medium">{goalLabels[goal] || "保持"}</span>
        <span className="text-xs text-muted-foreground ml-0.5">▾</span>
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>选择你的目标</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {goals.map((g) => {
              const isActive = goal === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  disabled={saving}
                  onClick={() => handleChange(g.value)}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left ${
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-transparent bg-white hover:bg-muted/50"
                  }`}
                >
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <div className="font-semibold text-base">
                      {g.label}
                      {isActive && (
                        <span className="ml-2 text-xs text-primary font-normal">
                          当前
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {g.desc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
