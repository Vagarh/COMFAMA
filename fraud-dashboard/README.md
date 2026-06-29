# Fraud Detection Dashboard

Dashboard interactivo para visualizar los resultados del pipeline de detección de fraude. Construido con Next.js 15, TypeScript, Tailwind CSS y Recharts.

## Secciones

- **EDA** — distribuciones, tasas de fraude por variable, correlaciones
- **Modelos** — métricas de Random Forest y XGBoost, curvas ROC/PR, importancias SHAP
- **Anomalías** — resultados de Isolation Forest, comparativa con fraudes reales
- **Clustering** — perfiles de riesgo K=4, características por cluster

## Ejecución local

```bash
npm install
npm run dev
```

El dashboard lee los JSONs de `public/data/` en servidor (sin fetch al cliente). Para regenerar esos JSONs ejecuta `python analyze.py` desde la carpeta `python/`.

## Comandos

```bash
npm run dev      # Servidor de desarrollo en localhost:3000
npm run build    # Build de producción
npm run lint     # ESLint
```
