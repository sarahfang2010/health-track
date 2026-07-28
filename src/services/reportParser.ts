export interface ReportInput {
  bloodSugar?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  totalCholesterol?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  uricAcid?: number;
}

export function computeFlags(data: ReportInput): string[] {
  const flags: string[] = [];

  // 糖尿病风险：空腹血糖 ≥ 7.0 mmol/L
  if (data.bloodSugar && data.bloodSugar >= 7.0) {
    flags.push("糖尿病风险");
  } else if (data.bloodSugar && data.bloodSugar >= 6.1) {
    flags.push("血糖偏高");
  }

  // 高血压：收缩压 ≥ 140 或 舒张压 ≥ 90
  if (
    (data.bloodPressureSystolic && data.bloodPressureSystolic >= 140) ||
    (data.bloodPressureDiastolic && data.bloodPressureDiastolic >= 90)
  ) {
    flags.push("高血压");
  }

  // 高血脂：总胆固醇 ≥ 6.2 或 LDL ≥ 4.1 或 甘油三酯 ≥ 2.3
  if (
    (data.totalCholesterol && data.totalCholesterol >= 6.2) ||
    (data.ldl && data.ldl >= 4.1) ||
    (data.triglycerides && data.triglycerides >= 2.3)
  ) {
    flags.push("高血脂");
  }

  // 高尿酸：男性 > 420, 女性 > 360 (简化处理，用通用阈值)
  if (data.uricAcid && data.uricAcid > 420) {
    flags.push("高尿酸");
  }

  return flags;
}
