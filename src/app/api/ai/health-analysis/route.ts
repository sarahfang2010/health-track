import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

const AI_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const AI_API_KEY = "sk-VEeGua9LQf8sg6lJpB3sEodxeUlNt5ii46Cr8AyO9TRhNSnWwm79SdbOElxsFM5V";
const AI_MODEL = "minimax-m3";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const report = await prisma.healthReport.findFirst({
    where: { userId: session.user.id },
    orderBy: { reportDate: "desc" },
  });
  if (!report) return NextResponse.json({ error: "请先录入体检报告" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Build content array: images first, then structured prompt
  const content: unknown[] = [];

  // Add report images first
  let imagesLoaded = 0;
  if (report.reportImageUrl) {
    const imageUrls = report.reportImageUrl.split(",");
    for (const url of imageUrls.slice(0, 3)) {
      const relativeUrl = url.startsWith("/") ? url.slice(1) : url;
      const filePath = path.join(process.cwd(), "public", relativeUrl);
      try {
        const buffer = await fs.readFile(filePath);
        const base64 = buffer.toString("base64");
        const ext = path.extname(filePath).slice(1) || "jpeg";
        content.push({
          type: "image_url",
          image_url: { url: `data:image/${ext};base64,${base64}` },
        });
        imagesLoaded++;
      } catch (err) {
        console.error("Failed to load image:", filePath, (err as Error).message);
      }
    }
  }
  console.log(`AI analysis: ${imagesLoaded} images loaded for report ${report.id}`);

  const userInfo = [
    user?.gender === "male" ? "男" : user?.gender === "female" ? "女" : "",
    user?.age ? `${user.age}岁` : "",
    user?.goal === "lose" ? "减重" : user?.goal === "gain" ? "增重" : "保持体重",
  ].filter(Boolean).join("，");

  content.push({
    type: "text",
    text: `你是专业营养医学顾问。请仔细阅读上面上传的体检报告图片，严格按照以下格式逐条回答，不要遗漏任何部分：

## 一、指标提取
从图片中逐一提取所有检测指标，格式如下：
- 指标名称：数值 单位（参考范围：X-X），状态：正常/偏高/偏低

## 二、综合评估
根据各项指标结果，评估用户整体健康风险，指出需要重点关注的问题。
用户信息：${userInfo}

## 三、饮食建议
针对每项异常指标逐一给出具体、可操作的饮食调整建议，包括：
- 推荐多吃什么
- 建议少吃什么
- 每日摄入量的具体建议

请确保每个部分都完整回答。`,
  });

  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "你是一个能够读取和分析图片的专业医学顾问。你有视觉能力，可以看到用户上传的体检报告图片并从中提取数据。你必须基于图片中的实际数据进行分析，不要说你无法看到图片。",
        },
        { role: "user", content },
      ],
      max_tokens: 1600,
      temperature: 0,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "AI 分析失败" }, { status: 500 });
  }

  const data = await response.json();
  const analysis = data.choices?.[0]?.message?.content || "";

  return NextResponse.json({ analysis });
}
