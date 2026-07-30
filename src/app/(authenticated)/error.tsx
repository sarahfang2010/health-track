"use client";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-2xl mx-auto flex items-center h-14 px-4">
          <span className="font-semibold text-lg">🍎 健康追踪</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-3xl">⚠️</p>
            <h2 className="text-lg font-semibold">页面加载失败</h2>
            <p className="text-sm text-muted-foreground">
              {error.message || "发生了未知错误"}
            </p>
            <button
              onClick={() => reset()}
              className="text-sm text-primary underline hover:no-underline"
            >
              重试
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
