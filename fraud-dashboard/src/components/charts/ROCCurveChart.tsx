"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

interface CurvaROC { fpr: number[]; tpr: number[] }
interface Props {
  rf: CurvaROC & { auc: number };
  xgb: CurvaROC & { auc: number };
}

export function ROCCurveChart({ rf, xgb }: Props) {
  const data = rf.fpr.map((fpr, i) => ({
    fpr: fpr,
    rf_tpr: rf.tpr[i],
    xgb_tpr: xgb.tpr[i],
    diagonal: fpr,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <XAxis dataKey="fpr" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v) => v.toFixed(1)} label={{ value: "FPR", fill: "#64748B", fontSize: 11, position: "insideBottom", offset: -2 }} />
        <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} label={{ value: "TPR", fill: "#64748B", fontSize: 11, angle: -90, position: "insideLeft" }} />
        <Tooltip
          contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, color: "#F1F5F9", fontSize: 12 }}
          formatter={(v) => (v as number).toFixed(3)}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#94A3B8" }} />
        <Line type="monotone" dataKey="diagonal" stroke="#475569" strokeDasharray="4 4" dot={false} name="Azar" />
        <Line type="monotone" dataKey="rf_tpr" stroke="#3B82F6" dot={false} strokeWidth={2} name={`Random Forest (AUC ${rf.auc})`} />
        <Line type="monotone" dataKey="xgb_tpr" stroke="#22C55E" dot={false} strokeWidth={2} name={`XGBoost (AUC ${xgb.auc})`} />
      </LineChart>
    </ResponsiveContainer>
  );
}
