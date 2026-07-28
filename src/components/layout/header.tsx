import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";

export async function Header() {
  const session = await auth();

  let displayName = session?.user?.name;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    if (user) displayName = user.name;
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-semibold text-lg">
          🍎 健康追踪
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            ⚙️
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {displayName}
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              退出
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
