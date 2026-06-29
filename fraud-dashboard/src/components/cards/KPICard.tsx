import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string;
  color?: "red" | "green" | "blue" | "amber" | "slate";
  trend?: string;
}

const colorMap = {
  red: "bg-red-500/10 border-red-500/30 text-red-400",
  green: "bg-green-500/10 border-green-500/30 text-green-400",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  slate: "bg-slate-700/50 border-slate-600 text-slate-300",
};

export function KPICard({ title, value, subtitle, icon, color = "blue", trend }: Props) {
  return (
    <div className={cn("rounded-xl border p-5", colorMap[color])}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium opacity-80">{title}</p>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs mt-1 opacity-70">{subtitle}</p>}
      {trend && <p className="text-xs mt-2 font-medium">{trend}</p>}
    </div>
  );
}
