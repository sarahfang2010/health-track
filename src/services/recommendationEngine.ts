import { prisma } from "@/lib/prisma";

interface Advice {
  priority: "high" | "medium" | "low";
  condition: string;
  message: string;
}

export async function getRecommendations(userId: string): Promise<Advice[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const latestReport = await prisma.healthReport.findFirst({
    where: { userId },
    orderBy: { reportDate: "desc" },
  });

  // Get today's food entries
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayEntries = await prisma.foodEntry.findMany({
    where: {
      userId,
      consumedAt: { gte: startOfDay },
    },
  });

  const todayProtein = todayEntries.reduce((sum, e) => sum + e.protein, 0);
  const todayCarbs = todayEntries.reduce((sum, e) => sum + e.carbs, 0);

  // BMR estimation (Mifflin-St Jeor)
  let bmr = 0;
  if (user.weight && user.height && user.age) {
    if (user.gender === "male") {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
    } else {
      bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
    }
  }
  // Light activity multiplier
  const tdee = Math.round(bmr * 1.375);

  const flags = latestReport?.flags
    ? latestReport.flags.split(",").filter(Boolean)
    : [];

  const advice: Advice[] = [];

  // Health-condition-based recommendations (high priority)
  if (flags.includes("糖尿病风险") || flags.includes("血糖偏高")) {
    advice.push({
      priority: "high",
      condition: "糖尿病风险",
      message: "检测到血糖偏高，建议选择低GI食物，控制精制碳水和含糖食品摄入。多吃全谷物、蔬菜和豆类。",
    });
  }

  if (flags.includes("高血压")) {
    advice.push({
      priority: "high",
      condition: "高血压",
      message: "建议每日盐摄入控制在6g以内，多摄入富含钾的食物如香蕉、菠菜、土豆。",
    });
  }

  if (flags.includes("高血脂")) {
    advice.push({
      priority: "high",
      condition: "高血脂",
      message: "减少动物脂肪和反式脂肪摄入，增加膳食纤维和Omega-3，多吃深海鱼、坚果、燕麦。",
    });
  }

  if (flags.includes("高尿酸")) {
    advice.push({
      priority: "high",
      condition: "高尿酸",
      message: "避免高嘌呤食物（内脏、部分海鲜、啤酒），每日饮水2000ml以上，多吃蔬菜水果。",
    });
  }

  // Goal-based recommendations (medium priority)
  if (user.goal === "lose" && user.weight) {
    const targetCal = Math.max(tdee - 300, 1200);
    const proteinTarget = Math.round(user.weight * 1.6);
    advice.push({
      priority: "medium",
      condition: "减重目标",
      message: `每日建议摄入 ${targetCal} kcal，蛋白质 ≥ ${proteinTarget}g（约体重×1.6g/kg），防止肌肉流失。`,
    });
  }

  if (user.goal === "gain" && user.weight) {
    const targetCal = tdee + 300;
    advice.push({
      priority: "medium",
      condition: "增重目标",
      message: `每日建议摄入 ${targetCal} kcal，少食多餐，每3-4小时进食一次，增加健康加餐。`,
    });
  }

  // Nutrition analysis (low priority)
  const proteinTarget = user.weight ? Math.round(user.weight * 1.2) : 60;
  if (todayEntries.length > 0 && todayProtein < proteinTarget * 0.6) {
    advice.push({
      priority: "low",
      condition: "营养均衡",
      message: `今天蛋白质摄入偏低（${todayProtein.toFixed(0)}/${proteinTarget}g），建议每餐搭配鸡蛋、牛奶、豆制品或瘦肉。`,
    });
  }

  if (todayCarbs > 200 && user.goal === "lose") {
    advice.push({
      priority: "low",
      condition: "碳水关注",
      message: "今日碳水摄入偏高，减重期间建议适当用粗粮（燕麦、红薯、玉米）替代精米白面。",
    });
  }

  // Default
  if (advice.length === 0) {
    advice.push({
      priority: "low",
      condition: "健康建议",
      message: "保持均衡饮食，每餐搭配主食+蛋白质+蔬菜，控制油盐摄入，坚持运动。",
    });
  }

  return advice.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}
