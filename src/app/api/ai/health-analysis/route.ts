import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const AI_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const AI_API_KEY = "sk-VEeGua9LQf8sg6lJpB3sEodxeUlNt5ii46Cr8AyO9TRhNSnWwm79SdbOElxsFM5V";
const AI_MODEL = "mimo-v2.5";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const report = await prisma.healthReport.findFirst({
    where: { userId: session.user.id },
    orderBy: { reportDate: "desc" },
  });

  if (!report) return NextResponse.json({ error: "请先录入体检报告" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Build prompt with text-based report data
  const promptText = `请作为营养医学顾问，根据以下信息给出专业解读：

用户信息：${user?.gender === "male" ? "男性" : user?.gender === "female" ? "女性" : "未设置"}，${user?.age ? `${user.age}岁` : "未设置"}，目标：${user?.goal === "lose" ? "减重" : user?.goal === "gain" ? "增重" : "保持"}

已有的检测值：血糖 ${report.bloodSugar || "未测"} mmol/L，血压 ${report.bloodPressureSystolic || "?"}/${report.bloodPressureDiastolic || "?"} mmHg，总胆固醇 ${report.totalCholesterol || "未测"} mmol/L，尿酸 ${report.uricAcid || "未测"} μmol/L。

请分三部分回答：
1. 如果图片中有更多指标，请先提取并列出所有检测值
2. 综合评估健康状况和风险
3. 给出具体的饮食调整建议

用通俗易懂的语言，控制在 400 字以内。`;

  // Build content array: text prompt + images
  const content: unknown[] = [{ type: "text", text: promptText }];

  // Add report images
  if (report.reportImageUrl) {
    const imageUrls = report.reportImageUrl.split(",");
    for (const url of imageUrls.slice(0, 3)) {
      // Only include first 3 images to stay within token limits
      const filePath = path.join(process.cwd(), "public", url);
      try {
        const buffer = await fs.readFile(filePath);
        const base64 = buffer.toString("base64");
        content.push({
          type: "image_url",
          image_url: { url: `data:image/jpeg;base64,${base64}` },
        });
      } catch {
        // Skip if file not found
      }
    }
  }

  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [{ role: "user", content }],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI 分析失败" }, { status: 500 });
  }

  const data = await response.json();
  const analysis = data.choices?.[0]?.message?.content || "";

  return NextResponse.json({ analysis });
}
