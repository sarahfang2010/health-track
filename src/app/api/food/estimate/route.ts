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

  const result = await estimateNutrition(foodName, Number(grams));

  if (!result) {
    return NextResponse.json({ error: "估算失败" }, { status: 500 });
  }

  return NextResponse.json(result);
}
