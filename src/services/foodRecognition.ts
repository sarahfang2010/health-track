import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

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

const AI_API_URL = "https://opencode.ai/zen/go/v1/chat/completions";
const AI_API_KEY = "sk-VEeGua9LQf8sg6lJpB3sEodxeUlNt5ii46Cr8AyO9TRhNSnWwm79SdbOElxsFM5V";
const AI_MODEL = "minimax-m3";

async function recognizeFoodWithAI(imagePath: string): Promise<string[]> {
  const imageBuffer = await fs.readFile(imagePath);
  const base64 = imageBuffer.toString("base64");
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "请识别这张图片中的食物，只返回食物名称（中文），每个食物一行，不要有其他内容。最多列出3个最可能的食物。",
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    console.error("AI API error:", response.status, await response.text());
    return [];
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";
  const content = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return content
    .split("\n")
    .map((line: string) => line.replace(/^\d+[\.\、\)]\s*/, "").trim())
    .filter((line: string) => line.length > 0)
    .slice(0, 5);
}

async function findFoodsByName(names: string[]): Promise<Candidate[]> {
  if (names.length === 0) return [];

  // Get all food database entries for matching
  const allFoods = await prisma.foodDatabase.findMany();
  const results: Candidate[] = [];
  const seen = new Set<string>();

  for (const aiName of names) {
    // Try exact match first
    let match = allFoods.find((f) => f.name === aiName);
    // Try: DB food name is contained in AI result
    if (!match) {
      match = allFoods.find((f) => aiName.includes(f.name));
    }
    // Try: AI result keyword matches DB food name
    if (!match) {
      match = allFoods.find((f) => f.name.includes(aiName));
    }
    if (match && !seen.has(match.id)) {
      seen.add(match.id);
      results.push({
        id: match.id,
        name: match.name,
        category: match.category,
        calories: match.calories,
        protein: match.protein,
        fat: match.fat,
        carbs: match.carbs,
        fiber: match.fiber,
        sugar: match.sugar,
      });
    }
  }
  return results;
}

export interface NutritionEstimate {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
}

export async function estimateNutrition(
  foodName: string,
  grams: number
): Promise<NutritionEstimate | null> {
  try {
    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          {
            role: "user",
            content: `请估算"${foodName}"每100克的营养成分。只返回一个JSON对象，格式如下：{"calories":数字,"protein":数字,"fat":数字,"carbs":数字,"fiber":数字,"sugar":数字}。单位都是克（g），热量是千卡（kcal）。不要有其他内容。`,
          },
        ],
        max_tokens: 400,
        temperature: 0,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "";
    // Strip think tags from minimax-m3
    const content = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const per100 = JSON.parse(jsonMatch[0]);
    const factor = grams / 100;

    return {
      calories: Math.round((per100.calories || 0) * factor),
      protein: parseFloat(((per100.protein || 0) * factor).toFixed(1)),
      fat: parseFloat(((per100.fat || 0) * factor).toFixed(1)),
      carbs: parseFloat(((per100.carbs || 0) * factor).toFixed(1)),
      fiber: parseFloat(((per100.fiber || 0) * factor).toFixed(1)),
      sugar: parseFloat(((per100.sugar || 0) * factor).toFixed(1)),
    };
  } catch (err) {
    console.error("AI nutrition estimation failed:", err);
    return null;
  }
}

export async function recognizeFood(
  imagePath?: string
): Promise<Candidate[]> {
  // If an image path is provided, try AI recognition
  if (imagePath) {
    try {
      const foodNames = await recognizeFoodWithAI(imagePath);
      const matches = await findFoodsByName(foodNames);
      if (matches.length > 0) return matches;
    } catch (err) {
      console.error("AI recognition failed, falling back to random:", err);
    }
  }

  // Fall back to random candidates
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
