import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, account: true, role: true, goal: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });
  if (id === session.user.id) return NextResponse.json({ error: "不能删除自己" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id }, select: { account: true } });
  if (target?.account === "18616996380") {
    return NextResponse.json({ error: "创始人不能被删除" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  const body = await req.json();
  const { id, role } = body;
  if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });
  if (id === session.user.id && role !== "admin") return NextResponse.json({ error: "不能降级自己" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id }, select: { account: true } });
  if (target?.account === "18616996380" && role !== "admin") {
    return NextResponse.json({ error: "创始人不能被降级" }, { status: 403 });
  }

  await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ success: true });
}
