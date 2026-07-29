"use client";

import { useState, useRef } from "react";
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
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));

    // AI OCR scan
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/ai/ocr-report", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data.values) {
          const newValues: Record<string, string> = {};
          for (const [key, val] of Object.entries(data.values)) {
            if (val !== null && val !== undefined) {
              newValues[key] = String(val);
            }
          }
          setValues(newValues);
        }
      }
    } catch {}
    setScanning(false);
  }

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

    const file = fileRef.current?.files?.[0];
    if (file) {
      const uploadForm = new FormData();
      uploadForm.append("image", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      if (uploadRes.ok) {
        const { imageUrl } = await uploadRes.json();
        data.reportImageUrl = imageUrl;
      }
    }

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
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>报告日期</Label>
        <Input
          name="reportDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div className="space-y-1">
        <Label>📷 拍摄体检报告</Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        {scanning && (
          <p className="text-xs text-muted-foreground mt-1">🤖 AI 正在识别报告中的指标...</p>
        )}
        {preview && (
          <img
            src={preview}
            alt="报告预览"
            className="mt-2 w-full h-40 object-cover rounded-lg border"
          />
        )}
      </div>

      {fields.map((f) => (
        <div key={f.name} className="space-y-1">
          <Label>
            {f.label}
            {values[f.name] && (
              <span className="text-green-600 text-xs ml-2">✓ AI 已识别</span>
            )}
          </Label>
          <Input
            name={f.name}
            type="number"
            step="0.1"
            defaultValue={values[f.name] || ""}
            placeholder={f.placeholder}
            className={values[f.name] ? "border-green-300 bg-green-50/30" : ""}
          />
        </div>
      ))}
      <div className="space-y-1">
        <Label>备注</Label>
        <Input name="notes" placeholder="其他说明（可选）" />
      </div>
      <Button type="submit" className="w-full" disabled={saving || scanning}>
        {saving ? "保存中..." : "保存体检报告"}
      </Button>
    </form>
  );
}
