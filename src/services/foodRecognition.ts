import { prisma } from "@/lib/prisma";

export interface Candidate {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
}

export async function recognizeFood(): Promise<Candidate[]> {
  const count = await prisma.foodDatabase.count();
  const skip = Math.floor(Math.random() * Math.max(count - 5, 0));
  const foods = await prisma.foodDatabase.findMany({
    take: 5,
    skip,
  });
  return foods.map((food) => ({
    id: food.id,
    name: food.name,
    category: food.category,
    calories: food.calories,
    protein: food.protein,
    fat: food.fat,
    carbs: food.carbs,
    fiber: food.fiber,
    sugar: food.sugar,
  }));
}
