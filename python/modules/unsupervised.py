import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


def detect_anomalies(df: pd.DataFrame) -> dict:
    features = [
        "monto_log", "score_dispositivo", "intentos_fallidos_24h",
        "hora", "pais_coincide", "es_hora_riesgo",
    ]

    X = df[features].copy()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Contamination calculado sin usar target
    q1 = df["score_dispositivo"].quantile(0.25)
    q3 = df["score_dispositivo"].quantile(0.75)
    iqr = q3 - q1
    mask_outlier_score = df["score_dispositivo"] < (q1 - 1.5 * iqr)
    mask_intentos = df["intentos_fallidos_24h"] >= 3
    n_sospechosos = (mask_outlier_score | mask_intentos).sum()
    contamination = round(float(n_sospechosos / len(df)), 4)
    contamination = max(0.005, min(contamination, 0.1))  # clamp razonable

    iso = IsolationForest(n_estimators=200, contamination=contamination, random_state=42, n_jobs=-1)
    iso.fit(X_scaled)

    scores = iso.decision_function(X_scaled)  # mayor = más normal
    preds = iso.predict(X_scaled)  # -1 = anomalía

    df_res = df.copy()
    df_res["anomaly_score"] = scores
    df_res["es_anomalia"] = (preds == -1).astype(int)

    n_anomalias = int(df_res["es_anomalia"].sum())

    # Distribución de scores
    hist_counts, hist_bins = np.histogram(scores, bins=20)
    threshold_score = float(np.percentile(scores[preds == -1], 100))  # max score de anomalías

    # Top 20 anomalías
    top_anomalias = (
        df_res[df_res["es_anomalia"] == 1]
        .nsmallest(20, "anomaly_score")
        [[
            "id_transaccion", "anomaly_score", "monto", "categoria_comercio",
            "hora", "pais_coincide", "score_dispositivo", "intentos_fallidos_24h",
        ]]
    )
    top_lista = []
    for _, row in top_anomalias.iterrows():
        top_lista.append({
            "id_transaccion": str(row["id_transaccion"]),
            "anomaly_score": round(float(row["anomaly_score"]), 4),
            "monto": round(float(row["monto"]), 2),
            "categoria_comercio": str(row["categoria_comercio"]),
            "hora": int(row["hora"]),
            "pais_coincide": int(row["pais_coincide"]),
            "score_dispositivo": round(float(row["score_dispositivo"]), 1),
            "intentos_fallidos_24h": int(row["intentos_fallidos_24h"]),
        })

    # Validación interna vs target (solo para el reto)
    tp_anom = int(((df_res["es_anomalia"] == 1) & (df_res["target"] == 1)).sum())
    fp_anom = int(((df_res["es_anomalia"] == 1) & (df_res["target"] == 0)).sum())
    fn_anom = int(((df_res["es_anomalia"] == 0) & (df_res["target"] == 1)).sum())
    prec_anom = round(tp_anom / (tp_anom + fp_anom), 3) if (tp_anom + fp_anom) > 0 else 0
    rec_anom = round(tp_anom / (tp_anom + fn_anom), 3) if (tp_anom + fn_anom) > 0 else 0

    # Patrones de anomalías
    anomalias_df = df_res[df_res["es_anomalia"] == 1]
    cats_alto_riesgo = ["Electronica", "Electrónica", "Viajes"]
    pct_alto_riesgo = round(
        anomalias_df["categoria_comercio"].isin(cats_alto_riesgo).mean() * 100, 1
    )

    return {
        "configuracion": {
            "modelo": "IsolationForest",
            "contamination": contamination,
            "justificacion_matematica": (
                f"Fracción de registros con score_dispositivo < Q1-1.5*IQR ({round(q1 - 1.5 * iqr, 2)}) "
                f"O intentos_fallidos >= 3, calculado sin usar target: {n_sospechosos}/{len(df)} = {contamination}"
            ),
            "n_estimators": 200,
            "features_usadas": features,
        },
        "resultados": {
            "total_anomalias_detectadas": n_anomalias,
            "distribucion_scores": {
                "bins_left": [round(float(b), 4) for b in hist_bins[:-1]],
                "conteos": [int(c) for c in hist_counts],
                "threshold_anomalia": round(threshold_score, 4),
            },
            "top_anomalias": top_lista,
            "validacion_vs_target": {
                "nota": "Solo para evaluación interna del reto. No disponible en producción real.",
                "precision_anomalia_vs_fraude": prec_anom,
                "recall_anomalia_vs_fraude": rec_anom,
            },
            "patrones_anomalias": {
                "hora_promedio": round(float(anomalias_df["hora"].mean()), 1),
                "monto_promedio": round(float(anomalias_df["monto"].mean()), 2),
                "pct_pais_no_coincide": round(float((anomalias_df["pais_coincide"] == 0).mean() * 100), 1),
                "pct_categorias_alto_riesgo": pct_alto_riesgo,
            },
        },
    }
