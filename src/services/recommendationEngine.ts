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

  // Today's food entries
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayEntries = await prisma.foodEntry.findMany({
    where: { userId, consumedAt: { gte: startOfDay } },
  });

  const todayProtein = todayEntries.reduce((s, e) => s + e.protein, 0);
  const todayCarbs = todayEntries.reduce((s, e) => s + e.carbs, 0);
  const todayFat = todayEntries.reduce((s, e) => s + e.fat, 0);
  const todayCalories = todayEntries.reduce((s, e) => s + e.calories, 0);
  const mealCounts: Record<string, number> = {};
  todayEntries.forEach((e) => { mealCounts[e.mealType] = (mealCounts[e.mealType] || 0) + 1; });

  // Today's exercise
  const todayExercise = await prisma.exerciseEntry.findMany({
    where: { userId, date: { gte: startOfDay } },
  });
  const todayBurned = todayExercise.reduce((s, e) => s + e.caloriesBurned, 0);

  // BMR
  let bmr = 0;
  if (user.weight && user.height && user.age) {
    bmr = user.gender === "male"
      ? Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age + 5)
      : Math.round(10 * user.weight + 6.25 * user.height - 5 * user.age - 161);
  }
  const tdee = Math.round(bmr * 1.375);

  // Targets based on goal
  let targetCal = tdee;
  if (user.goal === "lose") targetCal = Math.max(tdee - 300, 1200);
  if (user.goal === "gain") targetCal = tdee + 300;

  const flags = latestReport?.flags ? latestReport.flags.split(",").filter(Boolean) : [];
  const advice: Advice[] = [];

  // ===== HEALTH-BASED (high priority) =====
  if (flags.includes("糖尿病风险") || flags.includes("血糖偏高")) {
    const highSugarFoods = todayEntries.filter(e => (e.sugar || 0) > 10 || (e.carbs > 50 && (e.fiber || 0) < 3));
    if (highSugarFoods.length > 0) {
      advice.push({
        priority: "high",
        condition: "血糖提醒",
        message: `您今天摄入的${highSugarFoods.map(e => e.foodName).join("、")}含糖或碳水较高且纤维偏低，可能引起血糖波动。建议替换为全谷物或搭配蔬菜同食，降低升糖速度。`,
      });
    } else if (todayEntries.length > 0) {
      advice.push({
        priority: "medium",
        condition: "血糖管理",
        message: "今日饮食搭配良好，建议继续保持低GI食物为主，每餐搭配足量蔬菜和优质蛋白，有助于稳定血糖。",
      });
    } else {
      advice.push({
        priority: "high",
        condition: "糖尿病风险",
        message: "检测到血糖偏高，建议今天选择低GI食物（如燕麦、糙米、全麦面包），避免精制碳水和含糖饮料。",
      });
    }
  }

  if (flags.includes("高血压")) {
    advice.push({
      priority: "high",
      condition: "血压管理",
      message: `今日已摄入${todayCalories}kcal。高血压期间建议每日钠摄入<2000mg，避免腌制食品和加工肉制品，多吃富含钾的菠菜、香蕉、土豆来帮助排钠。`,
    });
  }

  if (flags.includes("高血脂")) {
    const highFatFoods = todayEntries.filter(e => e.fat > 15);
    if (highFatFoods.length > 0) {
      advice.push({
        priority: "high",
        condition: "血脂提醒",
        message: `${highFatFoods.map(e => e.foodName).join("、")}脂肪含量较高。建议减少油炸和肥肉，多摄入深海鱼（三文鱼、鲭鱼）和坚果中的健康不饱和脂肪。`,
      });
    }
  }

  if (flags.includes("高尿酸")) {
    advice.push({
      priority: "high",
      condition: "尿酸管理",
      message: `今日饮水是否充足？高尿酸期间建议每日饮水2000ml以上以促进尿酸排泄，避免啤酒、内脏、部分海鲜（虾、贝类）等高嘌呤食物。`,
    });
  }

  // ===== REAL-TIME INTAKE ANALYSIS (medium priority) =====
  if (todayEntries.length > 0) {
    const calPct = targetCal > 0 ? Math.round((todayCalories / targetCal) * 100) : 0;

    // Over/under eating
    if (calPct > 90 && calPct <= 100) {
      advice.push({
        priority: "medium",
        condition: "热量接近上限",
        message: `您今日已摄入${todayCalories}kcal，达到目标${targetCal}kcal的${calPct}%。建议后续选择低热量高饱腹感的食物（如蔬菜汤、魔芋），不要再吃高热量零食。`,
      });
    } else if (calPct > 100) {
      advice.push({
        priority: "medium",
        condition: "热量超标",
        message: `您今日已摄入${todayCalories}kcal，超出目标${todayCalories - targetCal}kcal。建议晚餐尽量清淡，来一份蔬菜沙拉或清蒸鱼，明天可以适当增加运动消耗。`,
      });
    } else if (calPct < 30 && todayCalories > 0) {
      advice.push({
        priority: "low",
        condition: "摄入偏低",
        message: `目前仅摄入${todayCalories}kcal（目标${targetCal}kcal的${calPct}%），请注意保证足够的营养摄入，尤其是蛋白质，避免代谢下降。`,
      });
    }

    // Meal regularity
    const hasBreakfast = mealCounts.breakfast && mealCounts.breakfast > 0;
    const hasLunch = mealCounts.lunch && mealCounts.lunch > 0;
    const hasDinner = mealCounts.dinner && mealCounts.dinner > 0;
    const missingMeals = [];
    if (!hasBreakfast) missingMeals.push("早餐");
    if (!hasLunch) missingMeals.push("午餐");
    if (!hasDinner) missingMeals.push("晚餐");
    if (missingMeals.length > 0 && todayEntries.length < 3) {
      advice.push({
        priority: "medium",
        condition: "饮食规律",
        message: `您今天还未记录${missingMeals.join("、")}。规律三餐有助于维持代谢稳定，避免暴饮暴食。记得按时吃饭哦。`,
      });
    }

    // Protein check (more detailed)
    const proteinTarget = user.weight ? Math.round(user.weight * 1.2) : 60;
    const proteinPct = Math.round((todayProtein / proteinTarget) * 100);
    if (todayProtein < proteinTarget * 0.4) {
      advice.push({
        priority: "medium",
        condition: "蛋白质不足",
        message: `今日蛋白质仅摄入${todayProtein.toFixed(0)}g（目标${proteinTarget}g的${proteinPct}%），严重不足。立即补充：一杯牛奶（8g蛋白）、两个鸡蛋（12g蛋白）或一份鸡胸肉（30g蛋白）。`,
      });
    } else if (todayProtein < proteinTarget * 0.7) {
      advice.push({
        priority: "low",
        condition: "蛋白质偏低",
        message: `今日蛋白质${todayProtein.toFixed(0)}g，距离目标${proteinTarget}g还差${proteinTarget - Math.round(todayProtein)}g。晚餐可以加一份豆腐、鱼或瘦肉来补足。`,
      });
    }

    // Carb/fat balance
    if (todayFat > 0 && todayCarbs > 0) {
      const fatRatio = todayFat * 9 / todayCalories;
      if (fatRatio > 0.4) {
        advice.push({
          priority: "low",
          condition: "脂肪偏高",
          message: `今日脂肪供能占比约${Math.round(fatRatio * 100)}%，偏高。建议减少油炸和肥肉，增加蔬菜和粗粮的比例，让脂肪供能控制在30%以内。`,
        });
      }
    }

    // Fiber check
    const totalFiber = todayEntries.reduce((s, e) => s + (e.fiber || 0), 0);
    if (totalFiber < 10 && todayCalories > 500) {
      advice.push({
        priority: "low",
        condition: "纤维不足",
        message: `今日膳食纤维仅${totalFiber.toFixed(0)}g，建议每天摄入25-30g。多吃蔬菜（西兰花、菠菜）、水果（苹果、梨）和全谷物可以补足。`,
      });
    }
  }

  // ===== EXERCISE FEEDBACK =====
  if (todayBurned > 0) {
    advice.push({
      priority: "low",
      condition: "运动反馈",
      message: `今日运动消耗${todayBurned}kcal，干得好！运动后30分钟内补充蛋白质（如牛奶、鸡蛋）有助于肌肉恢复。净摄入${todayCalories - todayBurned}kcal。`,
    });
  } else if (todayCalories > targetCal * 0.6) {
    advice.push({
      priority: "low",
      condition: "运动建议",
      message: "今天还没有运动记录。哪怕只是散步20分钟，也能帮助消耗约70kcal，提升代谢水平。",
    });
  }

  // ===== GOAL-BASED (always show if body data set) =====
  if (user.goal === "lose" && user.weight && todayEntries.length === 0) {
    advice.push({
      priority: "low",
      condition: "减重提示",
      message: `今日目标${targetCal}kcal，建议早餐占30%（~${Math.round(targetCal * 0.3)}kcal）、午餐40%、晚餐30%。先吃蔬菜再吃主食，有助于控制食量。`,
    });
  }

  // ===== DEFAULT: still personalized =====
  if (advice.length === 0) {
    if (todayEntries.length === 0 && todayBurned === 0) {
      advice.push({
        priority: "low",
        condition: "开始记录吧",
        message: "新的一天，从记录第一餐开始！拍照或手动录入饮食，我会根据您的摄入给出实时分析和建议。",
      });
    } else {
      advice.push({
        priority: "low",
        condition: "今日总结",
        message: `今日摄入${todayCalories}kcal、消耗${todayBurned}kcal，净${todayCalories - todayBurned}kcal。整体不错，继续保持均衡饮食和适量运动。`,
      });
    }
  }

  return advice.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
}
