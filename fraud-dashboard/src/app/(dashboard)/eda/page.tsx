import { loadEDA } from "@/lib/dataLoader";
import { SectionHeader } from "@/components/cards/SectionHeader";
import { InsightCard } from "@/components/cards/InsightCard";
import { AmountDistributionChart } from "@/components/charts/AmountDistributionChart";
import { FraudByCategoryChart } from "@/components/charts/FraudByCategoryChart";
import { fmt, fmtPct } from "@/lib/utils";

export default async function EDAPage() {
  const eda = await loadEDA();

  const maxCorr = eda.correlacion_features.nombres
    .map((n, i) => ({
      nombre: n,
      corr: eda.correlacion_features.matriz[i][eda.correlacion_features.nombres.indexOf("target")],
    }))
    .filter((c) => c.nombre !== "target")
    .sort((a, b) => Math.abs(b.corr) - Math.abs(a.corr));

  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Análisis Exploratorio de Datos</h1>
        <p className="text-slate-400 mt-1">EDA completo · Punto 1 del reto técnico</p>
      </div>

      {/* Resumen del dataset */}
      <div>
        <SectionHeader title="Resumen del Dataset" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total transacciones", value: fmt(eda.resumen_dataset.total_transacciones), color: "text-blue-400" },
            { label: "Casos de fraude", value: fmt(eda.resumen_dataset.total_fraudes), color: "text-red-400" },
            { label: "Tasa de fraude", value: fmtPct(eda.resumen_dataset.tasa_fraude_pct), color: "text-amber-400" },
            { label: "Nulos imputados", value: fmt(eda.resumen_dataset.nulos_score_dispositivo), color: "text-purple-400" },
          ].map((item) => (
            <div key={item.label} className="bg-slate-800/60 rounded-xl border border-slate-700 p-5">
              <p className="text-slate-400 text-sm">{item.label}</p>
              <p className={`text-2xl font-bold mt-1 ${item.color}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Imputación */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Tratamiento de Valores Nulos"
          subtitle={`${fmt(eda.imputacion_report.nulos_imputados)} valores faltantes en score_dispositivo (${fmtPct((eda.imputacion_report.nulos_imputados / eda.resumen_dataset.total_transacciones) * 100)})`}
          badge="Imputación estratificada"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InsightCard
            icon="🧩"
            title="Estrategia: Mediana Estratificada"
            body="Se imputó con la mediana por grupo (país_coincide × categoría_comercio). La mediana es robusta a outliers — crítico en fraude donde los valores extremos son la señal, no el ruido."
            accent="blue"
          />
          <InsightCard
            icon="⚠️"
            title="Por qué No Imputación Global"
            body="Los nulos no son aleatorios (MAR). Un dispositivo no identificado en Electrónica internacional tiene un perfil de riesgo diferente a uno en Retail doméstico. La imputación global mezclaría estas distribuciones."
            accent="amber"
          />
          <InsightCard
            icon="📊"
            title="Variables Usadas para Estratificar"
            body={`Grupos: ${eda.imputacion_report.grupos_usados.join(" × ")}. Con ${Object.keys(eda.imputacion_report.medianas_por_grupo).length} combinaciones únicas de grupos, cada celda tiene su propia mediana representativa.`}
            accent="green"
          />
        </div>
      </div>

      {/* Distribución de montos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader
            title="Distribución de Montos"
            subtitle="Comparación entre total de transacciones y casos de fraude por rango de monto"
          />
          <AmountDistributionChart
            labels={eda.distribucion_monto.bins_labels}
            conteos_total={eda.distribucion_monto.conteos_total}
            conteos_fraude={eda.distribucion_monto.conteos_fraude}
          />
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader
            title="Tasa de Fraude por Categoría"
            subtitle="Electrónica y Viajes lideran en proporción de fraude"
          />
          <FraudByCategoryChart data={eda.fraude_por_categoria} />
        </div>
      </div>

      {/* Feature Engineering */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Feature Engineering"
          subtitle="Variables creadas a partir de timestamp y transformaciones"
          badge="4 nuevas variables"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            {
              name: "es_hora_riesgo",
              desc: "Booleano: True si la hora está entre las 23:00 y las 05:00. Captura el patrón de fraude nocturno — el 2do predictor más importante según SHAP.",
              formula: "hora >= 23 OR hora <= 5",
              icon: "🌙",
            },
            {
              name: "hora",
              desc: "Extracción del componente hora del timestamp. Permite al modelo capturar ciclos intradiarios de comportamiento fraudulento.",
              formula: "timestamp.dt.hour",
              icon: "⏰",
            },
            {
              name: "dia_semana",
              desc: "Día de la semana (0=Lunes, 6=Domingo). Los fines de semana tienen patrones de transacción diferentes y menor monitoreo humano.",
              formula: "timestamp.dt.dayofweek",
              icon: "📅",
            },
            {
              name: "monto_log",
              desc: "Transformación log1p del monto. La distribución del monto está muy sesgada a la derecha. log1p normaliza la escala y mejora el entrenamiento de los árboles.",
              formula: "log(1 + monto)",
              icon: "📈",
            },
          ].map((f) => (
            <div key={f.name} className="bg-slate-900/60 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">{f.icon}</span>
                <div>
                  <p className="text-blue-400 font-mono text-sm font-semibold">{f.name}</p>
                  <p className="text-slate-300 text-sm mt-1">{f.desc}</p>
                  <p className="text-slate-500 font-mono text-xs mt-2">Formula: {f.formula}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Correlaciones */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Correlación con Target (Fraude)"
          subtitle="Correlación de Pearson entre cada feature y la variable objetivo"
        />
        <div className="space-y-2">
          {maxCorr.map((c) => {
            const pct = Math.abs(c.corr) * 100;
            const isPositive = c.corr > 0;
            return (
              <div key={c.nombre} className="flex items-center gap-3">
                <span className="text-slate-400 text-sm w-48 font-mono">{c.nombre}</span>
                <div className="flex-1 h-5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isPositive ? "bg-red-500" : "bg-blue-500"}`}
                    style={{ width: `${pct * 5}%` }}
                  />
                </div>
                <span className={`text-sm font-mono w-16 text-right ${isPositive ? "text-red-400" : "text-blue-400"}`}>
                  {c.corr.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-slate-500 text-xs mt-3">Rojo = correlación positiva con fraude · Azul = correlación negativa</p>
      </div>

      {/* Intentos fallidos */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Distribución: Intentos Fallidos en 24h"
          subtitle="La mayoría tiene 0 intentos; múltiples reintentos son señal de alerta"
        />
        <div className="flex gap-4 flex-wrap">
          {eda.intentos_fallidos_distribucion.map((item) => (
            <div
              key={item.intentos}
              className={`rounded-lg p-4 text-center flex-1 min-w-[80px] ${item.intentos >= 3 ? "bg-red-500/20 border border-red-500/40" : "bg-slate-700/50 border border-slate-600"}`}
            >
              <p className={`text-2xl font-bold ${item.intentos >= 3 ? "text-red-400" : "text-white"}`}>
                {item.intentos}
              </p>
              <p className="text-slate-400 text-xs">intentos</p>
              <p className="text-slate-300 text-sm font-medium mt-1">{fmt(item.conteo)}</p>
              <p className="text-slate-500 text-xs">{fmtPct((item.conteo / eda.resumen_dataset.total_transacciones) * 100)}</p>
            </div>
          ))}
        </div>
        <p className="text-amber-400 text-sm mt-3">⚠ Los registros con 3+ intentos ({fmt(eda.intentos_fallidos_distribucion.filter(i => i.intentos >= 3).reduce((a, b) => a + b.conteo, 0))}) son señal crítica de credential stuffing</p>
      </div>
    </div>
  );
}
