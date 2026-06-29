"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface Props { data: Array<{ k: number; inercia: number }>; kOptimo: number }

export function ElbowChart({ data, kOptimo }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <XAxis dataKey="k" tick={{ fill: "#94A3B8", fontSize: 11 }} label={{ value: "K (clusters)", fill: "#64748B", fontSize: 11, position: "insideBottom", offset: -2 }} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
          formatter={(v) => [(v as number).toLocaleString(), "Inercia"]}
          labelFormatter={(l) => `K = ${l}`}
        />
        <ReferenceLine x={kOptimo} stroke="#3B82F6" strokeDasharray="4 4" label={{ value: `K=${kOptimo} ✓`, fill: "#3B82F6", fontSize: 11 }} />
        <Line type="monotone" dataKey="inercia" stroke="#F59E0B" strokeWidth={2} dot={{ fill: "#F59E0B", r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
