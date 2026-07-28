"use client";

export interface FoodEntry {
  id: string;
  foodName: string;
  mealType: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number | null;
  sugar: number | null;
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
  onEdit?: (entry: FoodEntry) => void;
  onDelete?: (id: string) => void;
}

export function FoodList({ entries, onEdit, onDelete }: Props) {
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
          <div key={entry.id} className="flex items-center gap-3 p-3 border rounded-lg group">
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
              {(onEdit || onDelete) && (
                <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => onEdit(entry)}
                    >
                      编辑
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      className="text-xs text-destructive hover:underline"
                      onClick={() => onDelete(entry.id)}
                    >
                      删除
                    </button>
                  )}
                </div>
              )}
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
