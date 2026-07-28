import { ReportForm } from "@/components/health/report-form";
import Link from "next/link";

export default function NewHealthPage() {
  return (
    <>
      <div className="mb-4">
        <Link href="/health" className="text-sm text-primary">
          ← 返回
        </Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">新建体检报告</h1>
      <ReportForm />
    </>
  );
}
