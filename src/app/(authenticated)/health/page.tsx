"use client";

import { useState, useEffect } from "react";
import { ReportCard, HealthReport } from "@/components/health/report-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HealthPage() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setReports);
  }, []);

  const latest = reports[0];
  const older = reports.slice(1);

  async function analyzeReport() {
    setAnalyzing(true);
    setAiAnalysis("");
    try {
      const res = await fetch("/api/ai/health-analysis", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.analysis);
      }
    } catch {}
    setAnalyzing(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">健康档案</h1>
        <Link href="/health/new" className="text-sm text-primary">
          + 新建报告
        </Link>
      </div>

      {latest ? (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            最新报告
          </h2>
          <ReportCard report={latest} />

          <div className="mt-4">
            {!aiAnalysis && (
              <Button
                variant="outline"
                className="w-full"
                onClick={analyzeReport}
                disabled={analyzing}
              >
                {analyzing ? "🤖 AI 分析中..." : "🤖 AI 解读我的体检报告"}
              </Button>
            )}
            {aiAnalysis && (
              <div className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground bg-muted/30 rounded-lg p-4">
                {aiAnalysis}
                <button
                  className="text-xs text-primary mt-3 block hover:underline"
                  onClick={analyzeReport}
                >
                  🔄 重新分析
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">❤️</p>
          <p>还没有体检记录</p>
          <Link href="/health/new" className="text-primary text-sm mt-2 inline-block">
            录入第一份报告
          </Link>
        </div>
      )}

      {older.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mt-6 mb-2">
            历史报告
          </h2>
          <div className="space-y-2">
            {older.map((r: HealthReport) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
