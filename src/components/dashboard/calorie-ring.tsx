interface Props {
  consumed: number;
  burned: number;
  bmr: number;
  target: number;
}

export function CalorieRing({ consumed, burned, bmr, target }: Props) {
  const totalBurn = bmr + burned;
  const maxVal = Math.max(consumed, totalBurn, target, bmr, 1);

  const circum = 327;
  const exercisePct = Math.min(burned / maxVal, 1);
  const intakePct = Math.min(consumed / maxVal, 1);
  const bmrPct = Math.min(bmr / maxVal, 1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* BMR - outermost ring, soft blue */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="#c4d9e8" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50"
            fill="none"
            stroke="#a0c4de"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${bmrPct * circum} ${circum}`}
          />

          {/* Intake - middle ring, soft coral */}
          <circle cx="60" cy="60" r="42" fill="none" stroke="#f5d2cd" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="42"
            fill="none"
            stroke={consumed > target ? "#e8857c" : "#f0a098"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${intakePct * circum} ${circum}`}
          />

          {/* Exercise - innermost ring, soft teal green */}
          {burned > 0 && (
            <>
              <circle cx="60" cy="60" r="34" fill="none" stroke="#cfe8df" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="34"
                fill="none"
                stroke="#7ec5b0"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${exercisePct * circum} ${circum}`}
              />
            </>
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{consumed}</span>
          <span className="text-[10px] text-muted-foreground">摄入 kcal</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-xs">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f0a098] inline-block" />
          摄入 {consumed}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7ec5b0] inline-block" />
          运动 {burned}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#a0c4de] inline-block" />
          基础 {bmr}
        </span>
      </div>

      <p className="text-xs text-muted-foreground mt-2">
        净摄入：{consumed - burned} kcal · 总消耗：{totalBurn} kcal
      </p>
    </div>
  );
}
