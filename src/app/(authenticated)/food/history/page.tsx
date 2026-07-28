"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { FoodList } from "@/components/food/food-list";
import Link from "next/link";

export default function FoodHistoryPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`/api/food?date=${date}`)
      .then((r) => r.json())
      .then(setEntries);
  }, [date]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <Link href="/food" className="text-sm text-primary">
          ← 返回
        </Link>
        <h1 className="text-lg font-semibold">饮食历史</h1>
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

      <FoodList entries={entries} />
    </AppShell>
  );
}
