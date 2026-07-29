"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Candidate } from "@/services/foodRecognition";

interface Props {
  onConfirm: (candidates: Candidate[]) => void;
}

export function PhotoUpload({ onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/food/recognize", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setCandidates(data.candidates || []);
    setSelected(new Set());
    setLoading(false);
    setOpen(true);
  }

  function toggleSelect(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleConfirm() {
    const chosen = candidates.filter((c) => selected.has(c.id));
    if (chosen.length === 0) return;
    onConfirm(chosen);
    setOpen(false);
    setCandidates([]);
    setSelected(new Set());
    setPreview(null);
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <Button
        size="lg"
        className="w-full h-20 text-lg gap-2"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
      >
        📷 {loading ? "识别中..." : "拍照识别食物"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>选择食物（可多选）</DialogTitle>
          </DialogHeader>
          {preview && (
            <img
              src={preview}
              alt="food"
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          <div className="space-y-2 max-h-60 overflow-auto">
            {candidates.map((c) => {
              const isChecked = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    isChecked
                      ? "border-primary bg-primary/5"
                      : "border-muted/60 bg-white hover:border-primary/30"
                  }`}
                  onClick={() => toggleSelect(c.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs flex-shrink-0 ${
                      isChecked ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                    }`}>
                      {isChecked ? "✓" : ""}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {c.category}{c.calories === -1 ? " · 🤖 估算中..." : c.calories > 0 ? ` · ${c.calories} kcal/100g` : ""}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="w-full"
          >
            确认选择（{selected.size}项）
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
