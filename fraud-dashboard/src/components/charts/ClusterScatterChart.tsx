"use client";

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Point { pca1: number; pca2: number; cluster: number; es_fraude: number }
interface Props { data: Point[]; varianza: number[] }

const CLUSTER_COLORS = ["#22C55E", "#EF4444", "#F59E0B", "#F97316"];
const CLUSTER_NAMES = ["C0: Bajo Riesgo", "C1: Alto Riesgo", "C2: Riesgo Moderado", "C3: Reintentadores"];

export function ClusterScatterChart({ data, varianza }: Props) {
  const byCluster = [0, 1, 2, 3].map((c) => data.filter((d) => d.cluster === c));

  return (
    <div>
      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
          <XAxis
            type="number"
            dataKey="pca1"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            label={{ value: `PC1 (${varianza[0]}% var.)`, fill: "#64748B", fontSize: 11, position: "insideBottom", offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="pca2"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            label={{ value: `PC2 (${varianza[1]}% var.)`, fill: "#64748B", fontSize: 11, angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
            formatter={(v) => (v as number).toFixed(3)}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
          {byCluster.map((pts, c) => (
            <Scatter
              key={c}
              name={CLUSTER_NAMES[c]}
              data={pts}
              fill={CLUSTER_COLORS[c]}
              opacity={0.6}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
