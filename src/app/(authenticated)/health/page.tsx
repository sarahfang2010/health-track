"use client";

import { useState, useEffect } from "react";
import { ReportCard, HealthReport } from "@/components/health/report-card";
import Link from "next/link";

export default function HealthPage() {
  const [reports, setReports] = useState<HealthReport[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setReports);
  }, []);

  const latest = reports[0];
  const older = reports.slice(1);

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
