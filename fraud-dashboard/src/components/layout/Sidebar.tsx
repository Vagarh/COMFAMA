"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/overview", label: "Resumen Ejecutivo", icon: "📊" },
  { href: "/eda", label: "Análisis Exploratorio", icon: "🔍" },
  { href: "/models", label: "Modelos Supervisados", icon: "🤖" },
  { href: "/anomalias", label: "Detección Anomalías", icon: "⚠️" },
  { href: "/clustering", label: "Segmentación Riesgo", icon: "🗂️" },
  { href: "/pitch", label: "Pitch RPG", icon: "⚔️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white font-bold text-sm">
            CF
          </div>
          <div>
            <p className="text-white font-bold text-sm">CONFAMA</p>
            <p className="text-slate-400 text-xs">Anti-Fraude AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-blue-600 text-white font-medium"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-slate-500 text-xs text-center">50,000 transacciones analizadas</p>
        <p className="text-slate-600 text-xs text-center mt-1">Dataset 2026 · CONFAMA</p>
      </div>
    </aside>
  );
}
