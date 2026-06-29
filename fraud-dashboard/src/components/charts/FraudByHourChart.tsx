"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

interface DataPoint {
  hora: number;
  total: number;
  fraudes: number;
  tasa: number;
}

interface Props { data: DataPoint[] }

export function FraudByHourChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <XAxis
          dataKey="hora"
          tick={{ fill: "#94A3B8", fontSize: 11 }}
          tickFormatter={(v) => `${v}h`}
        />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9" }}
          formatter={(value, name) => [
            name === "fraudes" ? `${value} fraudes` : `${(value as number).toFixed(2)}%`,
            name === "fraudes" ? "Casos de fraude" : "Tasa de fraude",
          ]}
          labelFormatter={(label) => `Hora: ${label}:00`}
        />
        <ReferenceLine x={23} stroke="#EF4444" strokeDasharray="3 3" />
        <Bar dataKey="fraudes" radius={[3, 3, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.hora}
              fill={(entry.hora >= 23 || entry.hora <= 5) ? "#EF4444" : "#3B82F6"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
