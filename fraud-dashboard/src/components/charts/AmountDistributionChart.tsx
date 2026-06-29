"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Props {
  labels: string[];
  conteos_total: number[];
  conteos_fraude: number[];
}

export function AmountDistributionChart({ labels, conteos_total, conteos_fraude }: Props) {
  const data = labels.map((label, i) => ({
    label,
    total: conteos_total[i],
    fraudes: conteos_fraude[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <XAxis dataKey="label" tick={{ fill: "#94A3B8", fontSize: 11 }} label={{ value: "Rango USD", fill: "#64748B", fontSize: 11, position: "insideBottom", offset: -2 }} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
          formatter={(v, name) => [(v as number).toLocaleString(), name === "total" ? "Total transacciones" : "Fraudes"]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
        <Bar dataKey="total" fill="#3B82F6" opacity={0.6} name="total" radius={[3, 3, 0, 0]} />
        <Bar dataKey="fraudes" fill="#EF4444" name="fraudes" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
