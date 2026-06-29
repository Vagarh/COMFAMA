import { fmt } from "@/lib/utils";

interface Props {
  TP: number;
  FP: number;
  FN: number;
  TN: number;
  model: string;
}

export function ConfusionMatrix({ TP, FP, FN, TN, model }: Props) {
  const total = TP + FP + FN + TN;

  return (
    <div>
      <p className="text-slate-400 text-xs mb-3 text-center">{model}</p>
      <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
        <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-4 text-center">
          <p className="text-green-400 text-2xl font-bold">{fmt(TP)}</p>
          <p className="text-green-300 text-xs mt-1 font-semibold">Verdadero Positivo</p>
          <p className="text-slate-400 text-xs mt-1">Fraude detectado ✓</p>
          <p className="text-slate-500 text-xs">{((TP / total) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-4 text-center">
          <p className="text-amber-400 text-2xl font-bold">{fmt(FP)}</p>
          <p className="text-amber-300 text-xs mt-1 font-semibold">Falso Positivo</p>
          <p className="text-slate-400 text-xs mt-1">Alarma falsa ⚠</p>
          <p className="text-slate-500 text-xs">{((FP / total) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-red-500/20 border border-red-500/40 rounded-lg p-4 text-center">
          <p className="text-red-400 text-2xl font-bold">{fmt(FN)}</p>
          <p className="text-red-300 text-xs mt-1 font-semibold">Falso Negativo</p>
          <p className="text-slate-400 text-xs mt-1">Fraude perdido ✗</p>
          <p className="text-slate-500 text-xs">{((FN / total) * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-center">
          <p className="text-slate-200 text-2xl font-bold">{fmt(TN)}</p>
          <p className="text-slate-300 text-xs mt-1 font-semibold">Verdadero Negativo</p>
          <p className="text-slate-400 text-xs mt-1">Legítimo correcto ✓</p>
          <p className="text-slate-500 text-xs">{((TN / total) * 100).toFixed(1)}%</p>
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs text-slate-500 max-w-xs mx-auto">
        <span>← Predicho Fraude | Predicho No Fraude →</span>
      </div>
    </div>
  );
}
