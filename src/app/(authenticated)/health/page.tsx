"use client";

import { useState, useEffect, useCallback } from "react";
import { ReportCard, HealthReport } from "@/components/health/report-card";
import Link from "next/link";

export default function HealthPage() {
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchReports = useCallback(async () => {
    const res = await fetch("/api/health");
    if (res.ok) setReports(await res.json());
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  async function handleAnalyze(id: string) {
    setAnalyzingId(id);
    setActiveReportId(id);
    setAiAnalysis("");
    setSaved(false);
    try {
      const res = await fetch("/api/ai/health-analysis", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAiAnalysis(data.analysis);
      }
    } catch {}
    setAnalyzingId(null);
  }

  async function saveAnalysis() {
    if (!activeReportId) return;
    const res = await fetch("/api/health", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeReportId, notes: aiAnalysis }),
    });
    if (res.ok) {
      setSaved(true);
      fetchReports();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除这份报告吗？")) return;
    await fetch(`/api/health?id=${id}`, { method: "DELETE" });
    setAiAnalysis("");
    setActiveReportId(null);
    fetchReports();
  }

  const latest = reports[0];
  const older = reports.slice(1);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm text-primary">← 返回</Link>
        <h1 className="text-xl font-semibold">健康档案</h1>
        <Link href="/health/new" className="text-sm text-primary">
          + 新建报告
        </Link>
      </div>

      {latest ? (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">最新报告</h2>
          <ReportCard
            report={latest}
            onDelete={handleDelete}
            onAnalyze={handleAnalyze}
            analyzingId={analyzingId}
          />

          {activeReportId && aiAnalysis && (
            <div className="mt-4 text-sm leading-relaxed whitespace-pre-line break-words overflow-hidden text-muted-foreground bg-muted/30 rounded-lg p-4">
              {aiAnalysis}
              <div className="flex gap-3 mt-3">
                <button className="text-xs text-primary hover:underline" onClick={() => handleAnalyze(activeReportId)}>
                  🔄 重新分析
                </button>
                {!saved ? (
                  <button className="text-xs text-primary hover:underline" onClick={saveAnalysis}>
                    💾 保存分析结果
                  </button>
                ) : (
                  <span className="text-xs text-green-600">✓ 已保存</span>
                )}
              </div>
            </div>
          )}
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
          <h2 className="text-sm font-medium text-muted-foreground mt-6 mb-2">历史报告</h2>
          <div className="space-y-2">
            {older.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                onDelete={handleDelete}
                onAnalyze={handleAnalyze}
                analyzingId={analyzingId}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
