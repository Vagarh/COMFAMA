import { cn } from "@/lib/utils";

interface Props {
  icon: string;
  title: string;
  body: string;
  accent?: "red" | "amber" | "green" | "blue";
}

const accentMap = {
  red: "border-l-red-500",
  amber: "border-l-amber-500",
  green: "border-l-green-500",
  blue: "border-l-blue-500",
};

export function InsightCard({ icon, title, body, accent = "blue" }: Props) {
  return (
    <div className={cn("bg-slate-800/60 rounded-xl p-5 border border-slate-700 border-l-4", accentMap[accent])}>
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div>
          <p className="text-white font-semibold text-sm mb-1">{title}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{body}</p>
        </div>
      </div>
    </div>
  );
}
