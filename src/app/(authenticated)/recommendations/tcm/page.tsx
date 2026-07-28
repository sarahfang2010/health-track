"use client";

import { useState } from "react";
import Link from "next/link";

const seasonalTips = [
  {
    season: "春",
    icon: "🌸",
    principle: "养肝为先，宜辛甘发散",
    foods: ["韭菜", "菠菜", "荠菜", "春笋", "红枣", "枸杞"],
    avoid: "酸涩收敛之物，少食酸",
  },
  {
    season: "夏",
    icon: "☀️",
    principle: "清心祛暑，宜清淡生津",
    foods: ["绿豆", "冬瓜", "苦瓜", "莲子", "西瓜", "薄荷"],
    avoid: "油腻厚味，少食辛辣燥热",
  },
  {
    season: "秋",
    icon: "🍂",
    principle: "润肺养阴，宜甘润酸收",
    foods: ["百合", "银耳", "梨", "蜂蜜", "山药", "芝麻"],
    avoid: "辛燥发散，少食葱姜蒜",
  },
  {
    season: "冬",
    icon: "❄️",
    principle: "补肾藏精，宜温补助阳",
    foods: ["羊肉", "核桃", "黑芝麻", "桂圆", "生姜", "当归"],
    avoid: "生冷寒凉，少食生冷瓜果",
  },
];

const constitutionTips = [
  {
    type: "气虚体质",
    desc: "容易疲劳、气短、自汗",
    foods: ["黄芪", "党参", "山药", "红枣", "鸡肉", "小米"],
    avoid: "耗气食物，如生冷、油腻",
  },
  {
    type: "阳虚体质",
    desc: "怕冷、手脚冰凉、精神不振",
    foods: ["羊肉", "韭菜", "核桃", "生姜", "桂圆", "肉桂"],
    avoid: "寒凉食物，如西瓜、苦瓜、冷饮",
  },
  {
    type: "阴虚体质",
    desc: "口干舌燥、手足心热、盗汗",
    foods: ["银耳", "百合", "枸杞", "鸭肉", "梨", "蜂蜜"],
    avoid: "辛辣燥热，如辣椒、烧烤",
  },
];

export default function TCMPage() {
  const [tab, setTab] = useState<"season" | "constitution">("season");

  return (
    <>
      <div className="mb-4">
        <Link href="/" className="text-sm text-primary">
          ← 返回首页
        </Link>
      </div>
      <h1 className="text-xl font-semibold mb-2">🌿 中医食补养生</h1>
      <p className="text-sm text-muted-foreground mb-4">
        药食同源，根据季节和体质选择适合的食疗方案
      </p>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "season"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/70"
          }`}
          onClick={() => setTab("season")}
        >
          四季食补
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "constitution"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/70"
          }`}
          onClick={() => setTab("constitution")}
        >
          体质调理
        </button>
      </div>

      {/* Seasonal */}
      {tab === "season" && (
        <div className="space-y-3">
          {seasonalTips.map((s) => (
            <div key={s.season} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{s.icon}</span>
                <span className="font-semibold">{s.season}季</span>
                <span className="text-sm text-muted-foreground">
                  —— {s.principle}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-green-600 font-medium">推荐食材：</span>
                {s.foods.join("、")}
              </div>
              <div className="text-sm text-muted-foreground">
                ⚠️ {s.avoid}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Constitution */}
      {tab === "constitution" && (
        <div className="space-y-3">
          {constitutionTips.map((c) => (
            <div key={c.type} className="border rounded-lg p-4 space-y-2">
              <div className="font-semibold">{c.type}</div>
              <div className="text-sm text-muted-foreground">{c.desc}</div>
              <div className="text-sm">
                <span className="text-green-600 font-medium">推荐食材：</span>
                {c.foods.join("、")}
              </div>
              <div className="text-sm text-muted-foreground">
                ⚠️ {c.avoid}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI placeholder */}
      <div className="mt-6 p-4 border-2 border-dashed rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          🤖 后续将接入 AI，根据你的体质和体检数据<br />
          生成个性化中医食补方案
        </p>
      </div>
    </>
  );
}
