'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Real pipeline data ───────────────────────────────────────────────────────
const D = {
  total: 50000,
  fraudes: 750,
  tasa: 1.5,
  rf:  { f1: 96.08, recall: 98.00, precision: 94.23, auc: 99.99 },
  xgb: { f1: 97.39, recall: 99.33, precision: 95.51, auc: 100.0 },
  ahorro: 55038,
  sinModelo: 277215,
  anomalias: { total: 1345, recallPct: 95.7, contamPct: 2.69 },
  clusters: [
    { id: 0, label: 'Zona Segura',              sublabel: 'Transacciones típicas',          tasa: 0.01,  color: '#22C55E', bg: '#052e16', emoji: '🏡', size: '~35 000' },
    { id: 1, label: 'Zona Nocturna',             sublabel: 'Electrónica internacional',      tasa: 0.27,  color: '#3B82F6', bg: '#0c1a3d', emoji: '🌙', size: '~8 000'  },
    { id: 2, label: 'Zona de Peligro',           sublabel: 'Viajes y servicios',             tasa: 1.88,  color: '#F59E0B', bg: '#2d1a00', emoji: '⚠️', size: '~5 000'  },
    { id: 3, label: 'Guarida del Jefe Final',    sublabel: 'Credential stuffing',            tasa: 97.89, color: '#EF4444', bg: '#2d0505', emoji: '💀', size: '~2 000'  },
  ],
}

const TOTAL = 10
const PX = { fontFamily: "var(--font-pixel, 'Courier New', monospace)" }

// ─── Utilities ────────────────────────────────────────────────────────────────
function HPBar({ value, color, label }: { value: number; color: string; label: string }) {
  const [width, setWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setWidth(value), 300); return () => clearTimeout(t) }, [value])
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-[9px] text-slate-400" style={PX}>{label}</span>
        <span className="text-[9px]" style={{ ...PX, color }}>{value.toFixed(2)}%</span>
      </div>
      <div className="h-3 bg-slate-900 border border-slate-700 w-full">
        <div
          className="h-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function Blink({ children, color = '#22C55E' }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="animate-pulse" style={{ color }}>{children}</span>
  )
}

function TypeText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    setShown('')
    let i = 0
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        i++
        setShown(text.slice(0, i))
        if (i >= text.length) clearInterval(iv)
      }, 28)
      return () => clearInterval(iv)
    }, delay)
    return () => clearTimeout(start)
  }, [text, delay])
  return <span>{shown}<span className="animate-pulse">█</span></span>
}

function SlideWrap({ children, bg = '#080C14' }: { children: React.ReactNode; bg?: string }) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative px-8 py-10"
      style={{ backgroundColor: bg }}
    >
      {/* pixel grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative z-10 w-full max-w-4xl">{children}</div>
    </div>
  )
}

function Tag({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-block px-2 py-1 text-[8px] border"
      style={{ ...PX, color, borderColor: color, backgroundColor: color + '18' }}
    >
      {children}
    </span>
  )
}

function SectionTitle({ icon, title, color = '#F59E0B' }: { icon: string; title: string; color?: string }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <h2 className="text-sm leading-relaxed" style={{ ...PX, color }}>{title}</h2>
    </div>
  )
}

function DecisionBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-slate-600 bg-slate-900/60 px-5 py-4 text-[9px] text-slate-300 leading-7" style={PX}>
      {children}
    </div>
  )
}

// ─── SLIDES ───────────────────────────────────────────────────────────────────

function Slide0() {
  return (
    <SlideWrap>
      <div className="flex flex-col items-center text-center gap-10">
        <div className="text-6xl animate-bounce">⚔️</div>
        <h1 className="text-3xl leading-[3rem]" style={{ ...PX, color: '#F59E0B', textShadow: '0 0 30px #F59E0B88' }}>
          FRAUD QUEST
        </h1>
        <p className="text-[10px] text-slate-400 max-w-lg leading-8" style={PX}>
          La historia de cómo un analista enfrentó 750 monstruos ocultos entre 50,000 transacciones inocentes
        </p>
        <div className="mt-4">
          <Blink color="#22C55E">
            <span className="text-[10px]" style={PX}>▶ CLICK PARA COMENZAR LA AVENTURA</span>
          </Blink>
        </div>
        <div className="flex gap-8 mt-2">
          <div className="text-center">
            <div className="text-2xl">🧙</div>
            <div className="text-[7px] text-slate-500 mt-1" style={PX}>EL HÉROE</div>
          </div>
          <div className="text-[10px] text-slate-600 self-center" style={PX}>VS</div>
          <div className="text-center">
            <div className="text-2xl">👾</div>
            <div className="text-[7px] text-slate-500 mt-1" style={PX}>EL FRAUDE</div>
          </div>
        </div>
      </div>
    </SlideWrap>
  )
}

function Slide1() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const timers = [1000, 1800, 2600, 3400].map((ms, i) =>
      setTimeout(() => setStep(s => Math.max(s, i + 1)), ms)
    )
    return () => timers.forEach(clearTimeout)
  }, [])
  const items = [
    { label: '50,000 transacciones monitoreadas', color: '#3B82F6' },
    { label: 'Q1 2026 — enero a marzo', color: '#3B82F6' },
    { label: '9 señales de datos por transacción', color: '#3B82F6' },
    { label: '⚠ ALERTA: 750 MONSTRUOS DETECTADOS', color: '#EF4444' },
  ]
  return (
    <SlideWrap>
      <SectionTitle icon="🗺️" title="EL REINO DE CONFAMA" color="#3B82F6" />
      <p className="text-[9px] text-slate-400 mb-8 leading-7" style={PX}>
        Un reino financiero tranquilo. Miles de transacciones fluyen cada día.<br />
        Pero algo acecha en las sombras...
      </p>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="transition-all duration-500 flex items-center gap-3"
            style={{ opacity: step > i ? 1 : 0, transform: step > i ? 'translateX(0)' : 'translateX(-20px)' }}
          >
            <span style={{ color: item.color }}>▶</span>
            <span className="text-[10px]" style={{ ...PX, color: item.color }}>{item.label}</span>
          </div>
        ))}
      </div>
      {step >= 4 && (
        <div className="mt-10 border-2 border-red-600 bg-red-950/40 p-5 text-center animate-pulse">
          <div className="text-2xl mb-2">👾</div>
          <p className="text-[10px] text-red-400" style={PX}>
            1.5% del tráfico es fraude.<br />
            <span className="text-[8px] text-red-600">Invisibles. Camuflados. Costosos.</span>
          </p>
        </div>
      )}
    </SlideWrap>
  )
}

function Slide2() {
  return (
    <SlideWrap>
      <SectionTitle icon="🔍" title="EL HÉROE INVESTIGA — ANTES DE PELEAR, EXPLORA" color="#F59E0B" />
      <p className="text-[8px] text-slate-500 mb-6 leading-6" style={PX}>
        Decisión: no atacar a ciegas. Primero entender cómo se comporta el enemigo.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { emoji: '🕐', title: 'Hora de riesgo', desc: 'Los ataques se concentran entre las 23h y las 5h. El titular duerme. No hay alertas.', color: '#EF4444' },
          { emoji: '🌍', title: 'País no coincide', desc: 'Cuando el país de la transacción no coincide con el de la tarjeta, la tasa de fraude se multiplica 8×.', color: '#F59E0B' },
          { emoji: '💳', title: 'Categorías calientes', desc: 'Electrónica y Viajes concentran las tasas más altas. Tickets grandes, difíciles de revertir.', color: '#A78BFA' },
          { emoji: '📱', title: 'Score de dispositivo', desc: 'Score bajo = dispositivo desconocido. Los fraudes tienen score significativamente menor.', color: '#3B82F6' },
        ].map((item, i) => (
          <div key={i} className="border border-slate-700 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{item.emoji}</span>
              <span className="text-[8px]" style={{ ...PX, color: item.color }}>{item.title}</span>
            </div>
            <p className="text-[7px] text-slate-400 leading-6" style={PX}>{item.desc}</p>
          </div>
        ))}
      </div>
      <DecisionBox>
        ⚠️ TRAMPA EVITADA: Un modelo que prediga siempre &quot;legítimo&quot; logra 98.5% de accuracy.<br />
        El héroe rechaza esa falsa victoria. Usaremos F1 y PR-AUC — métricas que sí importan.
      </DecisionBox>
    </SlideWrap>
  )
}

function Slide3() {
  return (
    <SlideWrap>
      <SectionTitle icon="🌲" title="ARMA FORJADA — RANDOM FOREST" color="#22C55E" />
      <div className="grid grid-cols-2 gap-8 items-start">
        <div>
          <p className="text-[8px] text-slate-400 mb-5 leading-7" style={PX}>
            300 árboles de decisión votan juntos.<br />
            Ninguno es perfecto, pero el consenso es poderoso.
          </p>
          <div className="space-y-4">
            <HPBar value={D.rf.f1}        color="#22C55E" label="F1 Score" />
            <HPBar value={D.rf.recall}    color="#3B82F6" label="Recall (fraudes capturados)" />
            <HPBar value={D.rf.precision} color="#F59E0B" label="Precision" />
            <HPBar value={D.rf.auc}       color="#A78BFA" label="AUC-ROC" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-[8px] text-green-400 mb-2" style={PX}>🛡️ DECISIONES TOMADAS</p>
            <ul className="text-[7px] text-slate-400 space-y-2 leading-6" style={PX}>
              <li>▶ Split 80/20 <span className="text-green-500">estratificado</span> — mantiene proporción de fraude en test</li>
              <li>▶ SMOTE <span className="text-green-500">solo en entrenamiento</span> — no contaminar la evaluación</li>
              <li>▶ class_weight=&#39;balanced&#39; — compensación adicional del desbalance</li>
              <li>▶ Umbral óptimo <span className="text-green-500">buscado sobre F1</span>, no fijo en 0.5</li>
            </ul>
          </div>
          <div className="border border-yellow-800 bg-yellow-950/30 p-3">
            <p className="text-[7px] text-yellow-400 leading-6" style={PX}>
              ⚡ SMOTE en test = trampa.<br />
              El héroe solo practica con síntéticos, nunca evalúa con ellos.
            </p>
          </div>
        </div>
      </div>
    </SlideWrap>
  )
}

function Slide4() {
  return (
    <SlideWrap>
      <SectionTitle icon="⚡" title="MEJORA DE ARMA — XGBOOST" color="#A78BFA" />
      <p className="text-[8px] text-slate-500 mb-6 leading-6" style={PX}>
        El héroe aprende de cada error. XGBoost corrige secuencialmente lo que RF dejó pasar.
      </p>
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* RF col */}
        <div className="border border-slate-700 p-4">
          <p className="text-[8px] text-slate-400 mb-4 text-center" style={PX}>🌲 RANDOM FOREST</p>
          <div className="space-y-3">
            <HPBar value={D.rf.f1}     color="#64748B" label="F1 Score" />
            <HPBar value={D.rf.recall} color="#64748B" label="Recall" />
            <HPBar value={D.rf.auc}    color="#64748B" label="AUC-ROC" />
          </div>
        </div>
        {/* XGB col */}
        <div className="border-2 border-purple-500 p-4" style={{ boxShadow: '0 0 20px #7C3AED44' }}>
          <p className="text-[8px] text-purple-400 mb-4 text-center" style={PX}>⚡ XGBOOST ★ UPGRADE</p>
          <div className="space-y-3">
            <HPBar value={D.xgb.f1}     color="#A78BFA" label="F1 Score" />
            <HPBar value={D.xgb.recall} color="#22C55E" label="Recall" />
            <HPBar value={D.xgb.auc}    color="#F59E0B" label="AUC-ROC" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'F1 +1.31%', color: '#22C55E' },
          { label: 'Recall +1.33%', color: '#22C55E' },
          { label: 'AUC perfecto 100%', color: '#F59E0B' },
        ].map((s, i) => (
          <div key={i} className="border border-slate-700 p-3 text-center">
            <span className="text-[9px]" style={{ ...PX, color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-5">
        <DecisionBox>
          🔮 SHAP (SHapley Additive Explanations) — ahora el héroe puede EXPLICAR cada decisión.<br />
          ¿Por qué esta transacción fue marcada? Score de dispositivo bajo + país no coincide + madrugada.
        </DecisionBox>
      </div>
    </SlideWrap>
  )
}

function Slide5() {
  return (
    <SlideWrap bg="#080C14">
      <SectionTitle icon="🌑" title="EL BOSQUE OSCURO — ISOLATION FOREST" color="#EF4444" />
      <div className="grid grid-cols-2 gap-8 items-start">
        <div>
          <div className="border border-red-900 bg-red-950/30 p-5 mb-5">
            <p className="text-[9px] text-red-400 leading-7" style={PX}>
              &quot;Nuevos monstruos aparecen...<br />
              sin nombre. Sin etiqueta.<br />
              Nadie los ha visto antes.&quot;
            </p>
          </div>
          <p className="text-[8px] text-slate-400 leading-7 mb-4" style={PX}>
            En producción real, las nuevas modalidades de fraude no tienen `target=1` hasta que alguien las identifica manualmente.
          </p>
          <p className="text-[8px] text-slate-400 leading-7" style={PX}>
            El héroe necesita detectarlas <span className="text-yellow-400">sin haber visto el mapa</span>.
          </p>
        </div>
        <div className="space-y-4">
          <div className="border border-amber-700 bg-amber-950/30 p-4">
            <p className="text-[8px] text-amber-400 mb-3" style={PX}>🧮 CÁLCULO DE CONTAMINATION</p>
            <p className="text-[7px] text-slate-400 leading-7" style={PX}>
              No se usa `target` para calcular la contaminación.<br />
              Se define comportamiento sospechoso desde reglas de negocio:<br />
              · score_dispositivo &lt; Q1 − 1.5·IQR<br />
              · intentos_fallidos ≥ 3<br />
              → Unión de ambas = {D.anomalias.contamPct}% del dataset
            </p>
          </div>
          <div className="border-2 border-green-600 bg-green-950/40 p-4">
            <p className="text-[8px] text-green-400 mb-2" style={PX}>🏆 RESULTADO SIN ETIQUETAS</p>
            <div className="mt-2">
              <HPBar value={D.anomalias.recallPct} color="#22C55E" label="Fraudes reales capturados" />
            </div>
            <p className="text-[7px] text-slate-400 mt-3" style={PX}>
              {D.anomalias.total} anomalías marcadas.<br />
              95.7% de los fraudes conocidos encontrados.<br />
              Sin ver ni una sola etiqueta.
            </p>
          </div>
        </div>
      </div>
    </SlideWrap>
  )
}

function Slide6() {
  return (
    <SlideWrap>
      <SectionTitle icon="🗺️" title="EL MAPA DEL ENEMIGO — CLUSTERING K=4" color="#3B82F6" />
      <p className="text-[8px] text-slate-500 mb-6 leading-6" style={PX}>
        KMeans con método del codo → K=4 clusters ordenados por tasa de fraude ascendente.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-5">
        {D.clusters.map(c => (
          <div
            key={c.id}
            className="border-2 p-4 relative overflow-hidden"
            style={{ borderColor: c.color, backgroundColor: c.bg }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[8px]" style={{ ...PX, color: c.color }}>C{c.id} — {c.label}</p>
                <p className="text-[7px] text-slate-500 mt-1" style={PX}>{c.sublabel}</p>
              </div>
              <span className="text-2xl">{c.emoji}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[7px] text-slate-500" style={PX}>{c.size} txns</span>
              <span className="text-[10px] font-bold" style={{ ...PX, color: c.color }}>
                {c.tasa}% fraude
              </span>
            </div>
            {c.tasa > 90 && (
              <div className="absolute inset-0 border-2 border-red-500 animate-pulse opacity-40 pointer-events-none" />
            )}
          </div>
        ))}
      </div>
      <DecisionBox>
        ⚙️ Los clusters se reordenan por tasa de fraude en cada ejecución.<br />
        C0 = siempre el más seguro. C3 = siempre el más peligroso. Independiente de la inicialización aleatoria.
      </DecisionBox>
    </SlideWrap>
  )
}

function Slide7() {
  const [shown, setShown] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShown(true), 600); return () => clearTimeout(t) }, [])
  return (
    <SlideWrap bg="#070B10">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4 animate-bounce">🏆</div>
        <h2 className="text-xl mb-3" style={{ ...PX, color: '#F59E0B', textShadow: '0 0 40px #F59E0B' }}>
          JEFE FINAL DERROTADO
        </h2>
        <p className="text-[8px] text-slate-400" style={PX}>El reino está a salvo. El tesoro, protegido.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Sin modelo', sub: '100% de fraude pasa', value: `$${D.sinModelo.toLocaleString()}`, color: '#EF4444', icon: '💸' },
          { label: 'Random Forest', sub: `F1 ${D.rf.f1}%`, value: `$${(D.sinModelo - D.ahorro + 749).toLocaleString()}`, color: '#3B82F6', icon: '🌲' },
          { label: 'XGBoost', sub: `F1 ${D.xgb.f1}%`, value: `$${(D.sinModelo - D.ahorro).toLocaleString()}`, color: '#22C55E', icon: '⚡' },
        ].map((item, i) => (
          <div
            key={i}
            className="border-2 p-5 text-center transition-all duration-700"
            style={{
              borderColor: item.color,
              backgroundColor: item.color + '11',
              transform: shown ? 'translateY(0)' : 'translateY(30px)',
              opacity: shown ? 1 : 0,
              transitionDelay: `${i * 200}ms`,
            }}
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <p className="text-[7px] text-slate-400 mb-1" style={PX}>{item.label}</p>
            <p className="text-[7px] text-slate-600 mb-3" style={PX}>{item.sub}</p>
            <p className="text-[11px]" style={{ ...PX, color: item.color }}>{item.value}</p>
            <p className="text-[6px] text-slate-600 mt-1" style={PX}>costo total</p>
          </div>
        ))}
      </div>
      <div className="border-2 border-yellow-500 bg-yellow-950/40 p-5 text-center" style={{ boxShadow: '0 0 30px #F59E0B44' }}>
        <p className="text-[8px] text-yellow-400 mb-1" style={PX}>💰 AHORRO NETO CON XGBOOST</p>
        <p className="text-2xl" style={{ ...PX, color: '#F59E0B', textShadow: '0 0 20px #F59E0B' }}>
          ${D.ahorro.toLocaleString()}
        </p>
        <p className="text-[7px] text-slate-500 mt-2" style={PX}>por periodo evaluado · escalable a producción</p>
      </div>
    </SlideWrap>
  )
}

function Slide8() {
  return (
    <SlideWrap>
      <SectionTitle icon="📊" title="RESUMEN DEL MAPA" color="#A78BFA" />
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-[8px] text-slate-400 mb-4" style={PX}>🏆 ESTADÍSTICAS FINALES DEL HÉROE</p>
          {[
            { label: 'Random Forest — F1',         value: `${D.rf.f1}%`,           color: '#3B82F6' },
            { label: 'XGBoost — F1',               value: `${D.xgb.f1}%`,          color: '#22C55E' },
            { label: 'XGBoost — Recall',            value: `${D.xgb.recall}%`,      color: '#22C55E' },
            { label: 'Isolation Forest — Recall',  value: `${D.anomalias.recallPct}%`, color: '#F59E0B' },
            { label: 'Ahorro neto',                value: `$${D.ahorro.toLocaleString()}`, color: '#A78BFA' },
          ].map((s, i) => (
            <div key={i} className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-[7px] text-slate-500" style={PX}>{s.label}</span>
              <span className="text-[8px]" style={{ ...PX, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-[8px] text-slate-400 mb-4" style={PX}>⚔️ DECISIONES CLAVE</p>
          {[
            'F1 y PR-AUC, no accuracy',
            'SMOTE solo en train',
            'Umbral óptimo sobre test',
            'Contamination sin tocar target',
            'Clusters ordenados por tasa de fraude',
            'SHAP para explicabilidad auditada',
          ].map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-green-500 text-[10px]">✓</span>
              <span className="text-[7px] text-slate-400" style={PX}>{d}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 border border-slate-700 bg-slate-900/50 p-4">
        <p className="text-[7px] text-slate-500 leading-7" style={PX}>
          🛠️ STACK: Python · pandas · scikit-learn · XGBoost · SHAP · imbalanced-learn · Next.js 16 · Recharts · Tailwind
        </p>
      </div>
    </SlideWrap>
  )
}

function Slide9() {
  return (
    <SlideWrap bg="#070B10">
      <div className="text-center space-y-8">
        <div className="text-5xl">🎮</div>
        <h2 className="text-lg leading-[3rem]" style={{ ...PX, color: '#F59E0B' }}>
          GRACIAS POR JUGAR
        </h2>
        <div className="space-y-2">
          {[
            '— FRAUD QUEST —',
            'Detección de Fraude Financiero',
            'CONFAMA · 2026',
          ].map((line, i) => (
            <p key={i} className="text-[8px] text-slate-500" style={PX}>{line}</p>
          ))}
        </div>
        <div className="border border-slate-800 p-5 max-w-sm mx-auto">
          <p className="text-[7px] text-slate-600 leading-8" style={PX}>
            EDA · Modelos Supervisados<br />
            Detección de Anomalías · Clustering<br />
            4 notebooks · 1 pipeline · 1 dashboard
          </p>
        </div>
        <Blink color="#22C55E">
          <span className="text-[8px]" style={PX}>GAME OVER — THE HERO WON</span>
        </Blink>
      </div>
    </SlideWrap>
  )
}

const SLIDES = [Slide0, Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8, Slide9]

const SLIDE_LABELS = [
  'INTRO',
  'EL REINO',
  'EL ENEMIGO',
  'RANDOM FOREST',
  'XGBOOST',
  'ISOLATION FOREST',
  'CLUSTERING',
  'VICTORIA',
  'RESUMEN',
  'FIN',
]

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function PitchPage() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'fwd' | 'bwd'>('fwd')
  const [visible, setVisible] = useState(true)

  const go = useCallback((next: number) => {
    if (next < 0 || next >= TOTAL) return
    setDirection(next > current ? 'fwd' : 'bwd')
    setVisible(false)
    setTimeout(() => {
      setCurrent(next)
      setVisible(true)
    }, 180)
  }, [current])

  const prev = useCallback(() => go(current - 1), [current, go])
  const next = useCallback(() => go(current + 1), [current, go])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); next() }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const SlideComponent = SLIDES[current]

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col select-none" style={{ backgroundColor: '#080C14' }}>
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-b border-slate-800 flex-shrink-0"
        style={{ backgroundColor: '#0B1018' }}
      >
        <span className="text-[9px] text-yellow-500" style={PX}>FRAUD QUEST</span>
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className="transition-all duration-200"
              title={SLIDE_LABELS[i]}
            >
              <div
                className="w-2 h-2"
                style={{
                  backgroundColor: i === current ? '#F59E0B' : i < current ? '#22C55E55' : '#1E293B',
                  boxShadow: i === current ? '0 0 6px #F59E0B' : 'none',
                }}
              />
            </button>
          ))}
        </div>
        <span className="text-[8px] text-slate-600" style={PX}>
          LEVEL {current + 1}/{TOTAL} — {SLIDE_LABELS[current]}
        </span>
      </div>

      {/* ── Slide area ── */}
      <div className="flex-1 overflow-hidden relative" onClick={next}>
        <div
          className="h-full w-full transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? 'translateX(0)'
              : direction === 'fwd'
              ? 'translateX(-12px)'
              : 'translateX(12px)',
          }}
        >
          <SlideComponent />
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <div
        className="flex items-center justify-between px-6 py-3 border-t border-slate-800 flex-shrink-0"
        style={{ backgroundColor: '#0B1018' }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          disabled={current === 0}
          className="text-[8px] text-slate-500 hover:text-white disabled:opacity-20 transition-colors px-4 py-1 border border-slate-700 hover:border-slate-500 disabled:cursor-not-allowed"
          style={PX}
        >
          ◀ ANTERIOR
        </button>

        <div className="flex items-center gap-3">
          <Tag color="#475569">← → FLECHAS</Tag>
          <Tag color="#475569">SPACE / ENTER</Tag>
          <Tag color="#475569">CLICK</Tag>
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          disabled={current === TOTAL - 1}
          className="text-[8px] text-slate-400 hover:text-white disabled:opacity-20 transition-colors px-4 py-1 border border-slate-700 hover:border-slate-500 disabled:cursor-not-allowed"
          style={PX}
        >
          SIGUIENTE ▶
        </button>
      </div>
    </div>
  )
}
