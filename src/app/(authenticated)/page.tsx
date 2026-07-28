import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { AdviceCard } from "@/components/dashboard/advice-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getRecommendations } from "@/services/recommendationEngine";
import { calculateDailySummary } from "@/services/summaryCalculator";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Calculate or get daily summary
  await calculateDailySummary(session.user.id, new Date());
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const summary = await prisma.dailySummary.findFirst({
    where: {
      userId: session.user.id,
      date: { gte: startOfDay },
    },
    orderBy: { date: "desc" },
  });

  const todayCalories = summary?.totalCaloriesIn || 0;
  const exerciseCalories = summary?.totalCaloriesOut || 0;

  // BMR + TDEE
  let tdee = 2000;
  if (user?.weight && user?.height && user?.age) {
    let bmr: number;
    if (user.gender === "male") {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }
    tdee = Math.round(bmr * 1.375);
  }

  let targetCal = tdee;
  if (user?.goal === "lose") targetCal = Math.max(tdee - 300, 1200);
  if (user?.goal === "gain") targetCal = tdee + 300;

  const recommendations = await getRecommendations(session.user.id);
  const topAdvice = recommendations.slice(0, 3);

  const goalLabels: Record<string, string> = {
    lose: "减重",
    maintain: "保持",
    gain: "增重",
  };

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-xl font-semibold">
          {user?.name ? `${user.name}，你好` : "你好"}
        </h1>
        {user?.goal && (
          <p className="text-sm text-muted-foreground">
            当前目标：{goalLabels[user.goal] || user.goal}
          </p>
        )}
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <CalorieRing consumed={todayCalories} target={targetCal} />
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <span className="text-green-600">
              摄入 {todayCalories} kcal
            </span>
            <span className="text-orange-600">
              运动消耗 {exerciseCalories} kcal
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            净摄入：{todayCalories - exerciseCalories} kcal
          </p>
        </div>

        <QuickActions />

        {topAdvice.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                个性化建议
              </h2>
              <Link href="/recommendations" className="text-xs text-primary">
                查看全部 →
              </Link>
            </div>
            <div className="space-y-2">
              {topAdvice.map((a, i) => (
                <AdviceCard key={i} advice={a} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
