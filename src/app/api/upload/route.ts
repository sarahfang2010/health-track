import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

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
    return NextResponse.json({ error: "仅支持图片格式" }, { status: 400 });
  }

  if (file.size >= 10 * 1024 * 1024) {
    return NextResponse.json({ error: "图片不能超过10MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ imageUrl: `/uploads/${filename}` });
}
