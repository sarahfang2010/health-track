import { prisma } from "@/lib/prisma";

export async function calculateDailySummary(userId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const foodEntries = await prisma.foodEntry.findMany({
    where: {
      userId,
      consumedAt: { gte: startOfDay, lt: endOfDay },
    },
  });

  const exerciseEntries = await prisma.exerciseEntry.findMany({
    where: {
      userId,
      date: { gte: startOfDay, lt: endOfDay },
    },
  });

  const totalCaloriesIn = foodEntries.reduce((s, e) => s + e.calories, 0);
  const totalCaloriesOut = exerciseEntries.reduce((s, e) => s + e.caloriesBurned, 0);
  const totalProtein = foodEntries.reduce((s, e) => s + e.protein, 0);
  const totalFat = foodEntries.reduce((s, e) => s + e.fat, 0);
  const totalCarbs = foodEntries.reduce((s, e) => s + e.carbs, 0);

  const existing = await prisma.dailySummary.findFirst({
    where: {
      userId,
      date: { gte: startOfDay, lt: endOfDay },
    },
  });

  const data = {
    userId,
    date: startOfDay,
    totalCaloriesIn,
    totalCaloriesOut,
    totalProtein,
    totalFat,
    totalCarbs,
    calorieBalance: totalCaloriesIn - totalCaloriesOut,
  };

  if (existing) {
    return prisma.dailySummary.update({ where: { id: existing.id }, data });
  }
  return prisma.dailySummary.create({ data });
}
