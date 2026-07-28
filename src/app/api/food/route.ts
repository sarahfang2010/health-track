import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  let startOfDay: Date, endOfDay: Date;
  if (date) {
    startOfDay = new Date(date);
    endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
  }

  const entries = await prisma.foodEntry.findMany({
    where: {
      userId: session.user.id,
      consumedAt: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { consumedAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { mealType, foodName, portion, calories, protein, fat, carbs, fiber, sugar, imageUrl, source, consumedAt } = body;

  const entry = await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      mealType: mealType || "snack",
      foodName,
      portion: portion || null,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbs: parseFloat(carbs),
      fiber: fiber ? parseFloat(fiber) : null,
      sugar: sugar ? parseFloat(sugar) : null,
      imageUrl: imageUrl || null,
      source: source || "manual",
      consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
