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
    },
  });

  return NextResponse.json({ ...report, flagsArray: flags }, { status: 201 });
}
