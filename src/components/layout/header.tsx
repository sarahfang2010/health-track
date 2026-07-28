import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth";

export async function Header() {
  const session = await auth();

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
            {session?.user?.name}
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
