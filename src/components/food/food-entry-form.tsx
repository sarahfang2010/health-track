"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Candidate } from "@/services/foodRecognition";

interface Props {
  prefilled?: Candidate;
  onSaved: () => void;
}

export function FoodEntryForm({ prefilled, onSaved }: Props) {
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState(100);
  const [mealType, setMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefilled) {
      setFoodName(prefilled.name);
    }
  }, [prefilled]);

  const per100 = prefilled;
  const factor = grams / 100;

  async function handleSave() {
    setSaving(true);
    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodName,
        mealType,
        portion: `${grams}g`,
        calories: per100 ? per100.calories * factor : 0,
        protein: per100 ? per100.protein * factor : 0,
        fat: per100 ? per100.fat * factor : 0,
        carbs: per100 ? per100.carbs * factor : 0,
        fiber: per100 ? per100.fiber * factor : 0,
        sugar: per100 ? per100.sugar * factor : 0,
        source: per100 ? "photo" : "manual",
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        {prefilled ? "📷 已识别食物" : "✏️ 手动录入"}
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
          onChange={(e) => setGrams(Number(e.target.value))}
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
      {per100 && (
        <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div>热量: {(per100.calories * factor).toFixed(0)} kcal</div>
          <div>蛋白质: {(per100.protein * factor).toFixed(1)}g</div>
          <div>脂肪: {(per100.fat * factor).toFixed(1)}g</div>
          <div>碳水: {(per100.carbs * factor).toFixed(1)}g</div>
        </div>
      )}
      <Button onClick={handleSave} disabled={saving || !foodName} className="w-full">
        {saving ? "保存中..." : "保存记录"}
      </Button>
    </div>
  );
}
