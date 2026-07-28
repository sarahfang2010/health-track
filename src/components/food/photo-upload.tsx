"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Candidate } from "@/services/foodRecognition";

interface Props {
  onConfirm: (candidate: Candidate) => void;
}

export function PhotoUpload({ onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
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
    setLoading(false);
    setOpen(true);
  }

  function handleSelect(c: Candidate) {
    onConfirm(c);
    setOpen(false);
    setCandidates([]);
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>选择最接近的食物</DialogTitle>
          </DialogHeader>
          {preview && (
            <img
              src={preview}
              alt="food"
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          <div className="space-y-2 max-h-60 overflow-auto">
            {candidates.map((c) => (
              <button
                key={c.id}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                onClick={() => handleSelect(c)}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">
                  {c.category} · {c.calories} kcal/100g
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
