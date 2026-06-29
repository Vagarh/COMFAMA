"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface ShapContrib { feature: string; valor_feature: number; shap: number }
interface Props { contribs: ShapContrib[]; valorBase: number; label: string }

const FEATURE_LABELS: Record<string, string> = {
  pais_coincide: "País coincide",
  es_hora_riesgo: "Hora riesgo",
  score_dispositivo: "Score dispositivo",
  intentos_fallidos_24h: "Intentos fallidos",
  hora: "Hora",
  monto_log: "Monto",
  dia_semana: "Día semana",
  es_fin_semana: "Fin de semana",
  mes: "Mes",
};

export function ShapWaterfallChart({ contribs, valorBase, label }: Props) {
  const data = contribs.slice(0, 8).map((c) => ({
    feature: FEATURE_LABELS[c.feature] ?? c.feature,
    shap: c.shap,
    valor: c.valor_feature,
    abs: Math.abs(c.shap),
  }));

  return (
    <div>
      <p className="text-slate-400 text-xs mb-1">
        Valor base: <span className="text-blue-400 font-mono">{valorBase.toFixed(3)}</span> · {label}
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
          <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} />
          <YAxis dataKey="feature" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} width={130} />
          <Tooltip
            contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
            formatter={(v, _name, props) => [
              `SHAP: ${(v as number).toFixed(4)} (valor feature: ${(props?.payload?.valor as number)?.toFixed(2) ?? "—"})`,
              "Contribución",
            ]}
          />
          <ReferenceLine x={0} stroke="#475569" />
          <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.shap > 0 ? "#EF4444" : "#22C55E"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-slate-500 mt-1">
        <span className="text-red-400">■</span> Aumenta riesgo &nbsp;
        <span className="text-green-400">■</span> Reduce riesgo
      </p>
    </div>
  );
}
