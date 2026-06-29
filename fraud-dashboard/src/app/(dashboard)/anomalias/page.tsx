import { loadAnomalias } from "@/lib/dataLoader";
import { SectionHeader } from "@/components/cards/SectionHeader";
import { InsightCard } from "@/components/cards/InsightCard";
import { KPICard } from "@/components/cards/KPICard";
import { AnomalyScoreChart } from "@/components/charts/AnomalyScoreChart";
import { fmt, fmtPct, fmtUSD } from "@/lib/utils";

export default async function AnomaliesPage() {
  const data = await loadAnomalias();
  const { configuracion, resultados } = data;
  const { patrones_anomalias: patrones, validacion_vs_target: val, top_anomalias } = resultados;

  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Detección de Anomalías</h1>
        <p className="text-slate-400 mt-1">Punto 2 del reto · Isolation Forest · Sin etiquetas de fraude</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Anomalías Detectadas" value={fmt(resultados.total_anomalias_detectadas)} subtitle="Sin usar variable target" icon="⚠️" color="amber" />
        <KPICard title="Contamination" value={fmtPct(configuracion.contamination * 100)} subtitle="Calculado matemáticamente" icon="🧮" color="blue" />
        <KPICard title="Precisión vs Ground Truth" value={fmtPct(val.precision_anomalia_vs_fraude * 100)} subtitle="Validación interna (solo reto)" icon="✅" color="green" />
        <KPICard title="Recall vs Ground Truth" value={fmtPct(val.recall_anomalia_vs_fraude * 100)} subtitle="Fraudes reales capturados" icon="🎯" color="red" />
      </div>

      {/* Contexto del problema */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="¿Por qué detección no supervisada?"
          subtitle="Punto 2: Cuando no hay ejemplos históricos de fraude"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InsightCard
            icon="🆕"
            title="Nueva modalidad de fraude"
            body="Cuando surge una modalidad nueva (ej: fraude en registro de terceros), no existen ejemplos previos etiquetados para entrenar un modelo supervisado. El enfoque no supervisado detecta desviaciones del comportamiento normal."
            accent="blue"
          />
          <InsightCard
            icon="🌲"
            title="Isolation Forest"
            body="Aísla observaciones anómalas construyendo árboles aleatorios. Las anomalías son más fáciles de aislar (requieren menos particiones). Score negativo = más anómalo. No necesita etiquetas."
            accent="amber"
          />
          <InsightCard
            icon="🔐"
            title="Aplicación: Nuevos Terceros"
            body="En registro de proveedores/clientes, detecta patrones inusuales: velocidad de registro, datos atípicos, patrones de campos, geolocalización. Genera alertas para revisión del equipo de control interno."
            accent="green"
          />
        </div>
      </div>

      {/* Threshold matemático */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Definición Matemática del Threshold de Contaminación"
          badge={`contamination = ${configuracion.contamination}`}
        />
        <div className="bg-slate-900/60 rounded-lg p-5 mb-4 font-mono text-sm">
          <p className="text-slate-400 mb-2">{"// Estrategia: sin usar target, identificar outliers estadísticos"}</p>
          <p className="text-green-400">n_sospechosos = len(df[</p>
          <p className="text-green-400 ml-4">(score_dispositivo {"<"} Q1 - 1.5 × IQR)  <span className="text-slate-400"># Score muy bajo</span></p>
          <p className="text-green-400 ml-4">| (intentos_fallidos_24h {">="}  3)           <span className="text-slate-400"># Múltiples reintentos</span></p>
          <p className="text-green-400">])</p>
          <p className="text-blue-400 mt-2">contamination = n_sospechosos / len(df) = {configuracion.contamination}</p>
        </div>
        <p className="text-slate-300 text-sm">{configuracion.justificacion_matematica}</p>
        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-blue-300 text-sm font-semibold">💡 Estrategia para Control Interno</p>
          <p className="text-slate-300 text-sm mt-1">
            Si el equipo de control interno puede revisar <strong>N alertas por día</strong>, el threshold se ajusta como:
            {" "}<code className="text-blue-400 font-mono">contamination = N / total_registros_diarios</code>.
            Esto garantiza que el volumen de alertas nunca supere la capacidad del equipo, reduciendo el riesgo de fatiga por alertas.
          </p>
        </div>
      </div>

      {/* Histograma de scores */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Distribución de Anomaly Scores"
          subtitle="Valores más negativos = más anómalos. La línea roja marca el umbral de clasificación"
        />
        <AnomalyScoreChart
          binsLeft={resultados.distribucion_scores.bins_left}
          conteos={resultados.distribucion_scores.conteos}
          threshold={resultados.distribucion_scores.threshold_anomalia}
        />
      </div>

      {/* Patrones detectados */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader title="Perfil de las Anomalías Detectadas" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Hora promedio", value: `${patrones.hora_promedio}h`, icon: "🌙", note: "Horario nocturno" },
            { label: "Monto promedio", value: fmtUSD(patrones.monto_promedio), icon: "💰", note: "Alto vs. media $80" },
            { label: "País no coincide", value: fmtPct(patrones.pct_pais_no_coincide), icon: "🌍", note: "Mayoría internacional" },
            { label: "Electrónica/Viajes", value: fmtPct(patrones.pct_categorias_alto_riesgo), icon: "🛒", note: "Categorías de alto valor" },
          ].map((p) => (
            <div key={p.label} className="bg-slate-900/60 rounded-lg p-4 text-center">
              <span className="text-2xl">{p.icon}</span>
              <p className="text-white font-bold text-xl mt-2">{p.value}</p>
              <p className="text-slate-400 text-xs mt-1">{p.label}</p>
              <p className="text-amber-400 text-xs mt-1">{p.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top anomalías */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader
          title="Top 20 Transacciones más Anómalas"
          subtitle="Ordenadas por anomaly score (menor = más sospechoso)"
        />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {["ID", "Score", "Monto", "Categoría", "Hora", "País", "Score Disp.", "Intentos"].map((h) => (
                  <th key={h} className="text-left text-slate-400 py-3 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {top_anomalias.map((a, i) => (
                <tr key={a.id_transaccion} className={`border-b border-slate-700/50 hover:bg-slate-700/20 ${i < 5 ? "bg-red-500/5" : ""}`}>
                  <td className="py-2 pr-4 font-mono text-blue-400 text-xs">{a.id_transaccion}</td>
                  <td className="py-2 pr-4 font-mono text-red-400 text-xs">{a.anomaly_score.toFixed(4)}</td>
                  <td className="py-2 pr-4 text-white">{fmtUSD(a.monto)}</td>
                  <td className="py-2 pr-4 text-slate-300">{a.categoria_comercio}</td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs ${(a.hora >= 23 || a.hora <= 5) ? "text-red-400" : "text-slate-300"}`}>
                      {a.hora}:00
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs ${a.pais_coincide === 0 ? "text-red-400" : "text-green-400"}`}>
                      {a.pais_coincide === 0 ? "❌ No" : "✅ Sí"}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs ${a.score_dispositivo < 30 ? "text-red-400" : "text-slate-300"}`}>
                      {a.score_dispositivo}
                    </span>
                  </td>
                  <td className="py-2 pr-4">
                    <span className={`text-xs ${a.intentos_fallidos_24h >= 3 ? "text-red-400 font-bold" : "text-slate-300"}`}>
                      {a.intentos_fallidos_24h}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
