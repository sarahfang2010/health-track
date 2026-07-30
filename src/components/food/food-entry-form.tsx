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
  const [estimating, setEstimating] = useState(false);
  const [gramError, setGramError] = useState("");
  const [foodError, setFoodError] = useState("");
  const [aiResult, setAiResult] = useState<{calories:number;protein:number;fat:number;carbs:number;fiber:number;sugar:number} | null>(null);

  useEffect(() => {
    if (prefilled) {
      setFoodName(prefilled.name);
      setAiResult(null);
    }
  }, [prefilled]);

  useEffect(() => {
    if (editEntry) {
      setFoodName(editEntry.foodName);
      setMealType(editEntry.mealType);
      const match = editEntry.portion?.match(/(\d+)/);
      setGrams(match ? match[1] : "");
      setAiResult(null);
    }
  }, [editEntry]);

  const isEditing = !!editEntry;
  const per100 = prefilled;
  const gramNum = Number(grams) || 0;
  const factor = gramNum / 100;

  // Auto-estimate when both food name and grams are filled
  async function autoEstimate() {
    if (!per100 && foodName.trim() && gramNum > 0 && !aiResult && !estimating) {
      setEstimating(true);
      setFoodError("");
      try {
        const res = await fetch("/api/food/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foodName: foodName.trim(), grams: gramNum }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiResult(data);
          return { ok: true };
        } else if (res.status === 400) {
          setFoodError("请输入合理食物");
          return { ok: false, error: "food" };
        }
      } catch {}
      setEstimating(false);
    }
    return { ok: true };
  }

  async function handleSave() {
    setGramError("");
    setFoodError("");

    // Validate grams
    const gNum = Number(grams) || 0;
    if (gNum > 11500) {
      setGramError("请输入合理数字");
      return;
    }

    // For manual entry without photo: require AI estimation first
    if (!per100 && !isEditing && !aiResult && foodName.trim() && gNum > 0) {
      const estResult = await autoEstimate();
      if (estResult && estResult.ok === false) return;
    }

    if (foodError) return;

    setSaving(true);

    let nutrition = aiResult;
    if (!per100 && foodName && gramNum > 0) {
      setEstimating(true);
      try {
        const res = await fetch("/api/food/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foodName, grams: gramNum }),
        });
        if (res.ok) {
          nutrition = await res.json();
          setAiResult(nutrition);
        }
      } catch {}
      setEstimating(false);
    }

    const method = isEditing ? "PUT" : "POST";
    const body: Record<string, unknown> = {
      foodName,
      mealType,
      portion: `${gramNum}g`,
      calories: nutrition ? nutrition.calories : (per100 ? per100.calories * factor : (editEntry?.calories || 0)),
      protein: nutrition ? nutrition.protein : (per100 ? per100.protein * factor : (editEntry?.protein || 0)),
      fat: nutrition ? nutrition.fat : (per100 ? per100.fat * factor : (editEntry?.fat || 0)),
      carbs: nutrition ? nutrition.carbs : (per100 ? per100.carbs * factor : (editEntry?.carbs || 0)),
      fiber: nutrition ? nutrition.fiber : (per100 ? per100.fiber * factor : (editEntry?.fiber ?? 0)),
      sugar: nutrition ? nutrition.sugar : (per100 ? per100.sugar * factor : (editEntry?.sugar ?? 0)),
      source: per100 ? "photo" : "manual",
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

  const photoCals = per100 ? Math.round(per100.calories * factor) : 0;
  const displayCals = aiResult?.calories || photoCals || (editEntry?.calories || 0);

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        {isEditing ? "✏️ 编辑饮食" : prefilled ? "📷 已识别食物" : "✏️ 手动录入"}
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <Label>食物名称</Label>
            <Input value={foodName} onChange={(e) => { setFoodName(e.target.value); setFoodError(""); }} />
            {foodError && <p className="text-xs text-red-500 mt-0.5">{foodError}</p>}
          </div>
          <div className="space-y-1">
            <Label>份量 (克)</Label>
            <Input
              type="number"
              value={grams}
              onChange={(e) => { setGrams(e.target.value); setGramError(""); }}
              onBlur={autoEstimate}
              placeholder="请输入克数"
              max={11500}
            />
            {gramError && <p className="text-xs text-red-500 mt-0.5">{gramError}</p>}
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
        </div>

        {displayCals > 0 && (
          <div className="flex flex-col items-center min-w-[70px] pb-1">
            <span className="text-2xl font-bold">{displayCals}</span>
            <span className="text-xs text-muted-foreground">kcal</span>
            {estimating && (
              <span className="text-[10px] text-muted-foreground mt-1">🤖 估算中</span>
            )}
          </div>
        )}
      </div>

      {aiResult && (
        <div className="grid grid-cols-4 gap-2 text-[11px] text-muted-foreground bg-muted/30 rounded-lg p-2.5">
          <div>蛋白 <span className="font-medium text-foreground">{aiResult.protein}</span>g</div>
          <div>脂肪 <span className="font-medium text-foreground">{aiResult.fat}</span>g</div>
          <div>碳水 <span className="font-medium text-foreground">{aiResult.carbs}</span>g</div>
          <div>纤维 <span className="font-medium text-foreground">{aiResult.fiber}</span>g</div>
        </div>
      )}

      {!per100 && !isEditing && !aiResult && foodName && gramNum > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          点击保存，AI 将自动估算营养成分
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            取消
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving || estimating || !foodName} className="flex-1">
          {estimating ? "🤖 AI 估算中..." : saving ? "保存中..." : isEditing ? "更新记录" : "保存记录"}
        </Button>
      </div>
    </div>
  );
}
