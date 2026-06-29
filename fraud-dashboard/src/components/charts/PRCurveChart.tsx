"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CurvaPR { precision: number[]; recall: number[] }
interface Props {
  rf: CurvaPR & { auc: number };
  xgb: CurvaPR & { auc: number };
}

export function PRCurveChart({ rf, xgb }: Props) {
  const data = rf.recall.map((recall, i) => ({
    recall,
    rf_prec: rf.precision[i],
    xgb_prec: xgb.precision[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="recall" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => v.toFixed(1)} label={{ value: "Recall", fill: "#64748B", fontSize: 11, position: "insideBottom", offset: -2 }} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} label={{ value: "Precisión", fill: "#64748B", fontSize: 11, angle: -90, position: "insideLeft" }} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
          formatter={(v) => (v as number).toFixed(3)}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
        <Line type="monotone" dataKey="rf_prec" stroke="#3B82F6" dot={false} strokeWidth={2} name={`RF (PR-AUC ${rf.auc})`} />
        <Line type="monotone" dataKey="xgb_prec" stroke="#22C55E" dot={false} strokeWidth={2} name={`XGBoost (PR-AUC ${xgb.auc})`} />
      </LineChart>
    </ResponsiveContainer>
  );
}
