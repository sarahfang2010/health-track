"use client";

import { useState, useEffect } from "react";
import { ExerciseList } from "@/components/exercise/exercise-list";
import Link from "next/link";

export default function ExerciseHistoryPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`/api/exercise?date=${date}`)
      .then((r) => r.json())
      .then(setEntries);
  }, [date]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link href="/exercise" className="text-sm text-primary">
          ← 返回
        </Link>
        <h1 className="text-lg font-semibold">运动历史</h1>
        <div className="w-10" />
      </div>

      <div className="mb-4">
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        />
      </div>

      <ExerciseList entries={entries} />
    </>
  );
}
