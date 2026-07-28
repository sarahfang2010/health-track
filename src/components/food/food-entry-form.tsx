"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Candidate } from "@/services/foodRecognition";
import { FoodEntry } from "./food-list";

interface Props {
  prefilled?: Candidate;
  editEntry?: FoodEntry | null;
  onSaved: () => void;
  onCancel?: () => void;
}

export function FoodEntryForm({ prefilled, editEntry, onSaved, onCancel }: Props) {
  const [foodName, setFoodName] = useState(editEntry?.foodName || "");
  const [grams, setGrams] = useState("");
  const [mealType, setMealType] = useState(editEntry?.mealType || "lunch");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefilled) {
      setFoodName(prefilled.name);
    }
  }, [prefilled]);

  useEffect(() => {
    if (editEntry) {
      setFoodName(editEntry.foodName);
      setMealType(editEntry.mealType);
      // Try to extract grams from portion string like "200g"
      const match = editEntry.portion?.match(/(\d+)/);
      setGrams(match ? match[1] : "");
    }
  }, [editEntry]);

  const isEditing = !!editEntry;
  const per100 = prefilled;
  const gramNum = Number(grams) || 0;
  const factor = gramNum / 100;

  async function handleSave() {
    setSaving(true);
    const method = isEditing ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      foodName,
      mealType,
      portion: `${gramNum}g`,
      calories: per100 ? per100.calories * factor : (editEntry?.calories || 0),
      protein: per100 ? per100.protein * factor : (editEntry?.protein || 0),
      fat: per100 ? per100.fat * factor : (editEntry?.fat || 0),
      carbs: per100 ? per100.carbs * factor : (editEntry?.carbs || 0),
      fiber: per100 ? per100.fiber * factor : (editEntry?.fiber ?? 0),
      sugar: per100 ? per100.sugar * factor : (editEntry?.sugar ?? 0),
      source: per100 ? "photo" : (editEntry?.source || "manual"),
    };
    if (isEditing) body.id = editEntry!.id;

    await fetch("/api/food", {
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
        {isEditing ? "✏️ 编辑饮食" : prefilled ? "📷 已识别食物" : "✏️ 手动录入"}
      </div>
      <div className="space-y-1">
        <Label>食物名称</Label>
        <Input value={foodName} onChange={(e) => setFoodName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>份量 (克)</Label>
        <Input
          type="number"
          value={grams}
          onChange={(e) => setGrams(e.target.value)}
          placeholder="请输入克数"
        />
      </div>
      <div className="space-y-1">
        <Label>餐别</Label>
        <select
          className="w-full border rounded-md p-2 text-sm"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="breakfast">早餐</option>
          <option value="lunch">午餐</option>
          <option value="dinner">晚餐</option>
          <option value="snack">加餐/零食</option>
        </select>
      </div>
      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving || !foodName} className="flex-1">
          {saving ? "保存中..." : isEditing ? "更新记录" : "保存记录"}
        </Button>
      </div>
    </div>
  );
}
