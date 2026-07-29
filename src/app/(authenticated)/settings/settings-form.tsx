"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  user: {
    name: string;
    age: number | null;
    gender: string | null;
    height: number | null;
    weight: number | null;
  } | null;
}

const limits: Record<string, number> = { age: 122, height: 272, weight: 635 };

export function SettingsForm({ user }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    let hasError = false;
    const newErrors: Record<string, string> = {};

    ["name", "age", "gender", "height", "weight"].forEach((key) => {
      const val = formData.get(key) as string;
      if (limits[key] && Number(val) > limits[key]) {
        newErrors[key] = "请填写正确数据";
        hasError = true;
      }
      data[key] = val || null;
    });

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
    router.push("/");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>昵称</Label>
        <Input name="name" defaultValue={user?.name || ""} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>年龄</Label>
          <Input name="age" type="number" min={0} max={122} defaultValue={user?.age || ""} />
          {errors.age && <p className="text-xs text-red-500 mt-0.5">{errors.age}</p>}
        </div>
        <div className="space-y-1">
          <Label>性别</Label>
          <select
            name="gender"
            defaultValue={user?.gender || ""}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="">未选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>身高 (cm)</Label>
          <Input name="height" type="number" step="0.1" min={0} max={272} defaultValue={user?.height || ""} />
          {errors.height && <p className="text-xs text-red-500 mt-0.5">{errors.height}</p>}
        </div>
        <div className="space-y-1">
          <Label>体重 (kg)</Label>
          <Input name="weight" type="number" step="0.1" min={0} max={635} defaultValue={user?.weight || ""} />
          {errors.weight && <p className="text-xs text-red-500 mt-0.5">{errors.weight}</p>}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "保存中..." : "保存设置"}
      </Button>
    </form>
  );
}
