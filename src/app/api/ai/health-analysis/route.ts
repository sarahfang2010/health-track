import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiChat } from "@/services/ai";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const report = await prisma.healthReport.findFirst({
    where: { userId: session.user.id },
    orderBy: { reportDate: "desc" },
  });

  if (!report) return NextResponse.json({ error: "请先录入体检报告" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  const flags = report.flags ? report.flags.split(",").filter(Boolean) : [];
  const hasAbnormal = flags.length > 0;

  const reportData = {
    日期: report.reportDate,
    空腹血糖: report.bloodSugar ? `${report.bloodSugar} mmol/L` : "未测",
    收缩压: report.bloodPressureSystolic ? `${report.bloodPressureSystolic} mmHg` : "未测",
    舒张压: report.bloodPressureDiastolic ? `${report.bloodPressureDiastolic} mmHg` : "未测",
    总胆固醇: report.totalCholesterol ? `${report.totalCholesterol} mmol/L` : "未测",
    HDL: report.hdl ? `${report.hdl} mmol/L` : "未测",
    LDL: report.ldl ? `${report.ldl} mmol/L` : "未测",
    甘油三酯: report.triglycerides ? `${report.triglycerides} mmol/L` : "未测",
    尿酸: report.uricAcid ? `${report.uricAcid} μmol/L` : "未测",
    风险标记: flags.length > 0 ? flags.join("、") : "无明显异常",
  };

  const prompt = `请作为营养医学顾问，根据以下体检报告给出专业解读。用通俗易懂的语言，分三部分：
1. 指标解读：逐一解释每项指标的含义和当前值是否正常
2. 风险评估：综合评估当前健康状况，指出需要关注的方面
3. 饮食建议：针对异常指标给出具体的饮食调整建议

用户信息：${user?.gender === "male" ? "男性" : user?.gender === "female" ? "女性" : "未设置"}，${user?.age ? `${user.age}岁` : "未设置年龄"}，目标：${user?.goal === "lose" ? "减重" : user?.goal === "gain" ? "增重" : "保持"}

体检数据：
${JSON.stringify(reportData, null, 2)}`;

  const result = await aiChat([{ role: "user", content: prompt }]);
  if (!result) return NextResponse.json({ error: "AI 分析失败" }, { status: 500 });

  return NextResponse.json({ analysis: result });
}
