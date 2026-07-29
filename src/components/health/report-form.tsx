"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAX_IMAGES = 5;

export function ReportForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length > MAX_IMAGES) {
      alert(`最多上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    setSelectedFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    data.reportDate = formData.get("reportDate") as string;

    // Upload all selected images
    const imageUrls: string[] = [];
    for (const file of selectedFiles) {
      const uploadForm = new FormData();
      uploadForm.append("image", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      if (uploadRes.ok) {
        const { imageUrl } = await uploadRes.json();
        imageUrls.push(imageUrl);
      }
    }
    if (imageUrls.length > 0) {
      data.reportImageUrl = imageUrls.join(",");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>报告日期</Label>
        <Input
          name="reportDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div className="space-y-1">
        <Label>
          📷 体检报告图片
          <span className="text-xs text-muted-foreground ml-1">
            （最多 {MAX_IMAGES} 张，已选 {selectedFiles.length} 张）
          </span>
        </Label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
        />
        {previews.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto">
            {previews.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`报告 ${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
              />
            ))}
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          保存后，可在健康档案页使用 AI 自动分析报告图片中的指标
        </p>
      )}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "保存中..." : "保存体检报告"}
      </Button>
    </form>
  );
}
