"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const activities = [
  { value: "walking", label: "🚶 步行" },
  { value: "running", label: "🏃 跑步" },
  { value: "cycling", label: "🚴 骑行" },
  { value: "swimming", label: "🏊 游泳" },
  { value: "strength", label: "🏋️ 力量训练" },
  { value: "yoga", label: "🧘 瑜伽" },
  { value: "hiit", label: "🔥 HIIT" },
  { value: "other", label: "💪 其他" },
];

interface Props {
  onSaved: () => void;
}

export function ExerciseForm({ onSaved }: Props) {
  const [activityType, setActivityType] = useState("walking");
  const [duration, setDuration] = useState(30);
  const [steps, setSteps] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType,
        durationMinutes: duration,
        steps: steps || null,
        notes: notes || null,
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        ✏️ 记录运动
      </div>
      <div className="space-y-1">
        <Label>运动类型</Label>
        <div className="grid grid-cols-4 gap-2">
          {activities.map((a) => (
            <button
              key={a.value}
              type="button"
              className={`p-2 rounded-lg border text-xs text-center transition-colors ${
                activityType === a.value
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActivityType(a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <Label>时长 (分钟)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label>步数（可选）</Label>
        <Input
          type="number"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="如: 5000"
        />
      </div>
      <div className="space-y-1">
        <Label>备注（可选）</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="如: 户外慢跑"
        />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "保存中..." : "保存记录"}
      </Button>
    </div>
  );
}
