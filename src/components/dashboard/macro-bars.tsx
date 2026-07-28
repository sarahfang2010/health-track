interface Props {
  protein: number;
  carbs: number;
  fat: number;
  targetCal: number;
}

function Bar({ label, value, target, unit, color }: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const pct = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {value.toFixed(0)} / {target} {unit}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MacroBars({ protein, carbs, fat, targetCal }: Props) {
  // Standard macro targets: protein 20%, fat 30%, carbs 50% of calories
  // Protein: 4 kcal/g, Carbs: 4 kcal/g, Fat: 9 kcal/g
  const proteinTarget = Math.round((targetCal * 0.2) / 4);
  const fatTarget = Math.round((targetCal * 0.3) / 9);
  const carbsTarget = Math.round((targetCal * 0.5) / 4);

  return (
    <div className="w-full space-y-3 p-4 border rounded-lg">
      <h3 className="text-sm font-medium text-muted-foreground">今日营养素</h3>
      <Bar label="蛋白质" value={protein} target={proteinTarget} unit="g" color="bg-[#f0a098]" />
      <Bar label="碳水" value={carbs} target={carbsTarget} unit="g" color="bg-[#e0c060]" />
      <Bar label="脂肪" value={fat} target={fatTarget} unit="g" color="bg-[#7ec5b0]" />
    </div>
  );
}
