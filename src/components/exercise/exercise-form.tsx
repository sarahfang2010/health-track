"use client";

import { useState, useEffect } from "react";
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

interface ExerciseEntry {
  id: string;
  activityType: string;
  durationMinutes: number;
  caloriesBurned: number;
  steps: number | null;
  notes: string | null;
}

interface Props {
  onSaved: () => void;
  onCancel?: () => void;
  editEntry?: ExerciseEntry | null;
}

export function ExerciseForm({ onSaved, onCancel, editEntry }: Props) {
  const [activityType, setActivityType] = useState(editEntry?.activityType || "walking");
  const [duration, setDuration] = useState(editEntry?.durationMinutes || 30);
  const [steps, setSteps] = useState(editEntry?.steps?.toString() || "");
  const [notes, setNotes] = useState(editEntry?.notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setActivityType(editEntry.activityType);
      setDuration(editEntry.durationMinutes);
      setSteps(editEntry.steps?.toString() || "");
      setNotes(editEntry.notes || "");
    }
  }, [editEntry]);

  const isEditing = !!editEntry;

  async function handleSave() {
    setSaving(true);
    const method = isEditing ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      activityType,
      durationMinutes: duration,
      steps: steps || null,
      notes: notes || null,
    };
    if (isEditing) body.id = editEntry!.id;

    await fetch("/api/exercise", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        {isEditing ? "✏️ 编辑运动" : "✏️ 记录运动"}
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
                  ? "border-primary border-2 bg-primary/10 font-bold"
                  : "border hover:bg-muted"
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
      <div className={`flex gap-2 ${onCancel ? "" : ""}`}>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? "保存中..." : isEditing ? "更新记录" : "保存记录"}
        </Button>
      </div>
    </div>
  );
}
