"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  account: string;
  role: string;
  goal: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.status === 403) {
      setError("无管理员权限");
      setLoading(false);
      return;
    }
    setUsers(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleRole(user: User) {
    const newRole = user.role === "admin" ? "member" : "admin";
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role: newRole }),
    });
    if (res.ok) fetchUsers();
  }

  async function deleteUser(user: User) {
    if (!confirm(`确定删除用户「${user.name}」？此操作不可撤销。`)) return;
    const res = await fetch(`/api/admin/users?id=${user.id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else alert((await res.json()).error || "删除失败");
  }

  async function backupData() {
    const res = await fetch("/api/admin/backup", { method: "POST" });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `healthtrack_backup_${new Date().toISOString().slice(0, 10)}.sql`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert("备份失败");
    }
  }

  if (loading) return <p className="text-center text-muted-foreground py-20">加载中...</p>;
  if (error) return <p className="text-center text-muted-foreground py-20">{error}</p>;

  return (
    <>
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary">← 返回</Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">用户管理</h1>

      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="min-w-0">
              <div className="font-medium truncate">{u.name}</div>
              <div className="text-xs text-muted-foreground">
                {u.account} · {u.goal === "lose" ? "减重" : u.goal === "gain" ? "增重" : "保持"}
                {u.role === "admin" && (
                  <span className="ml-1 text-primary font-medium">· 管理员</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                className="text-xs px-2 py-1 rounded border hover:bg-muted"
                onClick={() => toggleRole(u)}
              >
                {u.role === "admin" ? "降为成员" : "升为管理"}
              </button>
              <button
                className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => deleteUser(u)}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t">
        <button
          className="w-full text-sm py-2 rounded border hover:bg-muted transition-colors"
          onClick={backupData}
        >
          📥 备份用户数据
        </button>
        <p className="text-xs text-muted-foreground text-center mt-2">
          每天凌晨 3:00 自动备份，保留最近 7 份
        </p>
      </div>
    </>
  );
}
