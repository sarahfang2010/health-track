# 饮食健康追踪应用 — 设计文档

**日期：** 2026-07-28
**状态：** 待审核

---

## 一、项目概述

一款 Web 网页应用，核心功能是通过拍照识别食物、记录饮食热量，结合体检报告和运动数据，为用户提供个性化的饮食建议。面向小范围多用户（家庭/朋友）使用。

### 核心功能

1. **饮食记录** — 拍照上传食物照片，模拟识别匹配食物，自动估算热量和营养成分
2. **体检档案** — 手动填写体检指标 + 上传报告图片，自动标记健康风险
3. **推荐引擎** — 基于健康状况、运动数据和用户目标，生成针对性饮食建议
4. **运动追踪** — 手动录入运动数据，预留智能设备同步接口
5. **用户目标** — 支持减重、保持、增重三种目标，影响推荐策略

---

## 二、技术选型

| 层面 | 选择 | 说明 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 全栈一体，前后端同仓库 |
| 语言 | TypeScript | 类型安全 |
| 数据库 | SQLite + Prisma ORM | 小范围够用，后续可升 PostgreSQL |
| UI | shadcn/ui + Tailwind CSS | 简洁组件，移动端友好 |
| 认证 | NextAuth.js | 手机号/用户名 + 密码登录，支持多用户 |
| 部署 | Vercel | 免费托管，零运维 |

### 为什么选 Next.js 全栈

- 一套代码覆盖前后端，开发效率最高
- API Routes / Server Actions 直接操作数据库，无需单独后端服务
- Vercel 一键部署，HTTPS 自带
- 后续接入 AI API 在服务端调用，保护 API Key

---

## 三、系统架构

```
浏览器 (PWA, 移动端优先)
  ├── 仪表盘 Dashboard
  ├── 饮食记录 Food Log
  ├── 体检档案 Health Profile
  ├── 运动记录 Exercise
  └── 健康建议 Recommendations
         │
         ▼
Next.js 服务端
  ├── 认证模块 (NextAuth.js)
  ├── 食物识别服务 (模拟匹配 → 后续换 AI)
  ├── 报告解析器 (手动填写 → 后续加 OCR)
  ├── 推荐引擎 (规则引擎)
  └── 运动计算器
         │
         ▼
Prisma ORM + SQLite
```

### 数据流

1. **饮食记录流：** 拍照 → 上传图片 → 模拟识别返回候选 → 用户确认 → 存入 FoodEntry → 更新 DailySummary
2. **体检档案流：** 填写表单/上传图片 → 保存 HealthReport → 后端计算 flags → 推荐引擎更新建议
3. **推荐生成流：** 读取用户 goal + 最新 HealthReport.flags + 近期饮食 → 规则匹配 → 生成建议列表

---

## 四、数据模型

### User
```
id          String   (PK)
name        String
account     String   (unique, 手机号或用户名)
password    String   (hashed)
age         Int?
gender      String?  ("male" | "female")
height      Float?   (cm)
weight      Float?   (kg)
goal        String   ("lose" | "maintain" | "gain")
role        String   ("admin" | "member")
createdAt   DateTime
```

### HealthReport
```
id                    String   (PK)
userId                String   (FK → User)
reportDate            DateTime
bloodSugar            Float?   (空腹血糖 mmol/L)
bloodPressureSystolic  Int?    (收缩压 mmHg)
bloodPressureDiastolic Int?    (舒张压 mmHg)
totalCholesterol      Float?   (总胆固醇 mmol/L)
hdl                   Float?   (高密度脂蛋白)
ldl                   Float?   (低密度脂蛋白)
triglycerides         Float?   (甘油三酯)
uricAcid              Float?   (尿酸 μmol/L)
flags                 String[] (自动标记，如["糖尿病风险","高血压","高血脂","高尿酸"])
reportImageUrl        String?  (原始报告图片路径)
notes                 String?
createdAt             DateTime
```

### FoodEntry
```
id          String   (PK)
userId      String   (FK → User)
mealType    String   ("breakfast" | "lunch" | "dinner" | "snack")
foodName    String
portion     String?  (如"1碗"、"200g")
calories    Float    (kcal)
protein     Float    (g)
fat         Float    (g)
carbs       Float    (g)
fiber       Float?   (g)
sugar       Float?   (g)
imageUrl    String?  (食物照片路径)
source      String   ("photo" | "manual")
consumedAt  DateTime
```

### ExerciseEntry
```
id              String   (PK)
userId          String   (FK → User)
activityType    String   ("running" | "walking" | "cycling" | ...)
durationMinutes Float
caloriesBurned  Float
steps           Int?
source          String   ("manual" | "sync")
date            DateTime
notes           String?
```

### DailySummary
```
id              String   (PK)
userId          String   (FK → User)
date            DateTime
totalCaloriesIn  Float
totalCaloriesOut Float
totalProtein    Float
totalFat        Float
totalCarbs      Float
calorieBalance  Float    (摄入 - 消耗)
```

### FoodDatabase（内置食物库）
```
id          String   (PK)
name        String   (食物名)
category    String   (主食/肉类/蔬菜/水果/饮品/零食)
calories    Float    (每100g)
protein     Float    (每100g)
fat         Float    (每100g)
carbs       Float    (每100g)
fiber       Float    (每100g)
sugar       Float    (每100g)
```

---

## 五、推荐引擎规则

纯规则引擎，不依赖 AI。输入为用户目标 + 最新体检 flags + 近期饮食数据。

### 规则表

| 触发条件 | 建议文案 | 优先级 |
|----------|----------|--------|
| flags 含"糖尿病风险" | 检测到血糖偏高，建议选择低GI食物，控制精制碳水和含糖食品摄入 | 高 |
| flags 含"高血压" | 建议每日盐摄入控制在6g以内，多摄入富含钾的食物如香蕉、菠菜 | 高 |
| flags 含"高血脂" | 减少动物脂肪和反式脂肪摄入，增加膳食纤维和Omega-3 | 高 |
| flags 含"高尿酸" | 避免高嘌呤食物（内脏、部分海鲜、啤酒），每日饮水2000ml以上 | 高 |
| goal = "lose" | 每日热量目标：TDEE - 300kcal，蛋白质 ≥ 体重×1.6g/kg 防止肌肉流失 | 中 |
| goal = "gain" | 每日热量目标：TDEE + 300kcal，建议少食多餐，增加健康加餐 | 中 |
| 近期蛋白质偏低 (<目标60%) | 最近蛋白质摄入不足，建议每餐搭配鸡蛋/牛奶/豆制品/瘦肉 | 低 |
| 近期碳水偏高 (>目标130%) | 碳水摄入偏高，建议适当用粗粮替代精米白面 | 低 |
| 近期蔬菜摄入不足 | 建议每日摄入300-500g蔬菜，深色蔬菜占一半 | 低 |
| 无特殊情况 | 保持均衡饮食，每餐搭配主食+蛋白质+蔬菜，控制油盐摄入 | 最低 |

### 实现

- `recommendations.ts` 服务函数，接受 userId，返回建议数组
- 每次访问仪表盘或建议页时调用
- 多条命中时合并，按优先级排序
- 建议文案存入配置文件便于后续调整

---

## 六、模拟食物识别流程

```
用户拍照 → 上传图片到服务器
         → 服务器保存图片
         → 模拟识别：从 FoodDatabase 随机选 3-5 个候选食物
         → 返回候选列表给前端
         → 用户选择最接近的食物
         → 自动填入该食物的营养成分（默认100g）
         → 用户调整份量和实际克数
         → 系统按比例重新计算营养数据
         → 确认保存到 FoodEntry
```

### 预留 AI 接入点

- `services/foodRecognition.ts` 中的 `recognizeFood(imageUrl)` 函数
- 当前实现：从数据库随机取候选
- 后续替换：调用 Claude Vision / GPT-4V API，根据图片内容返回真实识别结果
- **对外接口不变**，只换函数内部实现

---

## 七、页面结构

共 6 个页面，响应式布局同时适配桌面端和移动端，每页一个核心任务：

| 路由 | 页面 | 核心内容 |
|------|------|----------|
| `/` | 仪表盘 | 今日热量环形图、目标进度、个性化建议卡片（最多3条）、快捷入口 |
| `/login` | 登录/注册 | 手机号/用户名 + 密码表单，简洁居中 |
| `/settings` | 个人设置 | 身体数据编辑、目标切换（减重/保持/增重） |
| `/food` | 饮食记录 | 今日列表 + 拍照按钮 + 手动录入入口 |
| `/health` | 健康档案 | 最新指标卡片 + 历史趋势迷你图 + 新建报告 |
| `/exercise` | 运动记录 | 今日运动 + 快速录入表单 |

### UI 设计原则

- 每页只聚焦一件事，不堆砌信息
- 卡片式布局 + 充分留白
- 色系低调克制（中性灰为主，关键数据用单一强调色）
- 数字用大号字体突出，说明文字小而淡
- 响应式设计：移动端单栏全宽，桌面端居中最大宽度 (max-w-2xl)，触控区域不小于 44px

---

## 八、认证与用户模型

- NextAuth.js 的 Credentials Provider（手机号/用户名 + 密码）
- 注册时可选填身体数据（年龄/性别/身高/体重）和目标
- 用户间数据完全隔离，不支持跨用户查看（当前阶段不做家庭组共享）
- 会话使用 JWT，存储在 Cookie 中

---

## 九、非功能需求

- **离线：** PWA 策略，静态资源可缓存，数据操作需在线
- **性能：** 仪表盘数据通过 DailySummary 预计算，不实时聚合
- **安全：** 密码哈希存储（bcrypt），API 路由校验登录态，文件上传限制图片格式和大小
- **可维护：** 推荐规则、食物数据库均用配置文件驱动，无需改代码即可调整

---

## 十、后续扩展预留

| 扩展项 | 预留方式 |
|--------|----------|
| 接入 AI 食物识别 | `services/foodRecognition.ts` 替换实现 |
| 体检报告 OCR 解析 | `services/reportParser.ts` 替换实现 |
| 接入 Apple Health / 华为健康 | `services/exerciseSync.ts` 新增 API 对接 |
| 升级 PostgreSQL | Prisma 配置改一行 |
| 家庭组数据共享 | User 表加 familyGroupId |
| 推送提醒 | 加定时任务 + Web Push API |

---

## 十一、里程碑

| 阶段 | 内容 | 预计产出 |
|------|------|----------|
| **M1 — 基础框架** | 项目脚手架、数据库、认证 | 可登录注册 |
| **M2 — 饮食记录** | 食物库、拍照上传、模拟识别、手动录入 | 可记录饮食 |
| **M3 — 体检档案** | 健康报告表单、指标录入、flags 自动标记 | 可录入体检数据 |
| **M4 — 推荐引擎** | 规则引擎、建议生成、仪表盘展示 | 可看到个性化建议 |
| **M5 — 运动追踪** | 运动录入、热量计算、每日汇总 | 完整闭环 |
| **M6 — 打磨上线** | PWA 配置、移动端适配、部署 Vercel | 可日常使用 |
