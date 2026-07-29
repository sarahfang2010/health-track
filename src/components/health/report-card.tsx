import Link from "next/link";

export interface HealthReport {
  id: string;
  reportDate: string;
  bloodSugar: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  totalCholesterol: number | null;
  hdl: number | null;
  ldl: number | null;
  triglycerides: number | null;
  uricAcid: number | null;
  flags: string;
  reportImageUrl: string | null;
  notes: string | null;
}

export function ReportCard({ report, onDelete }: { report: HealthReport; onDelete?: (id: string) => void }) {
  const flagsArr = report.flags ? report.flags.split(",").filter(Boolean) : [];
  const date = new Date(report.reportDate).toLocaleDateString("zh-CN");

  const hasData =
    report.bloodSugar ||
    report.bloodPressureSystolic ||
    report.totalCholesterol ||
    report.uricAcid;

  return (
    <div className="border rounded-lg p-4 space-y-2 group">
      <div className="flex items-center justify-between">
        <span className="font-medium">{date}</span>
        {flagsArr.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {flagsArr.map((f) => (
              <span
                key={f}
                className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
      {report.reportImageUrl && (
        <div className="flex gap-2 overflow-x-auto">
          {report.reportImageUrl.split(",").map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`报告 ${i + 1}`}
              className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
            />
          ))}
        </div>
      )}
      {hasData ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {report.bloodSugar && (
            <div>
              血糖: <span className="font-medium">{report.bloodSugar}</span> mmol/L
            </div>
          )}
          {report.bloodPressureSystolic && (
            <div>
              血压: <span className="font-medium">
                {report.bloodPressureSystolic}/{report.bloodPressureDiastolic}
              </span> mmHg
            </div>
          )}
          {report.totalCholesterol && (
            <div>
              总胆固醇: <span className="font-medium">{report.totalCholesterol}</span> mmol/L
            </div>
          )}
          {report.uricAcid && (
            <div>
              尿酸: <span className="font-medium">{report.uricAcid}</span> μmol/L
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">未录入指标</p>
      )}
      {report.notes && (
        <p className="text-xs text-muted-foreground">{report.notes}</p>
      )}
      {(onDelete) && (
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/health/edit/${report.id}`}
            className="text-xs text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            编辑
          </Link>
          <button
            type="button"
            className="text-xs text-destructive hover:underline"
            onClick={(e) => { e.stopPropagation(); onDelete(report.id); }}
          >
            删除
          </button>
        </div>
      )}
    </div>
  );
}
