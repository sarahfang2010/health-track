import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      age: true,
      gender: true,
      height: true,
      weight: true,
      goal: true,
    },
  });

  return (
    <>
      <h1 className="text-xl font-semibold mb-4">个人设置</h1>
      <SettingsForm user={user} />
    </>
  );
}
