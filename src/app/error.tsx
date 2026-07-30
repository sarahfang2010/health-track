"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-3xl">⚠️</p>
        <h2 className="text-lg font-semibold">出了点问题</h2>
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
  );
}
