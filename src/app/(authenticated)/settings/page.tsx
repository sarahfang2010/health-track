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
      <h1 className="text-xl font-semibold mb-4">个人设置</h1>
      <SettingsForm user={user} />
      <div className="mt-6 pt-6 border-t flex justify-center">
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="text-muted-foreground">
            退出登录
          </Button>
        </form>
      </div>
    </>
  );
}
