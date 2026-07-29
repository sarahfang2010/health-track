import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

const AI_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const AI_API_KEY = "sk-VEeGua9LQf8sg6lJpB3sEodxeUlNt5ii46Cr8AyO9TRhNSnWwm79SdbOElxsFM5V";
const AI_MODEL = "mimo-v2.5";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "请上传图片" }, { status: 400 });

  // Read directly to base64 (no file save needed for AI)
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");

  // Determine mime type from original file
  const mimeType = file.type || "image/jpeg";

  // Save file for URL access later
  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  const aiResponse = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `请从这张体检报告中提取以下指标的值。只返回一个JSON对象，格式如下：
{
  "bloodSugar": 数值或null,
  "bloodPressureSystolic": 数值或null,
  "bloodPressureDiastolic": 数值或null,
  "totalCholesterol": 数值或null,
  "hdl": 数值或null,
  "ldl": 数值或null,
  "triglycerides": 数值或null,
  "uricAcid": 数值或null
}

注意：
- 血糖单位是 mmol/L
- 血压单位是 mmHg，收缩压是较大的数，舒张压是较小的数
- 胆固醇、HDL、LDL、甘油三酯单位是 mmol/L
- 尿酸单位是 μmol/L
- 如果某项指标没有找到，值设为 null
- 只返回JSON，不要有其他文字`,
            },
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
    }),
  });

  if (!aiResponse.ok) {
    console.error("OCR AI error:", aiResponse.status);
    return NextResponse.json({ error: "识别失败，请手动填写" }, { status: 500 });
  }

  const data = await aiResponse.json();
  const content = data.choices?.[0]?.message?.content || "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const values = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ values, imageUrl: `/uploads/${filename}` });
    }
  } catch {}

  return NextResponse.json({ error: "无法解析报告数据，请手动填写" }, { status: 500 });
}
