import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeFlags } from "@/services/reportParser";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const reports = await prisma.healthReport.findMany({
    where: { userId: session.user.id },
    orderBy: { reportDate: "desc" },
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const flags = computeFlags(body);
  const flagsStr = flags.join(",");

  const report = await prisma.healthReport.create({
    data: {
      userId: session.user.id,
      reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
      bloodSugar: body.bloodSugar ?? null,
      bloodPressureSystolic: body.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: body.bloodPressureDiastolic ?? null,
      totalCholesterol: body.totalCholesterol ?? null,
      hdl: body.hdl ?? null,
      ldl: body.ldl ?? null,
      triglycerides: body.triglycerides ?? null,
      uricAcid: body.uricAcid ?? null,
      flags: flagsStr,
      notes: body.notes ?? null,
      reportImageUrl: body.reportImageUrl ?? null,
    },
  });

  return NextResponse.json({ ...report, flagsArray: flags }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updateData } = body;

  const existing = await prisma.healthReport.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  const report = await prisma.healthReport.update({
    where: { id },
    data: {
      reportDate: updateData.reportDate ? new Date(updateData.reportDate) : existing.reportDate,
      bloodSugar: updateData.bloodSugar ?? null,
      bloodPressureSystolic: updateData.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: updateData.bloodPressureDiastolic ?? null,
      totalCholesterol: updateData.totalCholesterol ?? null,
      hdl: updateData.hdl ?? null,
      ldl: updateData.ldl ?? null,
      triglycerides: updateData.triglycerides ?? null,
      uricAcid: updateData.uricAcid ?? null,
      notes: updateData.notes ?? null,
      reportImageUrl: updateData.reportImageUrl ?? existing.reportImageUrl,
    },
  });

  return NextResponse.json(report);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少ID" }, { status: 400 });

  const existing = await prisma.healthReport.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "记录不存在" }, { status: 404 });
  }

  await prisma.healthReport.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
