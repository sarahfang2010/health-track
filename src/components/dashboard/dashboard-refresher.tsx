"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DashboardRefresher({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  return <>{children}</>;
}
