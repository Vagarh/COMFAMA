interface Props {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function SectionHeader({ title, subtitle, badge }: Props) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {badge && (
          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-slate-400 text-sm">{subtitle}</p>}
    </div>
  );
}
