import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recognizeFood } from "@/services/foodRecognition";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "请上传图片" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "仅支持图片文件" }, { status: 400 });
  }

  if (file.size >= 10 * 1024 * 1024) {
    return NextResponse.json({ error: "图片大小不能超过 10MB" }, { status: 400 });
  }

  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const imageUrl = `/uploads/${filename}`;

  // AI recognition — falls back to random if AI fails
  const fullPath = path.join(uploadDir, filename);
  const candidates = await recognizeFood(fullPath);

  return NextResponse.json({ imageUrl, candidates });
}
