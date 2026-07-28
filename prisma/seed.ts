import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const foods = [
  // 主食
  { name: "白米饭", category: "主食", calories: 116, protein: 2.6, fat: 0.3, carbs: 25.9, fiber: 0.3, sugar: 0.1 },
  { name: "馒头", category: "主食", calories: 223, protein: 7.0, fat: 1.1, carbs: 44.2, fiber: 1.3, sugar: 1.0 },
  { name: "面条(煮)", category: "主食", calories: 110, protein: 3.5, fat: 0.3, carbs: 22.0, fiber: 0.5, sugar: 0.2 },
  { name: "小米粥", category: "主食", calories: 46, protein: 1.4, fat: 0.7, carbs: 8.4, fiber: 0.3, sugar: 0.1 },
  { name: "全麦面包", category: "主食", calories: 246, protein: 10.0, fat: 3.4, carbs: 41.3, fiber: 6.0, sugar: 4.0 },
  { name: "红薯", category: "主食", calories: 86, protein: 1.6, fat: 0.1, carbs: 20.1, fiber: 3.0, sugar: 4.2 },
  { name: "玉米", category: "主食", calories: 112, protein: 4.0, fat: 1.2, carbs: 22.8, fiber: 2.9, sugar: 3.2 },
  { name: "燕麦片", category: "主食", calories: 367, protein: 13.5, fat: 6.7, carbs: 61.6, fiber: 10.1, sugar: 1.0 },
  { name: "饺子(猪肉白菜)", category: "主食", calories: 218, protein: 8.5, fat: 10.0, carbs: 24.0, fiber: 1.0, sugar: 1.5 },
  { name: "包子(猪肉大葱)", category: "主食", calories: 227, protein: 9.0, fat: 10.0, carbs: 25.0, fiber: 1.2, sugar: 1.8 },
  { name: "油条", category: "主食", calories: 388, protein: 6.9, fat: 17.6, carbs: 51.0, fiber: 0.9, sugar: 1.0 },
  { name: "粽子", category: "主食", calories: 195, protein: 4.5, fat: 4.0, carbs: 35.0, fiber: 1.5, sugar: 5.0 },
  // 肉类
  { name: "鸡胸肉", category: "肉类", calories: 133, protein: 31.0, fat: 1.2, carbs: 0, fiber: 0, sugar: 0 },
  { name: "猪瘦肉", category: "肉类", calories: 143, protein: 20.3, fat: 6.2, carbs: 1.5, fiber: 0, sugar: 0 },
  { name: "牛肉(瘦)", category: "肉类", calories: 125, protein: 22.0, fat: 4.0, carbs: 0.2, fiber: 0, sugar: 0 },
  { name: "羊腿肉", category: "肉类", calories: 161, protein: 20.0, fat: 8.5, carbs: 0, fiber: 0, sugar: 0 },
  { name: "猪排骨", category: "肉类", calories: 264, protein: 18.3, fat: 20.4, carbs: 0.7, fiber: 0, sugar: 0 },
  { name: "鸭肉", category: "肉类", calories: 240, protein: 15.5, fat: 19.7, carbs: 0.2, fiber: 0, sugar: 0 },
  { name: "鸡腿", category: "肉类", calories: 181, protein: 20.0, fat: 11.0, carbs: 0, fiber: 0, sugar: 0 },
  { name: "五花肉", category: "肉类", calories: 395, protein: 13.0, fat: 37.0, carbs: 2.4, fiber: 0, sugar: 0 },
  { name: "腊肉", category: "肉类", calories: 498, protein: 18.0, fat: 44.0, carbs: 6.0, fiber: 0, sugar: 3.0 },
  { name: "培根", category: "肉类", calories: 541, protein: 12.0, fat: 52.0, carbs: 1.5, fiber: 0, sugar: 1.0 },
  // 蔬菜
  { name: "西红柿", category: "蔬菜", calories: 19, protein: 0.9, fat: 0.2, carbs: 4.0, fiber: 1.2, sugar: 2.6 },
  { name: "黄瓜", category: "蔬菜", calories: 16, protein: 0.7, fat: 0.1, carbs: 2.9, fiber: 0.5, sugar: 1.7 },
  { name: "菠菜", category: "蔬菜", calories: 24, protein: 2.9, fat: 0.4, carbs: 3.6, fiber: 2.2, sugar: 0.4 },
  { name: "白菜", category: "蔬菜", calories: 13, protein: 1.5, fat: 0.2, carbs: 2.2, fiber: 1.0, sugar: 1.0 },
  { name: "西兰花", category: "蔬菜", calories: 36, protein: 3.0, fat: 0.4, carbs: 7.0, fiber: 2.6, sugar: 1.7 },
  { name: "胡萝卜", category: "蔬菜", calories: 37, protein: 1.0, fat: 0.2, carbs: 8.8, fiber: 2.8, sugar: 4.7 },
  { name: "土豆", category: "蔬菜", calories: 81, protein: 2.0, fat: 0.1, carbs: 17.5, fiber: 2.1, sugar: 0.8 },
  { name: "茄子", category: "蔬菜", calories: 23, protein: 1.0, fat: 0.2, carbs: 4.9, fiber: 3.0, sugar: 3.2 },
  { name: "青椒", category: "蔬菜", calories: 22, protein: 1.0, fat: 0.2, carbs: 4.6, fiber: 2.0, sugar: 2.4 },
  { name: "洋葱", category: "蔬菜", calories: 40, protein: 1.1, fat: 0.1, carbs: 9.1, fiber: 1.7, sugar: 4.2 },
  { name: "生菜", category: "蔬菜", calories: 15, protein: 1.4, fat: 0.2, carbs: 2.8, fiber: 1.3, sugar: 0.8 },
  { name: "冬瓜", category: "蔬菜", calories: 12, protein: 0.4, fat: 0.2, carbs: 2.4, fiber: 1.1, sugar: 1.2 },
  { name: "豆芽", category: "蔬菜", calories: 18, protein: 2.1, fat: 0.2, carbs: 2.5, fiber: 1.1, sugar: 0.5 },
  { name: "蘑菇", category: "蔬菜", calories: 23, protein: 2.7, fat: 0.3, carbs: 3.3, fiber: 2.0, sugar: 1.6 },
  { name: "豆腐", category: "蔬菜", calories: 82, protein: 8.1, fat: 3.7, carbs: 4.2, fiber: 0.4, sugar: 1.0 },
  { name: "海带", category: "蔬菜", calories: 13, protein: 1.2, fat: 0.1, carbs: 2.3, fiber: 0.5, sugar: 0.5 },
  // 蛋奶豆
  { name: "鸡蛋(煮)", category: "蛋奶豆", calories: 144, protein: 13.3, fat: 8.8, carbs: 2.8, fiber: 0, sugar: 1.0 },
  { name: "鸡蛋(炒)", category: "蛋奶豆", calories: 196, protein: 13.0, fat: 15.0, carbs: 2.0, fiber: 0, sugar: 1.0 },
  { name: "纯牛奶", category: "蛋奶豆", calories: 65, protein: 3.0, fat: 3.5, carbs: 4.9, fiber: 0, sugar: 4.9 },
  { name: "酸奶(原味)", category: "蛋奶豆", calories: 72, protein: 2.5, fat: 2.7, carbs: 9.3, fiber: 0, sugar: 9.3 },
  { name: "豆浆", category: "蛋奶豆", calories: 31, protein: 3.0, fat: 1.6, carbs: 1.2, fiber: 0.5, sugar: 0.5 },
  { name: "豆腐干", category: "蛋奶豆", calories: 140, protein: 16.2, fat: 7.6, carbs: 2.2, fiber: 0.8, sugar: 0.5 },
  // 水果
  { name: "苹果", category: "水果", calories: 53, protein: 0.3, fat: 0.2, carbs: 13.8, fiber: 2.4, sugar: 10.4 },
  { name: "香蕉", category: "水果", calories: 93, protein: 1.1, fat: 0.3, carbs: 22.8, fiber: 2.6, sugar: 12.2 },
  { name: "橙子", category: "水果", calories: 48, protein: 0.9, fat: 0.1, carbs: 11.8, fiber: 2.4, sugar: 9.4 },
  { name: "葡萄", category: "水果", calories: 69, protein: 0.7, fat: 0.2, carbs: 18.1, fiber: 0.9, sugar: 15.5 },
  { name: "西瓜", category: "水果", calories: 31, protein: 0.6, fat: 0.1, carbs: 7.6, fiber: 0.4, sugar: 6.2 },
  { name: "草莓", category: "水果", calories: 32, protein: 0.7, fat: 0.3, carbs: 7.7, fiber: 2.0, sugar: 5.0 },
  { name: "猕猴桃", category: "水果", calories: 61, protein: 1.1, fat: 0.5, carbs: 14.7, fiber: 3.0, sugar: 9.0 },
  { name: "火龙果", category: "水果", calories: 55, protein: 1.1, fat: 0.4, carbs: 13.0, fiber: 1.6, sugar: 8.5 },
  { name: "芒果", category: "水果", calories: 65, protein: 0.8, fat: 0.4, carbs: 17.0, fiber: 1.6, sugar: 14.0 },
  { name: "梨", category: "水果", calories: 51, protein: 0.4, fat: 0.1, carbs: 13.1, fiber: 3.1, sugar: 9.6 },
  { name: "樱桃", category: "水果", calories: 63, protein: 1.1, fat: 0.2, carbs: 16.0, fiber: 2.1, sugar: 12.8 },
  // 水产
  { name: "草鱼", category: "水产", calories: 113, protein: 17.7, fat: 4.3, carbs: 0, fiber: 0, sugar: 0 },
  { name: "虾仁", category: "水产", calories: 93, protein: 20.0, fat: 1.0, carbs: 0.2, fiber: 0, sugar: 0 },
  { name: "三文鱼", category: "水产", calories: 208, protein: 20.4, fat: 13.6, carbs: 0, fiber: 0, sugar: 0 },
  { name: "带鱼", category: "水产", calories: 127, protein: 17.7, fat: 5.6, carbs: 0, fiber: 0, sugar: 0 },
  { name: "螃蟹", category: "水产", calories: 95, protein: 12.6, fat: 4.5, carbs: 0.8, fiber: 0, sugar: 0 },
  // 饮品
  { name: "可口可乐", category: "饮品", calories: 42, protein: 0, fat: 0, carbs: 10.6, fiber: 0, sugar: 10.6 },
  { name: "橙汁", category: "饮品", calories: 45, protein: 0.7, fat: 0.1, carbs: 10.4, fiber: 0.2, sugar: 8.5 },
  { name: "啤酒", category: "饮品", calories: 32, protein: 0.4, fat: 0, carbs: 3.1, fiber: 0, sugar: 0 },
  { name: "拿铁咖啡", category: "饮品", calories: 56, protein: 2.5, fat: 2.8, carbs: 5.0, fiber: 0, sugar: 4.5 },
  { name: "绿茶", category: "饮品", calories: 1, protein: 0.1, fat: 0, carbs: 0, fiber: 0, sugar: 0 },
  // 零食
  { name: "薯片", category: "零食", calories: 548, protein: 6.0, fat: 37.0, carbs: 49.0, fiber: 3.0, sugar: 3.0 },
  { name: "巧克力", category: "零食", calories: 546, protein: 4.9, fat: 31.0, carbs: 60.0, fiber: 4.0, sugar: 50.0 },
  { name: "饼干", category: "零食", calories: 433, protein: 8.0, fat: 14.0, carbs: 68.0, fiber: 2.0, sugar: 20.0 },
  { name: "蛋糕", category: "零食", calories: 347, protein: 6.0, fat: 17.0, carbs: 43.0, fiber: 1.0, sugar: 25.0 },
  { name: "冰淇淋", category: "零食", calories: 207, protein: 3.5, fat: 11.0, carbs: 25.0, fiber: 0.5, sugar: 22.0 },
  { name: "坚果(混合)", category: "零食", calories: 607, protein: 20.0, fat: 53.0, carbs: 16.0, fiber: 8.0, sugar: 4.0 },
  // 油脂调味
  { name: "植物油", category: "油脂调味", calories: 899, protein: 0, fat: 99.9, carbs: 0, fiber: 0, sugar: 0 },
  { name: "酱油", category: "油脂调味", calories: 63, protein: 5.6, fat: 0.1, carbs: 10.1, fiber: 0, sugar: 1.0 },
  { name: "醋", category: "油脂调味", calories: 21, protein: 0.4, fat: 0, carbs: 4.9, fiber: 0, sugar: 3.0 },
  { name: "白糖", category: "油脂调味", calories: 400, protein: 0, fat: 0, carbs: 99.9, fiber: 0, sugar: 99.9 },
  // 常见菜肴（综合估算）
  { name: "番茄炒蛋", category: "菜肴", calories: 105, protein: 6.0, fat: 7.0, carbs: 5.0, fiber: 1.0, sugar: 3.0 },
  { name: "宫保鸡丁", category: "菜肴", calories: 178, protein: 16.0, fat: 10.0, carbs: 8.0, fiber: 1.5, sugar: 3.0 },
  { name: "麻婆豆腐", category: "菜肴", calories: 106, protein: 8.0, fat: 7.0, carbs: 4.0, fiber: 1.0, sugar: 1.5 },
  { name: "鱼香肉丝", category: "菜肴", calories: 154, protein: 12.0, fat: 9.0, carbs: 7.0, fiber: 1.0, sugar: 3.0 },
  { name: "回锅肉", category: "菜肴", calories: 252, protein: 14.0, fat: 18.0, carbs: 8.0, fiber: 1.0, sugar: 2.0 },
  { name: "清炒时蔬", category: "菜肴", calories: 45, protein: 2.0, fat: 3.0, carbs: 4.0, fiber: 2.0, sugar: 1.5 },
  { name: "蛋炒饭", category: "菜肴", calories: 188, protein: 6.5, fat: 7.0, carbs: 25.0, fiber: 1.0, sugar: 1.0 },
  { name: "红烧肉", category: "菜肴", calories: 305, protein: 12.0, fat: 26.0, carbs: 6.0, fiber: 0.5, sugar: 3.0 },
  { name: "酸辣土豆丝", category: "菜肴", calories: 89, protein: 2.0, fat: 4.0, carbs: 12.0, fiber: 1.5, sugar: 1.0 },
  { name: "水煮鱼", category: "菜肴", calories: 135, protein: 15.0, fat: 7.0, carbs: 3.0, fiber: 0.5, sugar: 1.0 },
];

async function main() {
  console.log("Seeding food database...");
  for (const food of foods) {
    await prisma.foodDatabase.create({ data: food });
  }
  console.log(`Seeded ${foods.length} foods.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
