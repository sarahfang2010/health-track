import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";
import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      age: true,
      gender: true,
      height: true,
      weight: true,
    },
  });

  return (
    <>
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary">← 返回</Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">个人设置</h1>
      <SettingsForm user={user} />
      <div className="mt-8 pt-6 border-t flex justify-center pb-4">
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="text-muted-foreground">
            退出登录
          </Button>
        </form>
      </div>

      <div className="mt-2 text-center">
        <Link href="/donate" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          觉得不错？
        </Link>
      </div>
    </>
  );
}
