import { loadEDA, loadModels } from "@/lib/dataLoader";
import { KPICard } from "@/components/cards/KPICard";
import { InsightCard } from "@/components/cards/InsightCard";
import { SectionHeader } from "@/components/cards/SectionHeader";
import { FraudByHourChart } from "@/components/charts/FraudByHourChart";
import { FraudByCategoryChart } from "@/components/charts/FraudByCategoryChart";
import { fmt, fmtUSD, fmtPct } from "@/lib/utils";

export default async function OverviewPage() {
  const [eda, models] = await Promise.all([loadEDA(), loadModels()]);
  const { resumen_dataset } = eda;
  const ahorro = models.analisis_negocio.comparativa.xgboost.ahorro_vs_sin_modelo;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard Anti-Fraude</h1>
            <p className="text-slate-400 mt-1">
              Análisis de {fmt(resumen_dataset.total_transacciones)} transacciones ·{" "}
              {resumen_dataset.rango_fechas.inicio} — {resumen_dataset.rango_fechas.fin}
            </p>
          </div>
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
            Modelo activo: XGBoost
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Transacciones Analizadas"
          value={fmt(resumen_dataset.total_transacciones)}
          subtitle={`${resumen_dataset.rango_fechas.inicio} al ${resumen_dataset.rango_fechas.fin}`}
          icon="💳"
          color="blue"
        />
        <KPICard
          title="Fraudes Confirmados"
          value={fmt(resumen_dataset.total_fraudes)}
          subtitle={`${fmtPct(resumen_dataset.tasa_fraude_pct)} del total`}
          icon="🚨"
          color="red"
          trend={`Tasa: ${fmtPct(resumen_dataset.tasa_fraude_pct)} — Dataset desbalanceado`}
        />
        <KPICard
          title="F1-Score XGBoost"
          value={fmtPct(models.xgboost.metricas.f1 * 100)}
          subtitle={`AUC-ROC: ${models.xgboost.metricas.auc_roc}`}
          icon="🤖"
          color="green"
          trend="Mejor modelo seleccionado"
        />
        <KPICard
          title="Ahorro Estimado"
          value={fmtUSD(ahorro)}
          subtitle="vs. no tener modelo de detección"
          icon="💰"
          color="amber"
          trend={`Por detección de ${models.xgboost.confusion_matrix.TP} fraudes`}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader
            title="Fraude por Hora del Día"
            subtitle="Las horas 23h–5h (rojo) concentran la mayoría de los casos"
          />
          <FraudByHourChart data={eda.fraude_por_hora} />
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader
            title="Fraude por Categoría"
            subtitle="Electrónica y Viajes son las categorías de mayor riesgo"
          />
          <FraudByCategoryChart data={eda.fraude_por_categoria} />
        </div>
      </div>

      {/* Insights */}
      <div>
        <SectionHeader title="Hallazgos Clave" badge="3 insights" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InsightCard
            icon="🌍"
            title="País No Coincide = 15× Más Riesgo"
            body={`El ${fmtPct(eda.fraude_por_pais_coincide.find(p => !p.coincide)?.tasa ?? 0)} de las transacciones donde el país del emisor no coincide con el IP son fraude. Para transacciones con coincidencia, solo el ${fmtPct(eda.fraude_por_pais_coincide.find(p => p.coincide)?.tasa ?? 0)}.`}
            accent="red"
          />
          <InsightCard
            icon="🌙"
            title="Fraude Nocturno: 23h–5h"
            body="La variable 'hora de riesgo' es el segundo predictor más importante. Las transacciones nocturnas tienen 4–6× más probabilidad de ser fraude. El modelo la usa como señal primaria."
            accent="amber"
          />
          <InsightCard
            icon="🛡️"
            title="XGBoost Detecta el 97% del Fraude"
            body={`Con umbral optimizado ${models.xgboost.metricas.threshold_optimo}, el modelo detecta ${models.xgboost.confusion_matrix.TP} de ${models.split_info.fraudes_test} fraudes del test set, generando solo ${models.xgboost.confusion_matrix.FP} falsas alarmas.`}
            accent="green"
          />
        </div>
      </div>

      {/* País coincide stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eda.fraude_por_pais_coincide.map((p) => (
          <div key={String(p.coincide)} className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">
                {p.coincide ? "✅ País Coincide" : "❌ País No Coincide"}
              </p>
              <span className={`text-sm font-bold ${p.coincide ? "text-green-400" : "text-red-400"}`}>
                {fmtPct(p.tasa)} fraude
              </span>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <p className="text-slate-400">Transacciones</p>
                <p className="text-white font-bold text-lg">{fmt(p.total)}</p>
              </div>
              <div>
                <p className="text-slate-400">Fraudes</p>
                <p className="text-red-400 font-bold text-lg">{fmt(p.fraudes)}</p>
              </div>
            </div>
            <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={p.coincide ? "h-full bg-green-500 rounded-full" : "h-full bg-red-500 rounded-full"}
                style={{ width: `${p.tasa}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
