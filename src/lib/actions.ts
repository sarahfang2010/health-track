"use server";

import { hash } from "bcryptjs";
import { prisma } from "./prisma";
import { signIn } from "./auth";

export async function register(formData: FormData) {
  const account = formData.get("account") as string;
  const password = formData.get("password") as string;

  if (!account || !password) {
    return { error: "请填写手机号和密码" };
  }

  if (password.length < 6) {
    return { error: "密码至少6位" };
  }

  const existing = await prisma.user.findUnique({
    where: { account },
  });

  if (existing) {
    return { error: "该手机号已被注册" };
  }

  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: { account, password: hashed, name: account },
  });

  try {
    await signIn("credentials", { account, password, redirectTo: "/" });
  } catch (err) {
    if ((err as Error).message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "注册失败，请稍后再试" };
  }
}

export async function login(formData: FormData) {
  const account = formData.get("account") as string;
  const password = formData.get("password") as string;

  if (!account || !password) {
    return { error: "请输入账号和密码" };
  }

  try {
    await signIn("credentials", { account, password, redirectTo: "/" });
  } catch (err) {
    if ((err as Error).message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    return { error: "账号或密码错误" };
  }
}
