import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { AdviceCard } from "@/components/dashboard/advice-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { GoalSelector } from "@/components/dashboard/goal-selector";
import { MacroBars } from "@/components/dashboard/macro-bars";
import { getRecommendations } from "@/services/recommendationEngine";
import { calculateDailySummary } from "@/services/summaryCalculator";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Only show onboarding for new users (no body data set)
  const isNewUser = !user?.age && !user?.height && !user?.weight;

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
  const todayProtein = summary?.totalProtein || 0;
  const todayFat = summary?.totalFat || 0;
  const todayCarbs = summary?.totalCarbs || 0;

  // BMR + TDEE
  let tdee = 2000;
  let bmr = 1500;
  if (user?.weight && user?.height && user?.age) {
    if (user.gender === "male") {
      bmr = Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5);
    } else {
      bmr = Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age - 161);
    }
    tdee = Math.round(bmr * 1.375);
  }

  let targetCal = tdee;
  if (user?.goal === "lose") targetCal = Math.max(tdee - 300, 1200);
  if (user?.goal === "gain") targetCal = tdee + 300;

  const recommendations = await getRecommendations(session.user.id);
  const topAdvice = recommendations.slice(0, 3);

  const now = new Date();
  const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${weekdays[now.getDay()]}`;

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            {user?.name ? `${user.name}，你好` : "你好"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
        <GoalSelector
          currentGoal={user?.goal || "maintain"}
          showOnboarding={isNewUser}
        />
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <CalorieRing consumed={todayCalories} burned={exerciseCalories} bmr={bmr} target={targetCal} />
        </div>

        <MacroBars
          protein={todayProtein}
          carbs={todayCarbs}
          fat={todayFat}
          targetCal={targetCal}
        />

        <QuickActions />

        <Link
          href="/recommendations/tcm"
          className="flex items-center gap-3 p-4 rounded-lg border-2 border-green-200 bg-green-50/60 hover:bg-green-50 transition-colors"
        >
          <span className="text-2xl">🌿</span>
          <div className="flex-1">
            <div className="font-semibold text-sm">中医食补养生</div>
            <div className="text-xs text-muted-foreground">
              根据季节和体质，推荐食疗方案
            </div>
          </div>
          <span className="text-muted-foreground text-sm">→</span>
        </Link>

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
    </>
  );
}
