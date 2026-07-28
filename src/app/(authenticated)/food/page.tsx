"use client";

import { useState, useEffect, useCallback } from "react";
import { PhotoUpload } from "@/components/food/photo-upload";
import { FoodEntryForm } from "@/components/food/food-entry-form";
import { FoodList } from "@/components/food/food-list";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/services/foodRecognition";
import Link from "next/link";

export default function FoodPage() {
  const [entries, setEntries] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | undefined>();

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/food");
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function handlePhotoConfirm(c: Candidate) {
    setCandidate(c);
    setShowManual(false);
  }

  function handleSaved() {
    setCandidate(undefined);
    setShowManual(false);
    fetchEntries();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">饮食记录</h1>
        <Link href="/food/history" className="text-sm text-primary">
          历史记录 →
        </Link>
      </div>

      <div className="space-y-3">
        <PhotoUpload onConfirm={handlePhotoConfirm} />

        {!showManual && !candidate && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowManual(true)}
          >
            ✏️ 手动录入
          </Button>
        )}

        {showManual && !candidate && (
          <FoodEntryForm onSaved={handleSaved} />
        )}

        {candidate && (
          <FoodEntryForm prefilled={candidate} onSaved={handleSaved} />
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          今日记录
        </h2>
        <FoodList entries={entries} />
      </div>
    </>
  );
}
