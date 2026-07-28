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
