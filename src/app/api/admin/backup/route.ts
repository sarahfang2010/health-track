import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const currentUser = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (currentUser?.role !== "admin") return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });
    const filename = `healthtrack_${new Date().toISOString().slice(0, 16).replace(/[T:]/g, "_")}.sql`;
    const filepath = path.join(backupDir, filename);

    await execAsync(`PGPASSWORD=healthtrack2026 pg_dump -h localhost -U healthtrack healthtrack > "${filepath}"`);

    const content = await fs.readFile(filepath, "utf-8");

    // Cleanup old backups
    const files = await fs.readdir(backupDir);
    const sqlFiles = files.filter(f => f.endsWith(".sql")).sort().reverse();
    for (const old of sqlFiles.slice(7)) {
      await fs.unlink(path.join(backupDir, old));
    }

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/sql",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
