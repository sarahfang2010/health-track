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
  const promptText = `你是营养医学顾问。请仔细阅读上传的体检报告图片，从中提取所有检测指标的值。

用户基本信息：${user?.gender === "male" ? "男性" : user?.gender === "female" ? "女性" : "未知"}，${user?.age ? `${user.age}岁` : "年龄未知"}，目标：${user?.goal === "lose" ? "减重" : user?.goal === "gain" ? "增重" : "保持"}

注意：图片中是体检报告原文，请从图片中直接读取各项指标（血糖、血压、血脂、尿酸等），不要参考文字描述中可能为空的占位符。

请分三部分回答：
1. 从图片中提取并列出所有检测指标的名称、数值、单位和参考范围，标注哪些正常、哪些异常
2. 综合评估健康状况、风险和需要关注的问题
3. 根据异常指标和用户目标，给出具体可操作的饮食调整建议

控制在 500 字以内。`;

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
