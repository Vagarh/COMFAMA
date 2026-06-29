import { loadModels } from "@/lib/dataLoader";
import { SectionHeader } from "@/components/cards/SectionHeader";
import { InsightCard } from "@/components/cards/InsightCard";
import { KPICard } from "@/components/cards/KPICard";
import { ConfusionMatrix } from "@/components/charts/ConfusionMatrix";
import { ROCCurveChart } from "@/components/charts/ROCCurveChart";
import { PRCurveChart } from "@/components/charts/PRCurveChart";
import { FeatureImportanceChart } from "@/components/charts/FeatureImportanceChart";
import { ShapWaterfallChart } from "@/components/charts/ShapWaterfallChart";
import { fmtUSD, fmtPct, fmt } from "@/lib/utils";

export default async function ModelsPage() {
  const data = await loadModels();
  const { random_forest: rf, xgboost: xgb, split_info, shap, analisis_negocio: negocio } = data;

  const metricas = [
    { label: "Precisión", key: "precision", desc: "De las alarmas generadas, ¿cuántas son fraude real?" },
    { label: "Recall (Sensibilidad)", key: "recall", desc: "De todos los fraudes, ¿cuántos detecta el modelo?" },
    { label: "F1-Score", key: "f1", desc: "Media armónica entre Precisión y Recall" },
    { label: "AUC-ROC", key: "auc_roc", desc: "Capacidad de separar fraude de legítimo" },
    { label: "PR-AUC", key: "pr_auc", desc: "Más informativo que ROC en datos desbalanceados" },
  ] as const;

  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Modelos Supervisados</h1>
        <p className="text-slate-400 mt-1">Punto 1 del reto · RandomForest + XGBoost · SMOTE · SHAP</p>
      </div>

      {/* Split info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Train Set" value={fmt(split_info.train_size)} subtitle="80% estratificado" icon="📦" color="blue" />
        <KPICard title="Test Set" value={fmt(split_info.test_size)} subtitle="20% estratificado" icon="🧪" color="slate" />
        <KPICard title="Fraudes en Test" value={fmt(split_info.fraudes_test)} subtitle={`${fmtPct((split_info.fraudes_test / split_info.test_size) * 100)} del test`} icon="🚨" color="red" />
        <KPICard title="Sintéticos SMOTE" value={fmt(split_info.smote_sinteticos_generados)} subtitle="Generados solo en train" icon="🔬" color="amber" />
      </div>

      {/* Por qué no accuracy */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader title="¿Por qué no usamos Accuracy?" badge="Crítico entender esto" />
        <InsightCard
          icon="⚠️"
          title="El Paradox del Accuracy en Datos Desbalanceados"
          body="Con 1.5% de fraude, un modelo que NUNCA detecte fraude tendría 98.5% de accuracy. Esto es inútil para el negocio. Necesitamos métricas que penalicen los fraudes perdidos (Falsos Negativos) y las alarmas falsas (Falsos Positivos) de forma independiente."
          accent="red"
        />
      </div>

      {/* Tabla comparativa */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader title="Comparativa de Métricas" subtitle="Umbral óptimo hallado maximizando F1 en el test set" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 py-3 pr-4">Métrica</th>
                <th className="text-center text-slate-400 py-3 px-4">Random Forest</th>
                <th className="text-center text-slate-400 py-3 px-4">XGBoost ⭐</th>
                <th className="text-left text-slate-400 py-3 pl-4">Significado</th>
              </tr>
            </thead>
            <tbody>
              {metricas.map((m) => {
                const rfVal = rf.metricas[m.key];
                const xgbVal = xgb.metricas[m.key];
                const xgbWins = xgbVal >= rfVal;
                return (
                  <tr key={m.key} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 pr-4 text-slate-300 font-medium">{m.label}</td>
                    <td className={`py-3 px-4 text-center font-mono ${!xgbWins ? "text-blue-400 font-bold" : "text-slate-400"}`}>
                      {(rfVal * 100).toFixed(2)}%
                    </td>
                    <td className={`py-3 px-4 text-center font-mono ${xgbWins ? "text-green-400 font-bold" : "text-slate-400"}`}>
                      {(xgbVal * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 pl-4 text-slate-500 text-xs">{m.desc}</td>
                  </tr>
                );
              })}
              <tr className="border-b border-slate-700/50">
                <td className="py-3 pr-4 text-slate-300 font-medium">Threshold Óptimo</td>
                <td className="py-3 px-4 text-center font-mono text-slate-400">{rf.metricas.threshold_optimo}</td>
                <td className="py-3 px-4 text-center font-mono text-green-400 font-bold">{xgb.metricas.threshold_optimo}</td>
                <td className="py-3 pl-4 text-slate-500 text-xs">Punto de corte que maximiza F1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Matrices de confusión */}
      <div>
        <SectionHeader title="Matrices de Confusión" subtitle="Con threshold óptimo en el test set" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <ConfusionMatrix {...rf.confusion_matrix} model="Random Forest" />
          </div>
          <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
            <ConfusionMatrix {...xgb.confusion_matrix} model="XGBoost ⭐" />
          </div>
        </div>
      </div>

      {/* Curvas ROC y PR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader title="Curva ROC" subtitle="Mayor área bajo la curva = mejor discriminación" />
          <ROCCurveChart
            rf={{ ...rf.curva_roc, auc: rf.metricas.auc_roc }}
            xgb={{ ...xgb.curva_roc, auc: xgb.metricas.auc_roc }}
          />
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader title="Curva Precision-Recall" subtitle="Más informativa que ROC con clases desbalanceadas" />
          <PRCurveChart
            rf={{ ...rf.curva_pr, auc: rf.metricas.pr_auc }}
            xgb={{ ...xgb.curva_pr, auc: xgb.metricas.pr_auc }}
          />
        </div>
      </div>

      {/* Feature importance */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader title="Importancia de Variables" subtitle="Top 10 features por ganancia de información — XGBoost" />
        <FeatureImportanceChart data={xgb.feature_importance} />
      </div>

      {/* SHAP */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Explicabilidad SHAP"
          subtitle={`SHAP (SHapley Additive exPlanations) para ${shap.modelo_seleccionado} — muestra de 2,000 transacciones del test set`}
          badge="XGBoost"
        />

        {/* SHAP importancia global */}
        <div className="mb-6">
          <p className="text-slate-300 text-sm font-medium mb-3">Importancia Global (|SHAP| medio)</p>
          <div className="space-y-2">
            {shap.valores_medios_abs.slice(0, 8).map((s, i) => {
              const max = shap.valores_medios_abs[0].shap_mean_abs;
              return (
                <div key={s.feature} className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs w-4">{i + 1}</span>
                  <span className="text-slate-300 text-sm w-48 font-mono">{s.feature}</span>
                  <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(s.shap_mean_abs / max) * 100}%`,
                        background: i === 0 ? "#EF4444" : i < 3 ? "#F97316" : "#3B82F6",
                      }}
                    />
                  </div>
                  <span className="text-slate-400 text-xs font-mono w-16 text-right">{s.shap_mean_abs.toFixed(4)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waterfall examples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-red-400 text-sm font-semibold mb-3">🚨 Ejemplo: Transacción Fraudulenta</p>
            <ShapWaterfallChart
              contribs={shap.waterfall_fraude.contribuciones}
              valorBase={shap.waterfall_fraude.valor_base}
              label="Muestra del test set"
            />
          </div>
          <div>
            <p className="text-green-400 text-sm font-semibold mb-3">✅ Ejemplo: Transacción Legítima</p>
            <ShapWaterfallChart
              contribs={shap.waterfall_legitimo.contribuciones}
              valorBase={shap.waterfall_legitimo.valor_base}
              label="Muestra del test set"
            />
          </div>
        </div>
      </div>

      {/* Análisis de negocio */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Trade-off FP vs FN: Impacto de Negocio"
          subtitle="¿Cuánto le cuesta a la empresa un Falso Positivo vs. un Falso Negativo?"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <InsightCard
            icon="💸"
            title={`Falso Negativo = ${fmtUSD(negocio.costo_fn_unitario)}`}
            body="Un fraude que el modelo NO detecta. La empresa asume el costo total de la transacción fraudulenta. Costo unitario estimado con el monto promedio de los fraudes en el test set."
            accent="red"
          />
          <InsightCard
            icon="⚠️"
            title={`Falso Positivo = ${fmtUSD(negocio.costo_fp_unitario)}`}
            body="Una alarma falsa sobre una transacción legítima. Implica fricción para el cliente (revisión manual, posible bloqueo). Estimado en $5 USD por revisión de analista."
            accent="amber"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 py-3 pr-4">Escenario</th>
                <th className="text-center text-slate-400 py-3 px-3">Fraudes Perdidos</th>
                <th className="text-center text-slate-400 py-3 px-3">Alarmas Falsas</th>
                <th className="text-center text-slate-400 py-3 px-3">Costo Fraudes</th>
                <th className="text-center text-slate-400 py-3 px-3">Costo Revisiones</th>
                <th className="text-center text-slate-400 py-3 px-3">Costo Total</th>
                <th className="text-center text-slate-400 py-3 px-3">Ahorro</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50 bg-red-500/5">
                <td className="py-3 pr-4 text-red-400 font-medium">Sin modelo</td>
                <td className="py-3 px-3 text-center text-red-400">{fmt(negocio.comparativa.sin_modelo.fraudes_perdidos)}</td>
                <td className="py-3 px-3 text-center text-slate-500">—</td>
                <td className="py-3 px-3 text-center text-red-400">{fmtUSD(negocio.comparativa.sin_modelo.costo_total_fraude)}</td>
                <td className="py-3 px-3 text-center text-slate-500">—</td>
                <td className="py-3 px-3 text-center text-red-400 font-bold">{fmtUSD(negocio.comparativa.sin_modelo.costo_total_fraude)}</td>
                <td className="py-3 px-3 text-center text-slate-500">—</td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 pr-4 text-blue-400 font-medium">Random Forest</td>
                <td className="py-3 px-3 text-center text-slate-300">{fmt(negocio.comparativa.random_forest.fn)}</td>
                <td className="py-3 px-3 text-center text-amber-400">{fmt(negocio.comparativa.random_forest.fp)}</td>
                <td className="py-3 px-3 text-center text-slate-300">{fmtUSD(negocio.comparativa.random_forest.costo_fraudes_perdidos)}</td>
                <td className="py-3 px-3 text-center text-slate-300">{fmtUSD(negocio.comparativa.random_forest.costo_revisiones_falsas)}</td>
                <td className="py-3 px-3 text-center text-blue-400 font-bold">{fmtUSD(negocio.comparativa.random_forest.costo_total)}</td>
                <td className="py-3 px-3 text-center text-green-400">{fmtUSD(negocio.comparativa.random_forest.ahorro_vs_sin_modelo)}</td>
              </tr>
              <tr className="border-b border-slate-700/50 bg-green-500/5">
                <td className="py-3 pr-4 text-green-400 font-medium">XGBoost ⭐</td>
                <td className="py-3 px-3 text-center text-slate-300">{fmt(negocio.comparativa.xgboost.fn)}</td>
                <td className="py-3 px-3 text-center text-amber-400">{fmt(negocio.comparativa.xgboost.fp)}</td>
                <td className="py-3 px-3 text-center text-slate-300">{fmtUSD(negocio.comparativa.xgboost.costo_fraudes_perdidos)}</td>
                <td className="py-3 px-3 text-center text-slate-300">{fmtUSD(negocio.comparativa.xgboost.costo_revisiones_falsas)}</td>
                <td className="py-3 px-3 text-center text-green-400 font-bold">{fmtUSD(negocio.comparativa.xgboost.costo_total)}</td>
                <td className="py-3 px-3 text-center text-green-400 font-bold">{fmtUSD(negocio.comparativa.xgboost.ahorro_vs_sin_modelo)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm font-semibold">💡 Conclusión del Trade-off</p>
          <p className="text-slate-300 text-sm mt-1">
            En fraude financiero, <strong>priorizar Recall sobre Precisión</strong> es la decisión correcta porque el costo de
            un FN ({fmtUSD(negocio.costo_fn_unitario)}) supera en ~{Math.round(negocio.costo_fn_unitario / negocio.costo_fp_unitario)}× el costo de un FP ({fmtUSD(negocio.costo_fp_unitario)}).
            Sin embargo, un Recall del 100% con baja Precisión saturaría al equipo de revisión — el threshold óptimo
            busca el balance que minimiza el costo total esperado.
          </p>
        </div>
      </div>
    </div>
  );
}
