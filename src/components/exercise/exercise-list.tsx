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
