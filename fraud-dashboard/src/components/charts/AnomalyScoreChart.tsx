"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface Props {
  binsLeft: number[];
  conteos: number[];
  threshold: number;
}

export function AnomalyScoreChart({ binsLeft, conteos, threshold }: Props) {
  const data = binsLeft.map((bin, i) => ({
    bin: bin.toFixed(3),
    binVal: bin,
    conteo: conteos[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 30 }}>
        <XAxis
          dataKey="bin"
          tick={{ fill: "#94A3B8", fontSize: 10 }}
          angle={-45}
          textAnchor="end"
          label={{ value: "Anomaly Score (menor = más anómalo)", fill: "#64748B", fontSize: 11, position: "insideBottom", offset: -20 }}
        />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
          formatter={(v) => [(v as number).toLocaleString(), "Transacciones"]}
          labelFormatter={(label) => `Score: ${label}`}
        />
        <ReferenceLine x={threshold.toFixed(3)} stroke="#EF4444" strokeWidth={2} label={{ value: "Umbral", fill: "#EF4444", fontSize: 11 }} />
        <Bar dataKey="conteo" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.binVal <= threshold ? "#EF4444" : "#3B82F6"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
