import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { estimateNutrition } from "@/services/foodRecognition";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { foodName, grams } = await req.json();

  if (!foodName || !grams) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }

  try {
    const result = await estimateNutrition(foodName, Number(grams));
    if (!result) {
      return NextResponse.json({ error: "请输入合理食物" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("estimate error:", err);
    return NextResponse.json({ error: "估算出错" }, { status: 500 });
  }
}
