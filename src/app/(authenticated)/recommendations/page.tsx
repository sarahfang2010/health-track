"use client";

import { useState, useEffect } from "react";
import { AdviceCard } from "@/components/dashboard/advice-card";
import Link from "next/link";

export default function RecommendationsPage() {
  const [advice, setAdvice] = useState([]);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then(setAdvice);
  }, []);

  return (
    <>
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary">
          ← 返回首页
        </Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">全部建议</h1>
      <div className="space-y-2">
        {advice.map((a: { priority: string; condition: string; message: string }, i: number) => (
          <AdviceCard key={i} advice={a} />
        ))}
      </div>

      <div className="mt-8 pt-6 border-t">
        <Link
          href="/recommendations/tcm"
          className="flex items-center gap-4 p-4 rounded-lg border-2 border-green-200 bg-green-50/50 hover:bg-green-50 transition-colors"
        >
          <span className="text-3xl">🌿</span>
          <div className="flex-1">
            <div className="font-semibold text-base">中医食补养生</div>
            <div className="text-sm text-muted-foreground">
              根据体质和季节，推荐传统中医食疗方案
            </div>
          </div>
          <span className="text-muted-foreground">→</span>
        </Link>
      </div>
    </>
  );
}
