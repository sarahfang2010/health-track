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
    </>
  );
}
