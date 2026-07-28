interface Props {
  consumed: number;
  burned: number;
  bmr: number;
  target: number;
}

export function CalorieRing({ consumed, burned, bmr, target }: Props) {
  const totalBurn = bmr + burned;
  const maxVal = Math.max(consumed, totalBurn, target, 1);

  // Calculate stroke dash arrays: circumference ~327 with r=52
  const circum = 327;
  const intakePct = Math.min(consumed / maxVal, 1);
  const burnPct = Math.min(totalBurn / maxVal, 1);
  const targetPct = Math.min(target / maxVal, 1);
  const exercisePct = Math.min(burned / maxVal, 1);

  return (
    <div className="flex flex-col items-center">
      {/* Layered rings */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* BMR base ring (outermost, soft stone) */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="#d1d5d0" strokeWidth="10" />

          {/* Exercise burn ring (middle, warm amber) */}
          {burned > 0 && (
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke="#c9956b"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${exercisePct * circum} ${circum}`}
              strokeDashoffset={-(burnPct - exercisePct) * circum}
              opacity={0.8}
            />
          )}

          {/* Total burn ring (inner, lighter amber) */}
          <circle
            cx="60" cy="60" r="42"
            fill="none"
            stroke="#dbb894"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${burnPct * circum} ${circum}`}
            opacity={0.5}
          />

          {/* Intake ring (innermost, muted sage) */}
          <circle
            cx="60" cy="60" r="34"
            fill="none"
            stroke={consumed > target ? "#c4706e" : "#5f8b7a"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${intakePct * circum} ${circum}`}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{consumed}</span>
          <span className="text-[10px] text-muted-foreground">摄入 kcal</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5f8b7a] inline-block" />
          摄入 {consumed}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#c9956b] inline-block" />
          运动 {burned}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d1d5d0] inline-block" />
          基础 {bmr}
        </span>
      </div>

      {/* Net summary */}
      <p className="text-xs text-muted-foreground mt-2">
        净摄入：{consumed - burned} kcal · 总消耗：{totalBurn} kcal
      </p>
    </div>
  );
}
