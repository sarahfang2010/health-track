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
const AI_API_KEY = "sk-11zwewzuQHgp0AVb7uM7kB3NcaFtULXVwgy2dwf35iQrtTmSXJLFbyAlZFDSppVB";
const AI_MODEL = "mimo-v2.5";

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
  const content = data.choices?.[0]?.message?.content || "";
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
