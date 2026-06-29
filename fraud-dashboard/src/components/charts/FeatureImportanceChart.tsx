"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Item { feature: string; importance: number }
interface Props { data: Item[]; title?: string }

const FEATURE_LABELS: Record<string, string> = {
  pais_coincide: "País coincide",
  es_hora_riesgo: "Hora de riesgo (23-5h)",
  score_dispositivo: "Score dispositivo",
  intentos_fallidos_24h: "Intentos fallidos 24h",
  hora: "Hora del día",
  monto_log: "Monto (log)",
  dia_semana: "Día semana",
  es_fin_semana: "Es fin de semana",
  mes: "Mes",
  "cat_Electrónica": "Categoría: Electrónica",
  "cat_Viajes": "Categoría: Viajes",
  "tarj_Crédito": "Tarjeta: Crédito",
};

export function FeatureImportanceChart({ data, title }: Props) {
  const top10 = data.slice(0, 10).map((d) => ({
    ...d,
    label: FEATURE_LABELS[d.feature] ?? d.feature,
    pct: (d.importance * 100).toFixed(1),
  }));

  return (
    <div>
      {title && <p className="text-slate-300 text-sm font-medium mb-3">{title}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={top10} layout="vertical" margin={{ top: 5, right: 50, left: 10, bottom: 5 }}>
          <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
          <YAxis dataKey="label" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} width={155} />
          <Tooltip
            contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
            formatter={(v) => [`${((v as number) * 100).toFixed(2)}%`, "Importancia"]}
          />
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {top10.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "#EF4444" : i < 3 ? "#F97316" : "#3B82F6"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
