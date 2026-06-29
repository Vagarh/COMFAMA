import { loadClustering } from "@/lib/dataLoader";
import { SectionHeader } from "@/components/cards/SectionHeader";
import { InsightCard } from "@/components/cards/InsightCard";
import { KPICard } from "@/components/cards/KPICard";
import { ClusterScatterChart } from "@/components/charts/ClusterScatterChart";
import { ElbowChart } from "@/components/charts/ElbowChart";
import { fmt, fmtPct } from "@/lib/utils";

export default async function ClusteringPage() {
  const data = await loadClustering();
  const { configuracion, clusters, elbow_data, scatter_pca, pca_varianza_explicada } = data;

  const riskOrder = [...clusters].sort((a, b) => b.tasa_fraude - a.tasa_fraude);

  return (
    <div className="p-8 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">Segmentación de Riesgo</h1>
        <p className="text-slate-400 mt-1">Punto 3 del reto · K-Means K=4 · Clústeres de Madurez de Riesgo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Algoritmo" value="K-Means" subtitle={`K=${configuracion.k_elegido} seleccionado por elbow`} icon="🗂️" color="blue" />
        <KPICard title="Clústeres" value={`${configuracion.k_elegido}`} subtitle="Segmentos de perfil de riesgo" icon="📊" color="slate" />
        <KPICard title="Varianza PC1+PC2" value={fmtPct(pca_varianza_explicada[0] + pca_varianza_explicada[1])} subtitle="Explicada por las 2 componentes" icon="📈" color="amber" />
        <KPICard
          title="Clúster Más Riesgoso"
          value={`${riskOrder[0]?.tasa_fraude}%`}
          subtitle={riskOrder[0]?.nombre ?? ""}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Estrategia */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader title="Estrategia de Segmentación" subtitle="Punto 3 del reto técnico" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <InsightCard
            icon="🔍"
            title="Variables de Control Usadas"
            body={`${configuracion.features_usadas.join(", ")}. Se escalan con StandardScaler para que ninguna variable domine por su magnitud.`}
            accent="blue"
          />
          <InsightCard
            icon="📐"
            title="Selección de K: Método del Codo"
            body="Se evaluaron K=2 a K=8. K=4 es el punto donde el descenso de inercia se estabiliza, ofreciendo 4 perfiles interpretables y accionables para el equipo de control."
            accent="amber"
          />
          <InsightCard
            icon="🎯"
            title="Interpretabilidad para el Negocio"
            body="Cada clúster tiene un nombre, descripción y recomendación operativa. El objetivo no es solo agrupar, sino que el equipo de control interno sepa qué hacer con cada segmento."
            accent="green"
          />
        </div>
      </div>

      {/* Elbow + Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader title="Método del Codo" subtitle={`K=${configuracion.k_elegido} seleccionado por inflexión en la curva de inercia`} />
          <ElbowChart data={elbow_data} kOptimo={configuracion.k_elegido} />
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
          <SectionHeader
            title="Scatter PCA (muestra de 3,000 pts)"
            subtitle={`PC1 ${pca_varianza_explicada[0]}% + PC2 ${pca_varianza_explicada[1]}% = ${fmtPct(pca_varianza_explicada[0] + pca_varianza_explicada[1])} varianza`}
          />
          <ClusterScatterChart data={scatter_pca} varianza={pca_varianza_explicada} />
        </div>
      </div>

      {/* Cluster cards */}
      <div>
        <SectionHeader title="Perfiles de Riesgo por Clúster" subtitle="Ordenados de mayor a menor tasa de fraude" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {riskOrder.map((c) => (
            <div
              key={c.id}
              className="bg-slate-800/60 rounded-xl border border-slate-700 p-6"
              style={{ borderLeftColor: c.color, borderLeftWidth: 4 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                    <p className="text-white font-bold text-sm">{c.nombre}</p>
                  </div>
                  <p className="text-slate-400 text-xs">{fmt(c.size)} transacciones · {fmtPct(c.tasa_fraude)} fraude</p>
                </div>
                <span
                  className="text-lg font-bold px-3 py-1 rounded-full text-black"
                  style={{ background: c.color }}
                >
                  C{c.id}
                </span>
              </div>

              <p className="text-slate-300 text-sm mb-4">{c.descripcion}</p>

              {/* Centroide */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Monto prom.", value: `$${c.centroide.monto_promedio.toFixed(0)}` },
                  { label: "Score disp.", value: c.centroide.score_dispositivo_promedio.toFixed(1) },
                  { label: "Intentos", value: c.centroide.intentos_fallidos_promedio.toFixed(2) },
                  { label: "Hora prom.", value: `${c.centroide.hora_promedio.toFixed(1)}h` },
                  { label: "País no coinc.", value: fmtPct(c.centroide.pct_pais_no_coincide) },
                  { label: "Hora riesgo", value: fmtPct(c.centroide.pct_hora_riesgo) },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-900/60 rounded-lg p-2 text-center">
                    <p className="text-white text-sm font-bold">{stat.value}</p>
                    <p className="text-slate-500 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Recomendación */}
              <div className="flex items-start gap-2 bg-slate-900/60 rounded-lg p-3">
                <span className="text-sm">💡</span>
                <p className="text-slate-300 text-xs">{c.recomendacion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-6">
        <SectionHeader title="Tabla Comparativa de Centroides" subtitle="Valores promedio de cada variable por clúster" />
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 py-3 pr-4">Clúster</th>
                <th className="text-center text-slate-400 py-3 px-3">Tamaño</th>
                <th className="text-center text-slate-400 py-3 px-3">Tasa Fraude</th>
                <th className="text-center text-slate-400 py-3 px-3">Monto Prom.</th>
                <th className="text-center text-slate-400 py-3 px-3">Score Disp.</th>
                <th className="text-center text-slate-400 py-3 px-3">Intentos</th>
                <th className="text-center text-slate-400 py-3 px-3">Hora Prom.</th>
                <th className="text-center text-slate-400 py-3 px-3">País No Coinc.</th>
              </tr>
            </thead>
            <tbody>
              {riskOrder.map((c) => (
                <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                      <span className="text-slate-300 text-xs">{c.nombre}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">{fmt(c.size)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="font-bold" style={{ color: c.color }}>{fmtPct(c.tasa_fraude)}</span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">${c.centroide.monto_promedio.toFixed(0)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={c.centroide.score_dispositivo_promedio < 50 ? "text-red-400" : "text-slate-300"}>
                      {c.centroide.score_dispositivo_promedio.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={c.centroide.intentos_fallidos_promedio >= 2 ? "text-red-400" : "text-slate-300"}>
                      {c.centroide.intentos_fallidos_promedio.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">{c.centroide.hora_promedio.toFixed(1)}h</td>
                  <td className="py-3 px-3 text-center">
                    <span className={c.centroide.pct_pais_no_coincide > 50 ? "text-red-400" : "text-slate-300"}>
                      {fmtPct(c.centroide.pct_pais_no_coincide)}
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
