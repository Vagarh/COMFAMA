"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DataPoint { categoria: string; total: number; fraudes: number; tasa: number }
interface Props { data: DataPoint[] }

export function FraudByCategoryChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
        <XAxis type="number" tick={{ fill: "#94A3B8", fontSize: 11 }} />
        <YAxis dataKey="categoria" type="category" tick={{ fill: "#94A3B8", fontSize: 11 }} width={100} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9" }}
          formatter={(value, name) => [
            name === "total" ? (value as number).toLocaleString() : name === "fraudes" ? value : `${value}%`,
            name === "total" ? "Total transacciones" : name === "fraudes" ? "Fraudes" : "Tasa fraude",
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
        <Bar dataKey="fraudes" fill="#EF4444" radius={[0, 3, 3, 0]} name="fraudes" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
