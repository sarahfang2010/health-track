# 饮食健康追踪应用 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 从零搭建一个基于 Next.js 的饮食热量识别与健康追踪 Web 应用，支持拍照记录饮食、体检档案管理、个性化饮食建议、运动追踪。

**Architecture:** Next.js 14 App Router 全栈应用，Prisma + SQLite 数据层，NextAuth.js 认证，shadcn/ui + Tailwind CSS 前端，Server Actions 处理数据变更，API Routes 处理文件上传。

**Tech Stack:** Next.js 14.2, TypeScript 5, Prisma 5, SQLite, NextAuth.js 5 (Auth.js), shadcn/ui, Tailwind CSS 3, bcryptjs, uuid

## Global Constraints

- 包管理器: npm
- 项目路径: `C:/Users/sarah/projects/health-track`
- Next.js 版本: 14 (App Router)
- 数据库: SQLite (文件: `prisma/dev.db`)
- 文件上传目录: `public/uploads/`
- 密码哈希: bcryptjs
- 会话: JWT (NextAuth.js)
- 每页响应式: 移动端全宽, 桌面端 max-w-2xl 居中
- 登录凭据: 手机号/用户名 + 密码

---

### Task 1: 项目脚手架与数据库

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/prisma.ts`
- Create: `.env.local`
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`

**Interfaces:**
- Produces: Prisma client singleton (`src/lib/prisma.ts`), database with all 7 models, 80+ seed foods

- [ ] **Step 1: Initialize Next.js project**

```bash
cd "C:/Users/sarah/projects/health-track"
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbo --use-npm
```

Expected: package.json, tsconfig.json, next.config.ts 等文件创建完成

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client next-auth@beta bcryptjs uuid
npm install -D @types/bcryptjs @types/uuid
npx prisma init --datasource-provider sqlite
```

Expected: `prisma/schema.prisma` 创建, `node_modules` 有上述包

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Expected: `components.json` 创建, `src/lib/utils.ts` 创建

- [ ] **Step 4: Write Prisma schema**

Write `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  account   String   @unique
  password  String
  age       Int?
  gender    String?
  height    Float?
  weight    Float?
  goal      String   @default("maintain")
  createdAt DateTime @default(now())

  healthReports HealthReport[]
  foodEntries   FoodEntry[]
  exerciseEntries ExerciseEntry[]
  dailySummaries DailySummary[]
}

model HealthReport {
  id                    String   @id @default(uuid())
  userId                String
  reportDate            DateTime @default(now())
  bloodSugar            Float?
  bloodPressureSystolic  Int?
  bloodPressureDiastolic Int?
  totalCholesterol      Float?
  hdl                   Float?
  ldl                   Float?
  triglycerides         Float?
  uricAcid              Float?
  flags                 String   @default("")
  reportImageUrl        String?
  notes                 String?
  createdAt             DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model FoodEntry {
  id         String   @id @default(uuid())
  userId     String
  mealType   String
  foodName   String
  portion    String?
  calories   Float
  protein    Float
  fat        Float
  carbs      Float
  fiber      Float?
  sugar      Float?
  imageUrl   String?
  source     String
  consumedAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ExerciseEntry {
  id              String   @id @default(uuid())
  userId          String
  activityType    String
  durationMinutes Float
  caloriesBurned  Float
  steps           Int?
  source          String   @default("manual")
  date            DateTime @default(now())
  notes           String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model DailySummary {
  id              String   @id @default(uuid())
  userId          String
  date            DateTime
  totalCaloriesIn  Float    @default(0)
  totalCaloriesOut Float    @default(0)
  totalProtein    Float    @default(0)
  totalFat        Float    @default(0)
  totalCarbs      Float    @default(0)
  calorieBalance  Float    @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model FoodDatabase {
  id       String @id @default(uuid())
  name     String
  category String
  calories Float
  protein  Float
  fat      Float
  carbs    Float
  fiber    Float  @default(0)
  sugar    Float  @default(0)
}
```

- [ ] **Step 5: Create Prisma client singleton**

Write `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 6: Configure .env.local**

Write `.env.local`:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="dev-secret-change-in-production-abc123"
AUTH_URL="http://localhost:3000"
```

- [ ] **Step 7: Run Prisma migration and generate**

```bash
npx prisma migrate dev --name init
```

Expected: `prisma/dev.db` 和 `prisma/migrations/` 创建, 输出 "Your database is now in sync"

- [ ] **Step 8: Write seed script**

Write `prisma/seed.ts`:

```typescript
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
```

- [ ] **Step 9: Configure seed script in package.json**

Add to `package.json`:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

- [ ] **Step 10: Install tsx and run seed**

```bash
npm install -D tsx
npx prisma db seed
```

Expected: 输出 "Seeded 82 foods."

- [ ] **Step 11: Write globals.css**

Write `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 10%;
    --primary: 160 30% 30%;
    --primary-foreground: 0 0% 100%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --border: 0 0% 90%;
    --ring: 160 30% 30%;
    --radius: 0.5rem;
  }
}
```

- [ ] **Step 12: Write minimal app layout**

Write `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "健康追踪",
  description: "饮食热量识别与健康管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 13: Start dev server to verify**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: blank white page, no errors in console.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Prisma schema and food database seed"
```

---

### Task 2: 认证系统 (NextAuth.js)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/middleware.ts`

**Interfaces:**
- Produces: `auth()` and `signIn()` from `src/lib/auth.ts`, protected routes via middleware
- Consumes: Prisma schema (Task 1), `AUTH_SECRET` from `.env.local` (Task 1)

- [ ] **Step 1: Add shadcn input, button, card, label components**

```bash
npx shadcn@latest add button input card label
```

- [ ] **Step 2: Install bcryptjs types**

```bash
npm install -D @types/bcryptjs
```

- [ ] **Step 3: Write auth configuration**

Write `src/lib/auth.ts`:

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        account: { label: "手机号/用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.account || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { account: credentials.account as string },
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 4: Write API route for NextAuth**

Write `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 5: Write auth middleware**

Write `src/middleware.ts`:

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname === "/login";

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|uploads).*)"],
};
```

- [ ] **Step 6: Verify middleware redirects to /login**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: redirect to `/login`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add NextAuth.js credentials authentication with middleware protection"
```

---

### Task 3: 登录/注册页面

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/lib/actions.ts`

**Interfaces:**
- Produces: Login/register page at `/login`, server actions for sign-up and sign-in
- Consumes: `auth()`, `signIn()` from `src/lib/auth.ts` (Task 2)

- [ ] **Step 1: Write server actions for registration and login**

Write `src/lib/actions.ts`:

```typescript
"use server";

import { hash } from "bcryptjs";
import { prisma } from "./prisma";
import { signIn } from "./auth";

export async function register(formData: FormData) {
  const account = formData.get("account") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!account || !password || !name) {
    return { error: "请填写所有必填字段" };
  }

  if (password.length < 6) {
    return { error: "密码至少6位" };
  }

  const existing = await prisma.user.findUnique({
    where: { account },
  });

  if (existing) {
    return { error: "该账号已被注册" };
  }

  const hashed = await hash(password, 10);
  await prisma.user.create({
    data: { account, password: hashed, name },
  });

  await signIn("credentials", { account, password, redirectTo: "/" });
}

export async function login(formData: FormData) {
  const account = formData.get("account") as string;
  const password = formData.get("password") as string;

  if (!account || !password) {
    return { error: "请输入账号和密码" };
  }

  try {
    await signIn("credentials", { account, password, redirectTo: "/" });
  } catch {
    return { error: "账号或密码错误" };
  }
}
```

- [ ] **Step 2: Write login page**

Write `src/app/login/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { register, login } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "处理中..." : text}
    </Button>
  );
}

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const result = isRegister ? await register(formData) : await login(formData);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">🍎 健康追踪</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            {isRegister && (
              <div className="space-y-1">
                <Label htmlFor="name">昵称</Label>
                <Input id="name" name="name" placeholder="你的名字" required />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="account">手机号 / 用户名</Label>
              <Input
                id="account"
                name="account"
                placeholder="输入手机号或用户名"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="输入密码"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <SubmitButton text={isRegister ? "注册" : "登录"} />
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {isRegister ? "已有账号？" : "没有账号？"}
            <button
              type="button"
              className="ml-1 text-primary underline"
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
            >
              {isRegister ? "去登录" : "去注册"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Verify login flow**

```bash
npm run dev
```

1. Open `http://localhost:3000` → redirect to `/login`
2. Click "去注册" → fill form → submit → redirect to `/` (blank page, no error)
3. Verify user exists: `npx prisma studio`, check User table

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add login and registration page with server actions"
```

---

### Task 4: 应用布局与导航

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/mobile-nav.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Produces: `AppShell` wrapper component with header and mobile bottom nav
- Consumes: `auth()` from Task 2, `signOut` from Task 2

- [ ] **Step 1: Add shadcn separator component**

```bash
npx shadcn@latest add separator
```

- [ ] **Step 2: Write header component**

Write `src/components/layout/header.tsx`:

```typescript
import Link from "next/link";
import { signOut, auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-semibold text-lg">
          🍎 健康追踪
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {session?.user?.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              退出
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Write mobile bottom nav**

Write `src/components/layout/mobile-nav.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "首页", icon: "📊" },
  { href: "/food", label: "饮食", icon: "🍽️" },
  { href: "/exercise", label: "运动", icon: "🏃" },
  { href: "/health", label: "健康", icon: "❤️" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-xs px-3 py-1 rounded-lg transition-colors ${
                isActive
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Write app shell component**

Write `src/components/layout/app-shell.tsx`:

```typescript
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 5: Update root layout**

Modify `src/app/layout.tsx` — replace the `{children}` with:

```typescript
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "健康追踪",
  description: "饮食热量识别与健康管理",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Verify layout renders**

```bash
npm run dev
```

Login, then visit `http://localhost:3000`. Expected: header visible at top, mobile nav visible at bottom on narrow viewport.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add app shell with header and mobile bottom navigation"
```

---

### Task 5: 饮食记录 API

**Files:**
- Create: `src/app/api/food/route.ts`
- Create: `src/app/api/food/recognize/route.ts`
- Create: `src/services/foodRecognition.ts`
- Create: `public/uploads/.gitkeep`

**Interfaces:**
- Produces: `GET /api/food?date=YYYY-MM-DD` returns food entries, `POST /api/food` creates entry, `POST /api/food/recognize` returns mock candidates
- Consumes: Prisma schema (Task 1)

- [ ] **Step 1: Write food recognition service**

Write `src/services/foodRecognition.ts`:

```typescript
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
  return foods;
}
```

- [ ] **Step 2: Write food API route**

Write `src/app/api/food/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  let startOfDay: Date, endOfDay: Date;
  if (date) {
    startOfDay = new Date(date);
    endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
  }

  const entries = await prisma.foodEntry.findMany({
    where: {
      userId: session.user.id,
      consumedAt: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { consumedAt: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { mealType, foodName, portion, calories, protein, fat, carbs, fiber, sugar, imageUrl, source, consumedAt } = body;

  const entry = await prisma.foodEntry.create({
    data: {
      userId: session.user.id,
      mealType: mealType || "snack",
      foodName,
      portion: portion || null,
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbs: parseFloat(carbs),
      fiber: fiber ? parseFloat(fiber) : null,
      sugar: sugar ? parseFloat(sugar) : null,
      imageUrl: imageUrl || null,
      source: source || "manual",
      consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
```

- [ ] **Step 3: Write recognition API route**

Write `src/app/api/food/recognize/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { recognizeFood } from "@/services/foodRecognition";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return NextResponse.json({ error: "请上传图片" }, { status: 400 });
  }

  // Save file
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `${Date.now()}-${file.name}`;
  const fs = await import("fs/promises");
  const path = await import("path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), buffer);
  const imageUrl = `/uploads/${filename}`;

  // Simulated recognition — returns candidates from food database
  const candidates = await recognizeFood();

  return NextResponse.json({ imageUrl, candidates });
}
```

- [ ] **Step 4: Test API with curl**

Start dev server, then:

```bash
# Test GET
curl -X GET "http://localhost:3000/api/food" -H "Cookie: <your-session-cookie>"
# Expected: [] (empty array)

# Test recognition
curl -X POST "http://localhost:3000/api/food/recognize" \
  -F "image=@some_test_image.jpg" \
  -H "Cookie: <your-session-cookie>"
# Expected: { imageUrl: "/uploads/...", candidates: [...] }
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add food CRUD API and simulated photo recognition endpoint"
```

---

### Task 6: 饮食记录页面 (拍照 + 手动录入 + 历史)

**Files:**
- Create: `src/app/food/page.tsx`
- Create: `src/app/food/history/page.tsx`
- Create: `src/components/food/photo-upload.tsx`
- Create: `src/components/food/food-entry-form.tsx`
- Create: `src/components/food/food-list.tsx`

**Interfaces:**
- Consumes: `GET/POST /api/food`, `POST /api/food/recognize` (Task 5)
- Produces: Working food logging UI with photo upload, candidate selection, manual entry

- [ ] **Step 1: Add shadcn dialog, select, scroll-area components**

```bash
npx shadcn@latest add dialog select scroll-area
```

- [ ] **Step 2: Write photo upload component**

Write `src/components/food/photo-upload.tsx`:

```typescript
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Candidate } from "@/services/foodRecognition";

interface Props {
  onConfirm: (candidate: Candidate) => void;
}

export function PhotoUpload({ onConfirm }: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setLoading(true);
    setPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch("/api/food/recognize", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setCandidates(data.candidates || []);
    setLoading(false);
    setOpen(true);
  }

  function handleSelect(c: Candidate) {
    onConfirm(c);
    setOpen(false);
    setCandidates([]);
    setPreview(null);
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <Button
        size="lg"
        className="w-full h-20 text-lg gap-2"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
      >
        📷 {loading ? "识别中..." : "拍照识别食物"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>选择最接近的食物</DialogTitle>
          </DialogHeader>
          {preview && (
            <img
              src={preview}
              alt="food"
              className="w-full h-40 object-cover rounded-lg"
            />
          )}
          <div className="space-y-2 max-h-60 overflow-auto">
            {candidates.map((c) => (
              <button
                key={c.id}
                className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
                onClick={() => handleSelect(c)}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-sm text-muted-foreground">
                  {c.category} · {c.calories} kcal/100g
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

- [ ] **Step 3: Write food entry form (manual)**

Write `src/components/food/food-entry-form.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Candidate } from "@/services/foodRecognition";

interface Props {
  prefilled?: Candidate;
  onSaved: () => void;
}

export function FoodEntryForm({ prefilled, onSaved }: Props) {
  const [foodName, setFoodName] = useState("");
  const [category, setCategory] = useState("");
  const [grams, setGrams] = useState(100);
  const [mealType, setMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (prefilled) {
      setFoodName(prefilled.name);
      setCategory(prefilled.category);
    }
  }, [prefilled]);

  const per100 = prefilled;
  const factor = grams / 100;

  async function handleSave() {
    setSaving(true);
    await fetch("/api/food", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        foodName,
        mealType,
        portion: `${grams}g`,
        calories: per100 ? per100.calories * factor : 0,
        protein: per100 ? per100.protein * factor : 0,
        fat: per100 ? per100.fat * factor : 0,
        carbs: per100 ? per100.carbs * factor : 0,
        fiber: per100 ? per100.fiber * factor : 0,
        sugar: per100 ? per100.sugar * factor : 0,
        source: per100 ? "photo" : "manual",
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        {prefilled ? "📷 已识别食物" : "✏️ 手动录入"}
      </div>
      <div className="space-y-1">
        <Label>食物名称</Label>
        <Input value={foodName} onChange={(e) => setFoodName(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label>份量 (克)</Label>
        <Input
          type="number"
          value={grams}
          onChange={(e) => setGrams(Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label>餐别</Label>
        <select
          className="w-full border rounded-md p-2 text-sm"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="breakfast">早餐</option>
          <option value="lunch">午餐</option>
          <option value="dinner">晚餐</option>
          <option value="snack">加餐/零食</option>
        </select>
      </div>
      {per100 && (
        <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
          <div>热量: {(per100.calories * factor).toFixed(0)} kcal</div>
          <div>蛋白质: {(per100.protein * factor).toFixed(1)}g</div>
          <div>脂肪: {(per100.fat * factor).toFixed(1)}g</div>
          <div>碳水: {(per100.carbs * factor).toFixed(1)}g</div>
        </div>
      )}
      <Button onClick={handleSave} disabled={saving || !foodName} className="w-full">
        {saving ? "保存中..." : "保存记录"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Write food list component**

Write `src/components/food/food-list.tsx`:

```typescript
interface FoodEntry {
  id: string;
  foodName: string;
  mealType: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: string | null;
  imageUrl: string | null;
  source: string;
  consumedAt: string;
}

const mealLabels: Record<string, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

interface Props {
  entries: FoodEntry[];
}

export function FoodList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        今天还没有记录，拍张照或手动添加吧
      </p>
    );
  }

  let totalCal = 0;
  let totalProtein = 0;

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        totalCal += entry.calories;
        totalProtein += entry.protein;
        return (
          <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg">
            {entry.imageUrl ? (
              <img src={entry.imageUrl} alt="" className="w-14 h-14 rounded object-cover" />
            ) : (
              <div className="w-14 h-14 rounded bg-muted flex items-center justify-center text-xl">
                🍽️
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{entry.foodName}</div>
              <div className="text-xs text-muted-foreground">
                {mealLabels[entry.mealType] || entry.mealType}
                {entry.portion ? ` · ${entry.portion}` : ""}
                {entry.source === "photo" ? " · 📷" : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{entry.calories} kcal</div>
              <div className="text-xs text-muted-foreground">
                蛋白 {entry.protein}g
              </div>
            </div>
          </div>
        );
      })}
      <div className="text-sm text-muted-foreground text-center pt-2 border-t">
        今日合计：{totalCal} kcal · 蛋白质 {totalProtein.toFixed(1)}g
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Write food page**

Write `src/app/food/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PhotoUpload } from "@/components/food/photo-upload";
import { FoodEntryForm } from "@/components/food/food-entry-form";
import { FoodList } from "@/components/food/food-list";
import { Button } from "@/components/ui/button";
import { Candidate } from "@/services/foodRecognition";
import Link from "next/link";

export default function FoodPage() {
  const [entries, setEntries] = useState([]);
  const [showManual, setShowManual] = useState(false);
  const [candidate, setCandidate] = useState<Candidate | undefined>();

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/food");
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function handlePhotoConfirm(c: Candidate) {
    setCandidate(c);
    setShowManual(false);
  }

  function handleSaved() {
    setCandidate(undefined);
    setShowManual(false);
    fetchEntries();
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">饮食记录</h1>
        <Link href="/food/history" className="text-sm text-primary">
          历史记录 →
        </Link>
      </div>

      <div className="space-y-3">
        <PhotoUpload onConfirm={handlePhotoConfirm} />

        {!showManual && !candidate && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowManual(true)}
          >
            ✏️ 手动录入
          </Button>
        )}

        {showManual && !candidate && (
          <FoodEntryForm onSaved={handleSaved} />
        )}

        {candidate && (
          <FoodEntryForm prefilled={candidate} onSaved={handleSaved} />
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          今日记录
        </h2>
        <FoodList entries={entries} />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 6: Write food history page**

Write `src/app/food/history/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { FoodList } from "@/components/food/food-list";
import Link from "next/link";

export default function FoodHistoryPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`/api/food?date=${date}`)
      .then((r) => r.json())
      .then(setEntries);
  }, [date]);

  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <Link href="/food" className="text-sm text-primary">
          ← 返回
        </Link>
        <h1 className="text-lg font-semibold">饮食历史</h1>
        <div className="w-10" />
      </div>

      <div className="mb-4">
        <input
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        />
      </div>

      <FoodList entries={entries} />
    </AppShell>
  );
}
```

- [ ] **Step 7: Verify food logging flow**

```bash
npm run dev
```

1. Login, go to `/food`
2. Click "手动录入" → fill form → save → entry appears in list
3. Total updates correctly

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add food logging UI with photo upload, manual entry, and history"
```

---

### Task 7: 体检档案 API + UI

**Files:**
- Create: `src/app/api/health/route.ts`
- Create: `src/app/health/page.tsx`
- Create: `src/app/health/new/page.tsx`
- Create: `src/components/health/report-card.tsx`
- Create: `src/components/health/report-form.tsx`
- Create: `src/services/reportParser.ts`

**Interfaces:**
- Produces: `GET /api/health` returns reports, `POST /api/health` creates with automatic flags
- Consumes: Prisma schema (Task 1), auth (Task 2)

- [ ] **Step 1: Write report parser service (flags auto-detection)**

Write `src/services/reportParser.ts`:

```typescript
export interface ReportInput {
  bloodSugar?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  totalCholesterol?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  uricAcid?: number;
}

export function computeFlags(data: ReportInput): string[] {
  const flags: string[] = [];

  // 糖尿病风险：空腹血糖 ≥ 7.0 mmol/L
  if (data.bloodSugar && data.bloodSugar >= 7.0) {
    flags.push("糖尿病风险");
  } else if (data.bloodSugar && data.bloodSugar >= 6.1) {
    flags.push("血糖偏高");
  }

  // 高血压：收缩压 ≥ 140 或 舒张压 ≥ 90
  if (
    (data.bloodPressureSystolic && data.bloodPressureSystolic >= 140) ||
    (data.bloodPressureDiastolic && data.bloodPressureDiastolic >= 90)
  ) {
    flags.push("高血压");
  }

  // 高血脂：总胆固醇 ≥ 6.2 或 LDL ≥ 4.1 或 甘油三酯 ≥ 2.3
  if (
    (data.totalCholesterol && data.totalCholesterol >= 6.2) ||
    (data.ldl && data.ldl >= 4.1) ||
    (data.triglycerides && data.triglycerides >= 2.3)
  ) {
    flags.push("高血脂");
  }

  // 高尿酸：男性 > 420, 女性 > 360 (简化处理，用通用阈值)
  if (data.uricAcid && data.uricAcid > 420) {
    flags.push("高尿酸");
  }

  return flags;
}
```

- [ ] **Step 2: Write health API route**

Write `src/app/api/health/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeFlags } from "@/services/reportParser";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const reports = await prisma.healthReport.findMany({
    where: { userId: session.user.id },
    orderBy: { reportDate: "desc" },
  });

  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const flags = computeFlags(body);
  const flagsStr = flags.join(",");

  const report = await prisma.healthReport.create({
    data: {
      userId: session.user.id,
      reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
      bloodSugar: body.bloodSugar ?? null,
      bloodPressureSystolic: body.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: body.bloodPressureDiastolic ?? null,
      totalCholesterol: body.totalCholesterol ?? null,
      hdl: body.hdl ?? null,
      ldl: body.ldl ?? null,
      triglycerides: body.triglycerides ?? null,
      uricAcid: body.uricAcid ?? null,
      flags: flagsStr,
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json({ ...report, flagsArray: flags }, { status: 201 });
}
```

- [ ] **Step 3: Write report card component**

Write `src/components/health/report-card.tsx`:

```typescript
interface HealthReport {
  id: string;
  reportDate: string;
  bloodSugar: number | null;
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  totalCholesterol: number | null;
  hdl: number | null;
  ldl: number | null;
  triglycerides: number | null;
  uricAcid: number | null;
  flags: string;
  notes: string | null;
}

export function ReportCard({ report }: { report: HealthReport }) {
  const flagsArr = report.flags ? report.flags.split(",").filter(Boolean) : [];
  const date = new Date(report.reportDate).toLocaleDateString("zh-CN");

  const hasData =
    report.bloodSugar ||
    report.bloodPressureSystolic ||
    report.totalCholesterol ||
    report.uricAcid;

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium">{date}</span>
        {flagsArr.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {flagsArr.map((f) => (
              <span
                key={f}
                className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200"
              >
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
      {hasData ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {report.bloodSugar && (
            <div>
              血糖: <span className="font-medium">{report.bloodSugar}</span> mmol/L
            </div>
          )}
          {report.bloodPressureSystolic && (
            <div>
              血压: <span className="font-medium">
                {report.bloodPressureSystolic}/{report.bloodPressureDiastolic}
              </span> mmHg
            </div>
          )}
          {report.totalCholesterol && (
            <div>
              总胆固醇: <span className="font-medium">{report.totalCholesterol}</span> mmol/L
            </div>
          )}
          {report.uricAcid && (
            <div>
              尿酸: <span className="font-medium">{report.uricAcid}</span> μmol/L
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">未录入指标</p>
      )}
      {report.notes && (
        <p className="text-xs text-muted-foreground">{report.notes}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Write report form**

Write `src/components/health/report-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fields = [
  { name: "bloodSugar", label: "空腹血糖 (mmol/L)", placeholder: "如: 5.6" },
  { name: "bloodPressureSystolic", label: "收缩压 (mmHg)", placeholder: "如: 120" },
  { name: "bloodPressureDiastolic", label: "舒张压 (mmHg)", placeholder: "如: 80" },
  { name: "totalCholesterol", label: "总胆固醇 (mmol/L)", placeholder: "如: 4.5" },
  { name: "hdl", label: "HDL 高密度脂蛋白 (mmol/L)", placeholder: "如: 1.2" },
  { name: "ldl", label: "LDL 低密度脂蛋白 (mmol/L)", placeholder: "如: 2.6" },
  { name: "triglycerides", label: "甘油三酯 (mmol/L)", placeholder: "如: 1.5" },
  { name: "uricAcid", label: "尿酸 (μmol/L)", placeholder: "如: 350" },
];

export function ReportForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fields.forEach((f) => {
      const val = formData.get(f.name) as string;
      if (val) data[f.name] = parseFloat(val);
    });
    const notes = formData.get("notes") as string;
    if (notes) data.notes = notes;
    data.reportDate = formData.get("reportDate") as string;

    await fetch("/api/health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.push("/health");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>报告日期</Label>
        <Input
          name="reportDate"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
        />
      </div>
      {fields.map((f) => (
        <div key={f.name} className="space-y-1">
          <Label>{f.label}</Label>
          <Input name={f.name} type="number" step="0.1" placeholder={f.placeholder} />
        </div>
      ))}
      <div className="space-y-1">
        <Label>备注</Label>
        <Input name="notes" placeholder="其他说明（可选）" />
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "保存中..." : "保存体检报告"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: Write health page**

Write `src/app/health/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ReportCard } from "@/components/health/report-card";
import Link from "next/link";

export default function HealthPage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setReports);
  }, []);

  const latest = reports[0];
  const older = reports.slice(1);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">健康档案</h1>
        <Link href="/health/new" className="text-sm text-primary">
          + 新建报告
        </Link>
      </div>

      {latest ? (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            最新报告
          </h2>
          <ReportCard report={latest} />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-3xl mb-2">❤️</p>
          <p>还没有体检记录</p>
          <Link href="/health/new" className="text-primary text-sm mt-2 inline-block">
            录入第一份报告
          </Link>
        </div>
      )}

      {older.length > 0 && (
        <>
          <h2 className="text-sm font-medium text-muted-foreground mt-6 mb-2">
            历史报告
          </h2>
          <div className="space-y-2">
            {older.map((r: { id: string }) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
```

- [ ] **Step 6: Write new health report page**

Write `src/app/health/new/page.tsx`:

```typescript
import { AppShell } from "@/components/layout/app-shell";
import { ReportForm } from "@/components/health/report-form";
import Link from "next/link";

export default function NewHealthPage() {
  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/health" className="text-sm text-primary">
          ← 返回
        </Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">新建体检报告</h1>
      <ReportForm />
    </AppShell>
  );
}
```

- [ ] **Step 7: Test the flow**

```bash
npm run dev
```

1. Go to `/health` → shows empty state
2. Click "录入第一份报告" → fill form with bloodSugar=7.5 → save
3. Go back to `/health` → see report with "糖尿病风险" flag

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add health report CRUD with automatic health risk flag detection"
```

---

### Task 8: 推荐引擎 + 仪表盘

**Files:**
- Create: `src/services/recommendationEngine.ts`
- Create: `src/app/api/recommendations/route.ts`
- Create: `src/components/dashboard/advice-card.tsx`
- Create: `src/components/dashboard/calorie-ring.tsx`
- Create: `src/components/dashboard/quick-actions.tsx`
- Create: `src/app/page.tsx` (dashboard)
- Create: `src/app/recommendations/page.tsx`

**Interfaces:**
- Produces: Dashboard page with calorie ring, advice cards, quick actions; recommendations page
- Consumes: Food API (Task 5), Health API (Task 7), `recommendationEngine` service

- [ ] **Step 1: Write recommendation engine**

Write `src/services/recommendationEngine.ts`:

```typescript
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
  const todayCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);

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
```

- [ ] **Step 2: Write recommendations API**

Write `src/app/api/recommendations/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getRecommendations } from "@/services/recommendationEngine";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const advice = await getRecommendations(session.user.id);
  return NextResponse.json(advice);
}
```

- [ ] **Step 3: Write calorie ring component**

Write `src/components/dashboard/calorie-ring.tsx`:

```typescript
interface Props {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: Props) {
  const pct = Math.min((consumed / target) * 100, 100);
  const remaining = target - consumed;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#eee" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={pct > 90 ? "#ef4444" : "#16a34a"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 327} 327`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{consumed}</span>
          <span className="text-xs text-muted-foreground">/ {target} kcal</span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        {remaining > 0 ? `还可摄入 ${remaining} kcal` : `已超出 ${Math.abs(remaining)} kcal`}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Write advice card component**

Write `src/components/dashboard/advice-card.tsx`:

```typescript
interface Advice {
  priority: string;
  condition: string;
  message: string;
}

const priorityColors: Record<string, string> = {
  high: "border-red-200 bg-red-50",
  medium: "border-yellow-200 bg-yellow-50",
  low: "border-blue-200 bg-blue-50",
};

const priorityIcons: Record<string, string> = {
  high: "⚠️",
  medium: "💡",
  low: "ℹ️",
};

export function AdviceCard({ advice }: { advice: Advice }) {
  return (
    <div className={`p-3 rounded-lg border ${priorityColors[advice.priority] || priorityColors.low}`}>
      <div className="flex items-center gap-2 mb-1">
        <span>{priorityIcons[advice.priority] || "ℹ️"}</span>
        <span className="text-sm font-medium">{advice.condition}</span>
      </div>
      <p className="text-sm">{advice.message}</p>
    </div>
  );
}
```

- [ ] **Step 5: Write quick actions component**

Write `src/components/dashboard/quick-actions.tsx`:

```typescript
import Link from "next/link";

const actions = [
  { href: "/food", label: "记饮食", icon: "🍽️", color: "bg-green-50 border-green-200" },
  { href: "/exercise", label: "记运动", icon: "🏃", color: "bg-blue-50 border-blue-200" },
  { href: "/health", label: "健康档案", icon: "❤️", color: "bg-pink-50 border-pink-200" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((a) => (
        <Link
          key={a.href}
          href={a.href}
          className={`flex flex-col items-center gap-1 p-4 rounded-lg border ${a.color} hover:shadow-sm transition-shadow`}
        >
          <span className="text-2xl">{a.icon}</span>
          <span className="text-sm font-medium">{a.label}</span>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Write dashboard page (/)**

Write `src/app/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { AdviceCard } from "@/components/dashboard/advice-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getRecommendations } from "@/services/recommendationEngine";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  // Today's food
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todayEntries = await prisma.foodEntry.findMany({
    where: {
      userId: session.user.id,
      consumedAt: { gte: startOfDay },
    },
  });
  const todayCalories = todayEntries.reduce((s, e) => s + e.calories, 0);

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
        <CalorieRing consumed={todayCalories} target={targetCal} />

        <QuickActions />

        {topAdvice.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                个性化建议
              </h2>
              <Link
                href="/recommendations"
                className="text-xs text-primary"
              >
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
```

- [ ] **Step 7: Write recommendations detail page**

Write `src/app/recommendations/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AdviceCard } from "@/components/dashboard/advice-card";
import Link from "next/link";

export default function RecommendationsPage() {
  const [advice, setAdvice] = useState([]);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => r.json())
      .then(setAdvice);
  }, []);

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary">
          ← 返回首页
        </Link>
      </div>
      <h1 className="text-xl font-semibold mb-4">全部建议</h1>
      <div className="space-y-2">
        {advice.map((a: { priority: string; condition: string; message: string }, i: number) => (
          <AdviceCard key={i} advice={a} />
        ))}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 8: Verify dashboard**

```bash
npm run dev
```

Login, go to `/`:
- See calorie ring with today's total
- See quick action buttons
- See advice cards based on health reports and goals
- Click "查看全部" → `/recommendations` shows all

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add recommendation engine, dashboard with calorie ring, and advice cards"
```

---

### Task 9: 个人设置页面

**Files:**
- Create: `src/app/settings/page.tsx`
- Create: `src/app/api/user/route.ts`

**Interfaces:**
- Consumes: auth (Task 2), Prisma (Task 1)
- Produces: Settings page to edit body data and goal

- [ ] **Step 1: Write user API route**

Write `src/app/api/user/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { name, age, gender, height, weight, goal } = body;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(age !== undefined && { age: age ? parseInt(age) : null }),
      ...(gender !== undefined && { gender }),
      ...(height !== undefined && { height: height ? parseFloat(height) : null }),
      ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null }),
      ...(goal !== undefined && { goal }),
    },
  });

  return NextResponse.json(user);
}
```

- [ ] **Step 2: Add shadcn radio-group component**

```bash
npx shadcn@latest add radio-group
```

- [ ] **Step 3: Write settings page**

Write `src/app/settings/page.tsx`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell>
      <h1 className="text-xl font-semibold mb-4">个人设置</h1>
      <SettingsForm user={user} />
    </AppShell>
  );
}
```

Write `src/app/settings/settings-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  user: {
    name: string;
    age: number | null;
    gender: string | null;
    height: number | null;
    weight: number | null;
    goal: string;
  } | null;
}

export function SettingsForm({ user }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState(user?.goal || "maintain");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = { goal };
    ["name", "age", "gender", "height", "weight"].forEach((key) => {
      const val = formData.get(key) as string;
      data[key] = val || null;
    });

    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label>昵称</Label>
        <Input name="name" defaultValue={user?.name || ""} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>年龄</Label>
          <Input name="age" type="number" defaultValue={user?.age || ""} />
        </div>
        <div className="space-y-1">
          <Label>性别</Label>
          <select
            name="gender"
            defaultValue={user?.gender || ""}
            className="w-full border rounded-md p-2 text-sm"
          >
            <option value="">未选择</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>身高 (cm)</Label>
          <Input name="height" type="number" step="0.1" defaultValue={user?.height || ""} />
        </div>
        <div className="space-y-1">
          <Label>体重 (kg)</Label>
          <Input name="weight" type="number" step="0.1" defaultValue={user?.weight || ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>目标</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "lose", label: "减重", icon: "📉" },
            { value: "maintain", label: "保持", icon: "⚖️" },
            { value: "gain", label: "增重", icon: "📈" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`p-3 rounded-lg border text-center transition-colors ${
                goal === opt.value
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted"
              }`}
              onClick={() => setGoal(opt.value)}
            >
              <div className="text-xl">{opt.icon}</div>
              <div className="text-sm">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "保存中..." : "保存设置"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 4: Add settings link to header**

Modify `src/components/layout/header.tsx`, add a settings link before the logout button:

```typescript
import Link from "next/link";
import { signOut, auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="max-w-2xl mx-auto flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-semibold text-lg">
          🍎 健康追踪
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
            ⚙️
          </Link>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {session?.user?.name}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              退出
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Verify settings**

```bash
npm run dev
```

1. Login, go to `/settings`
2. Fill in body data, choose goal → save
3. Go to `/` → see updated goal label and personalized caloric target

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add settings page for body data, goals, and health target configuration"
```

---

### Task 10: 运动追踪 API + UI

**Files:**
- Create: `src/app/api/exercise/route.ts`
- Create: `src/app/exercise/page.tsx`
- Create: `src/app/exercise/history/page.tsx`
- Create: `src/components/exercise/exercise-form.tsx`
- Create: `src/components/exercise/exercise-list.tsx`

**Interfaces:**
- Produces: `GET/POST /api/exercise`, exercise tracking page with entry form and list
- Consumes: Prisma (Task 1), auth (Task 2)

- [ ] **Step 1: Write exercise API route**

Write `src/app/api/exercise/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const calorieRates: Record<string, number> = {
  running: 8.0,
  walking: 3.5,
  cycling: 6.0,
  swimming: 7.0,
  strength: 5.0,
  yoga: 3.0,
  hiit: 10.0,
  other: 4.0,
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  let startOfDay: Date, endOfDay: Date;
  if (date) {
    startOfDay = new Date(date);
    endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);
  } else {
    startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
  }

  const entries = await prisma.exerciseEntry.findMany({
    where: {
      userId: session.user.id,
      date: { gte: startOfDay, lt: endOfDay },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const body = await req.json();
  const { activityType, durationMinutes, steps, notes } = body;
  const rate = calorieRates[activityType] || 4.0;
  const caloriesBurned = Math.round(rate * parseFloat(durationMinutes));

  const entry = await prisma.exerciseEntry.create({
    data: {
      userId: session.user.id,
      activityType: activityType || "other",
      durationMinutes: parseFloat(durationMinutes),
      caloriesBurned,
      steps: steps ? parseInt(steps) : null,
      notes: notes || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
```

- [ ] **Step 2: Write exercise list component**

Write `src/components/exercise/exercise-list.tsx`:

```typescript
const activityIcons: Record<string, string> = {
  running: "🏃",
  walking: "🚶",
  cycling: "🚴",
  swimming: "🏊",
  strength: "🏋️",
  yoga: "🧘",
  hiit: "🔥",
  other: "💪",
};

const activityLabels: Record<string, string> = {
  running: "跑步",
  walking: "步行",
  cycling: "骑行",
  swimming: "游泳",
  strength: "力量训练",
  yoga: "瑜伽",
  hiit: "HIIT",
  other: "其他运动",
};

interface ExerciseEntry {
  id: string;
  activityType: string;
  durationMinutes: number;
  caloriesBurned: number;
  steps: number | null;
  notes: string | null;
}

interface Props {
  entries: ExerciseEntry[];
}

export function ExerciseList({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        今天还没有运动记录
      </p>
    );
  }

  let totalCal = 0;
  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        totalCal += entry.caloriesBurned;
        return (
          <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <span className="text-2xl">{activityIcons[entry.activityType] || "💪"}</span>
            <div className="flex-1">
              <div className="font-medium">
                {activityLabels[entry.activityType] || entry.activityType}
              </div>
              <div className="text-xs text-muted-foreground">
                {entry.durationMinutes} 分钟
                {entry.steps ? ` · ${entry.steps} 步` : ""}
                {entry.notes ? ` · ${entry.notes}` : ""}
              </div>
            </div>
            <div className="text-right font-semibold">
              {entry.caloriesBurned} kcal
            </div>
          </div>
        );
      })}
      <div className="text-sm text-muted-foreground text-center pt-2 border-t">
        今日消耗：{totalCal} kcal
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write exercise form**

Write `src/components/exercise/exercise-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const activities = [
  { value: "walking", label: "🚶 步行" },
  { value: "running", label: "🏃 跑步" },
  { value: "cycling", label: "🚴 骑行" },
  { value: "swimming", label: "🏊 游泳" },
  { value: "strength", label: "🏋️ 力量训练" },
  { value: "yoga", label: "🧘 瑜伽" },
  { value: "hiit", label: "🔥 HIIT" },
  { value: "other", label: "💪 其他" },
];

interface Props {
  onSaved: () => void;
}

export function ExerciseForm({ onSaved }: Props) {
  const [activityType, setActivityType] = useState("walking");
  const [duration, setDuration] = useState(30);
  const [steps, setSteps] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await fetch("/api/exercise", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activityType,
        durationMinutes: duration,
        steps: steps || null,
        notes: notes || null,
      }),
    });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="text-sm font-medium text-muted-foreground">
        ✏️ 记录运动
      </div>
      <div className="space-y-1">
        <Label>运动类型</Label>
        <div className="grid grid-cols-4 gap-2">
          {activities.map((a) => (
            <button
              key={a.value}
              type="button"
              className={`p-2 rounded-lg border text-xs text-center transition-colors ${
                activityType === a.value
                  ? "border-primary bg-primary/10 font-medium"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActivityType(a.value)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <Label>时长 (分钟)</Label>
        <Input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>
      <div className="space-y-1">
        <Label>步数（可选）</Label>
        <Input
          type="number"
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          placeholder="如: 5000"
        />
      </div>
      <div className="space-y-1">
        <Label>备注（可选）</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="如: 户外慢跑"
        />
      </div>
      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? "保存中..." : "保存记录"}
      </Button>
    </div>
  );
}
```

- [ ] **Step 4: Write exercise page**

Write `src/app/exercise/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExerciseForm } from "@/components/exercise/exercise-form";
import { ExerciseList } from "@/components/exercise/exercise-list";
import Link from "next/link";

export default function ExercisePage() {
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchEntries = useCallback(async () => {
    const res = await fetch("/api/exercise");
    if (res.ok) setEntries(await res.json());
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  function handleSaved() {
    setShowForm(false);
    fetchEntries();
  }

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">运动记录</h1>
        <Link href="/exercise/history" className="text-sm text-primary">
          历史记录 →
        </Link>
      </div>

      <div className="space-y-3">
        {!showForm && (
          <button
            className="w-full p-4 border-2 border-dashed rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
            onClick={() => setShowForm(true)}
          >
            + 记录运动
          </button>
        )}
        {showForm && <ExerciseForm onSaved={handleSaved} />}
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">
          今日记录
        </h2>
        <ExerciseList entries={entries} />
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 5: Write exercise history page**

Write `src/app/exercise/history/page.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { ExerciseList } from "@/components/exercise/exercise-list";
import Link from "next/link";

export default function ExerciseHistoryPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch(`/api/exercise?date=${date}`)
      .then((r) => r.json())
      .then(setEntries);
  }, [date]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-4">
        <Link href="/exercise" className="text-sm text-primary">
          ← 返回
        </Link>
        <h1 className="text-lg font-semibold">运动历史</h1>
        <div className="w-10" />
      </div>
      <div className="mb-4">
        <input
          type="date"
          value={date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
        />
      </div>
      <ExerciseList entries={entries} />
    </AppShell>
  );
}
```

- [ ] **Step 6: Verify exercise flow**

```bash
npm run dev
```

1. Login, go to `/exercise`
2. Click "记录运动" → choose "跑步", 30 min → save
3. Entry appears with ~240 kcal burned

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add exercise tracking with entry form, calorie estimation, and history"
```

---

### Task 11: 每日汇总 + 打磨上线

**Files:**
- Create: `src/services/summaryCalculator.ts`
- Modify: `src/app/page.tsx` (enhance dashboard with exercise data)
- Modify: `next.config.ts` (PWA headers)
- Create: `public/manifest.json`

**Interfaces:**
- Produces: Daily summary aggregation, enhanced dashboard with exercise calories, PWA manifest

- [ ] **Step 1: Write summary calculator service**

Write `src/services/summaryCalculator.ts`:

```typescript
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
```

- [ ] **Step 2: Enhance dashboard with exercise data**

Modify `src/app/page.tsx` — add exercise calories to the display. Replace the calorie section with:

```typescript
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
```

- [ ] **Step 3: Create PWA manifest**

Write `public/manifest.json`:

```json
{
  "name": "健康追踪",
  "short_name": "健康追踪",
  "description": "饮食热量识别与健康管理",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2d6a4f",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 4: Update layout with manifest and viewport meta**

Modify `src/app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "健康追踪",
  description: "饮食热量识别与健康管理",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Full end-to-end test**

```bash
npm run dev
```

Test the complete flow:
1. Register new user → login
2. Go to `/settings` → set body data + goal
3. Go to `/food` → log 2-3 food entries
4. Go to `/exercise` → log 1 exercise
5. Go to `/health` → add health report with abnormal values
6. Go to `/` → verify calorie ring, exercise calories, advice cards
7. Go to `/recommendations` → verify all advice
8. Go to `/food/history` → verify history by date
9. Verify mobile nav works on narrow viewport
10. Verify logout/login works

- [ ] **Step 6: Fix any issues found in testing**

Run through the test checklist and fix issues inline.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: add daily summary, enhanced dashboard with exercise data, PWA manifest

Complete MVP of health tracking app with food logging, photo recognition,
health reports, recommendation engine, exercise tracking, and dashboard."
```

---

### Task 12: 部署 Vercel

- [ ] **Step 1: Initialize git (if not already done)**

```bash
cd "C:/Users/sarah/projects/health-track"
git init
git add -A
```

- [ ] **Step 2: Create .gitignore**

Write `.gitignore`:

```
node_modules/
.next/
prisma/dev.db
prisma/dev.db-journal
.env.local
public/uploads/*
!public/uploads/.gitkeep
```

- [ ] **Step 3: Install Vercel CLI and deploy**

```bash
npm install -g vercel
vercel --prod
```

Follow the prompts to link and deploy.

- [ ] **Step 4: Set environment variables on Vercel**

In Vercel Dashboard → Settings → Environment Variables:
- `DATABASE_URL`: `file:./dev.db` (note: for production, this won't persist across deploys; recommend upgrading to PostgreSQL or using Vercel KV)
- `AUTH_SECRET`: generate with `openssl rand -base64 32`
- `AUTH_URL`: your Vercel deployment URL

- [ ] **Step 5: Test production deployment**

Open the Vercel URL, verify login, food logging, and dashboard work.

- [ ] **Step 6: Commit gitignore**

```bash
git add .gitignore
git commit -m "chore: add .gitignore for production deployment"
```
