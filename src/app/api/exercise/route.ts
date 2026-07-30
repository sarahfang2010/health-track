import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const calorieRates: Record<string, number> = {
  running: 8.0,
  walking: 3.5,
  cycling: 6.0,
  swimming: 7.0,
  strength: 5.0,
  yoga: 3.0,
  hiit: 10.0,
  other: 4.0,
};

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

  const entries = await prisma.exerciseEntry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { activityType, durationMinutes, steps, notes } = body;
  const rate = calorieRates[activityType] || 4.0;
  const caloriesBurned = Math.round(rate * parseFloat(durationMinutes));

  const entry = await prisma.exerciseEntry.create({
    data: {
      userId: session.user.id,
      activityType: activityType || "other",
      durationMinutes: parseFloat(durationMinutes),
      caloriesBurned,
      steps: steps ? parseInt(steps) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  return NextResponse.json(entry, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { id, activityType, durationMinutes, steps, notes } = body;

  const existing = await prisma.exerciseEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  const rate = calorieRates[activityType] || 4.0;
  const caloriesBurned = Math.round(rate * parseFloat(durationMinutes));

  const entry = await prisma.exerciseEntry.update({
    where: { id },
    data: {
      activityType: activityType || existing.activityType,
      durationMinutes: parseFloat(durationMinutes),
      caloriesBurned,
      steps: steps ? parseInt(steps) : null,
      notes: notes || null,
    },
  });

  revalidatePath("/");
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少ID" }, { status: 400 });
  }

  const existing = await prisma.exerciseEntry.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  await prisma.exerciseEntry.delete({ where: { id } });
  revalidatePath("/");
  return NextResponse.json({ success: true });
}
