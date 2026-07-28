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
