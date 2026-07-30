import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { name, age, gender, height, weight, goal } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(age !== undefined && { age: age ? parseInt(age) : null }),
      ...(gender !== undefined && { gender }),
      ...(height !== undefined && { height: height ? parseFloat(height) : null }),
      ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
      ...(goal !== undefined && { goal }),
    },
  });

  revalidatePath("/");
  return NextResponse.json(user);
}
