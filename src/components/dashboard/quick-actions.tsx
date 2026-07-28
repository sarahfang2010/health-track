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
