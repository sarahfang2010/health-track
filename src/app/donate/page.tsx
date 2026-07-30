export const metadata = {
  title: "打赏作者 - 健康追踪",
};

export default function DonatePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="text-center space-y-5 max-w-sm">
        <p className="text-lg font-semibold">打赏作者</p>
        <p className="text-sm text-muted-foreground">
          感谢你的支持，让我更有动力持续改进这个应用
        </p>
        <img
          src="/qr-donate.png"
          alt="收款码"
          className="mx-auto w-56 h-auto rounded-xl shadow-md"
        />
        <p className="text-xs text-muted-foreground">
          微信扫码即可打赏
        </p>
        <a href="/settings" className="text-sm text-primary underline">
          ← 返回设置
        </a>
      </div>
    </div>
  );
}
