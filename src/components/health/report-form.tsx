"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  { name: "bloodSugar", label: "空腹血糖 (mmol/L)", placeholder: "如: 5.6" },
  { name: "bloodPressureSystolic", label: "收缩压 (mmHg)", placeholder: "如: 120" },
  { name: "bloodPressureDiastolic", label: "舒张压 (mmHg)", placeholder: "如: 80" },
  { name: "totalCholesterol", label: "总胆固醇 (mmol/L)", placeholder: "如: 4.5" },
  { name: "hdl", label: "HDL 高密度脂蛋白 (mmol/L)", placeholder: "如: 1.2" },
  { name: "ldl", label: "LDL 低密度脂蛋白 (mmol/L)", placeholder: "如: 2.6" },
  { name: "triglycerides", label: "甘油三酯 (mmol/L)", placeholder: "如: 1.5" },
  { name: "uricAcid", label: "尿酸 (μmol/L)", placeholder: "如: 350" },
];

export function ReportForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      const val = formData.get(f.name) as string;
      if (val) data[f.name] = parseFloat(val);
    });
    const notes = formData.get("notes") as string;
    if (notes) data.notes = notes;
    data.reportDate = formData.get("reportDate") as string;

    await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.push("/health");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>报告日期</Label>
        <Input
          name="reportDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      {fields.map((f) => (
        <div key={f.name} className="space-y-1">
          <Label>{f.label}</Label>
          <Input name={f.name} type="number" step="0.1" placeholder={f.placeholder} />
        </div>
      ))}
      <div className="space-y-1">
        <Label>备注</Label>
        <Input name="notes" placeholder="其他说明（可选）" />
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "保存中..." : "保存体检报告"}
      </Button>
    </form>
  );
}
