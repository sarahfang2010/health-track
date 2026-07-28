"use client";

import { useState, useEffect, useCallback } from "react";
import { ExerciseForm } from "@/components/exercise/exercise-form";
import { ExerciseList } from "@/components/exercise/exercise-list";
import Link from "next/link";

export default function ExercisePage() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/exercise");
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function handleSaved() {
    setShowForm(false);
    fetchEntries();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">运动记录</h1>
        <Link href="/exercise/history" className="text-sm text-primary">
          历史记录 →
        </Link>
      </div>

      <div className="space-y-3">
        {!showForm && (
          <button
            className="w-full p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            onClick={() => setShowForm(true)}
          >
            + 记录运动
          </button>
        )}
        {showForm && <ExerciseForm onSaved={handleSaved} />}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          今日记录
        </h2>
        <ExerciseList entries={entries} />
      </div>
    </>
  );
}
