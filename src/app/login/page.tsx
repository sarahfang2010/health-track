"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { register, login } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "处理中..." : text}
    </Button>
  );
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = isRegister ? await register(formData) : await login(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">🍎 健康追踪</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="account">手机号</Label>
              <Input
                id="account"
                name="account"
                type="tel"
                placeholder="输入手机号"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="输入密码"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <SubmitButton text={isRegister ? "注册" : "登录"} />
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isRegister ? "已有账号？" : "没有账号？"}
            <button
              type="button"
              className="ml-1 text-primary underline"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "去登录" : "去注册"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
