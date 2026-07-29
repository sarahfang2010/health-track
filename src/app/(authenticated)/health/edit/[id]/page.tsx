"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const fields = [
  { name: "bloodSugar", label: "空腹血糖 (mmol/L)" },
  { name: "bloodPressureSystolic", label: "收缩压 (mmHg)" },
  { name: "bloodPressureDiastolic", label: "舒张压 (mmHg)" },
  { name: "totalCholesterol", label: "总胆固醇 (mmol/L)" },
  { name: "hdl", label: "HDL 高密度脂蛋白 (mmol/L)" },
  { name: "ldl", label: "LDL 低密度脂蛋白 (mmol/L)" },
  { name: "triglycerides", label: "甘油三酯 (mmol/L)" },
  { name: "uricAcid", label: "尿酸 (μmol/L)" },
];

const MAX_IMAGES = 5;

export default function EditHealthPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reportDate, setReportDate] = useState("");
  const [notes, setNotes] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch(`/api/health`)
      .then((r) => r.json())
      .then((reports) => {
        const report = reports.find((r: { id: string }) => r.id === id);
        if (report) {
          setReportDate(report.reportDate?.split("T")[0] || "");
          setNotes(report.notes || "");
          if (report.reportImageUrl) {
            setExistingImages(report.reportImageUrl.split(","));
          }
          // Pre-fill form fields
          fields.forEach((f) => {
            const input = formRef.current?.querySelector(`[name="${f.name}"]`) as HTMLInputElement;
            if (input && report[f.name as keyof typeof report] != null) {
              input.value = String(report[f.name as keyof typeof report]);
            }
          });
        }
        setLoading(false);
      });
  }, [id]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const total = existingImages.length + files.length;
    if (total > MAX_IMAGES) {
      alert(`最多 ${MAX_IMAGES} 张图片，当前已有 ${existingImages.length} 张`);
      return;
    }
    setNewFiles(files);
    setNewPreviews(files.map((f) => URL.createObjectURL(f)));
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
    data.notes = notes;
    data.reportDate = reportDate;
    data.id = id;

    // Upload new images
    const imageUrls: string[] = [];
    for (const file of newFiles) {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { imageUrl } = await res.json();
        imageUrls.push(imageUrl);
      }
    }

    // If replacing images: use new ones; otherwise keep existing
    if (imageUrls.length > 0) {
      data.reportImageUrl = imageUrls.join(",");
    } else {
      data.reportImageUrl = existingImages.join(",") || null;
    }

    await fetch("/api/health", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.push("/health");
    router.refresh();
  }

  if (loading) return <p className="text-muted-foreground text-center py-8">加载中...</p>;

  return (
    <>
      <div className="mb-4">
        <Link href="/health" className="text-sm text-primary">← 返回</Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">编辑报告</h1>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label>报告日期</Label>
          <Input name="reportDate" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
        </div>

        {existingImages.length > 0 && (
          <div className="space-y-1">
            <Label>已有图片</Label>
            <div className="flex gap-2 overflow-x-auto">
              {existingImages.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <Label>替换图片（最多 {MAX_IMAGES} 张）</Label>
          <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary" />
          {newPreviews.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {newPreviews.map((url, i) => (
                <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
              ))}
            </div>
          )}
        </div>

        {fields.map((f) => (
          <div key={f.name} className="space-y-1">
            <Label>{f.label}</Label>
            <Input name={f.name} type="number" step="0.1" />
          </div>
        ))}

        <div className="space-y-1">
          <Label>备注</Label>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "保存中..." : "更新报告"}
        </Button>
      </form>
    </>
  );
}
