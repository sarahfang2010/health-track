"use client";

import { useState, useEffect, useCallback } from "react";
import { PhotoUpload } from "@/components/food/photo-upload";
import { FoodEntryForm } from "@/components/food/food-entry-form";
import { FoodList, FoodEntry } from "@/components/food/food-list";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/services/foodRecognition";
import Link from "next/link";

export default function FoodPage() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/food");
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const currentCandidate = candidates.length > 0 ? candidates[currentIdx] : undefined;
  const hasMoreCandidates = currentIdx < candidates.length - 1;

  function handlePhotoConfirm(list: Candidate[]) {
    setCandidates(list);
    setCurrentIdx(0);
    setEditingEntry(null);
    setShowManual(false);
  }

  function handleSaved() {
    fetchEntries();
    if (hasMoreCandidates) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setCandidates([]);
      setCurrentIdx(0);
      setEditingEntry(null);
      setShowManual(false);
    }
  }

  function handleEdit(entry: FoodEntry) {
    setEditingEntry(entry);
    setCandidates([]);
    setShowManual(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/food?id=${id}`, { method: "DELETE" });
    fetchEntries();
  }

  function handleCancel() {
    setCandidates([]);
    setCurrentIdx(0);
    setEditingEntry(null);
    setShowManual(false);
  }

  function handleManualEntry() {
    setCandidates([]);
    setEditingEntry(null);
    setShowManual(true);
  }

  const showForm = showManual || !!currentCandidate || !!editingEntry;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm text-primary">← 返回</Link>
        <h1 className="text-xl font-semibold">饮食记录</h1>
        <Link href="/food/history" className="text-sm text-primary">
          历史记录 →
        </Link>
      </div>

      <div className="space-y-3">
        {!showForm && (
          <>
            <PhotoUpload onConfirm={handlePhotoConfirm} />
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManualEntry}
            >
              ✏️ 手动录入
            </Button>
          </>
        )}

        {showManual && !currentCandidate && !editingEntry && (
          <FoodEntryForm onSaved={handleSaved} onCancel={handleCancel} />
        )}

        {currentCandidate && !editingEntry && (
          <div>
            {candidates.length > 1 && (
              <p className="text-xs text-muted-foreground text-center mb-2">
                已选 {candidates.length} 项 · 正在录入第 {currentIdx + 1} 项：{currentCandidate.name}
              </p>
            )}
            <FoodEntryForm prefilled={currentCandidate} onSaved={handleSaved} onCancel={handleCancel} />
          </div>
        )}

        {editingEntry && (
          <FoodEntryForm editEntry={editingEntry} onSaved={handleSaved} onCancel={handleCancel} />
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          今日记录
        </h2>
        <FoodList
          entries={entries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
}
