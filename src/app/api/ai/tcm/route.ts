import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { aiChat } from "@/services/ai";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const report = await prisma.healthReport.findFirst({
    where: { userId: session.user.id },
    orderBy: { reportDate: "desc" },
  });

  const now = new Date();
  const month = now.getMonth() + 1;
  let season = "春";
  if (month >= 3 && month <= 5) season = "春";
  else if (month >= 6 && month <= 8) season = "夏";
  else if (month >= 9 && month <= 11) season = "秋";
  else season = "冬";

  const flags = report?.flags ? report.flags.split(",").filter(Boolean) : [];
  const healthIssues = flags.length > 0 ? flags.join("、") : "无特殊健康问题";

  const prompt = `作为资深中医食疗专家，请根据以下用户信息，给出个性化的中医食补养生建议。包括：

1. 当前${season}季的饮食原则
2. 针对用户具体情况推荐5-8种食材及原因
3. 应避免的食物
4. 推荐2-3个简单的食疗方

用户信息：
- 性别：${user?.gender === "male" ? "男" : user?.gender === "female" ? "女" : "未知"}
- 年龄：${user?.age ? `${user.age}岁` : "未知"}
- 健康问题：${healthIssues}
- 目标：${user?.goal === "lose" ? "减重" : user?.goal === "gain" ? "增重" : "保持"}
- 当前季节：${season}季

请用亲切自然的语言回答，控制在300字以内。`;

  const result = await aiChat([{ role: "user", content: prompt }]);
  if (!result) return NextResponse.json({ error: "AI 分析失败" }, { status: 500 });

  return NextResponse.json({ advice: result, season });
}
