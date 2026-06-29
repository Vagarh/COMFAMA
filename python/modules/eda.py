import pandas as pd
import numpy as np


def generate_eda(df: pd.DataFrame, impute_report: dict) -> dict:
    total = len(df)
    total_fraudes = int(df["target"].sum())

    # Distribución de monto
    bins = [0, 50, 100, 250, 500, 1000, 5000]
    labels = ["0-50", "50-100", "100-250", "250-500", "500-1000", "1000+"]
    df["monto_bin"] = pd.cut(df["monto"], bins=bins, labels=labels, right=True)
    dist_monto_total = df.groupby("monto_bin", observed=True).size().tolist()
    dist_monto_fraude = df[df["target"] == 1].groupby("monto_bin", observed=True).size().tolist()

    # Fraude por hora
    fraude_hora = []
    for h in range(24):
        sub = df[df["hora"] == h]
        fraudes_h = int(sub["target"].sum())
        total_h = len(sub)
        fraude_hora.append({
            "hora": h,
            "total": total_h,
            "fraudes": fraudes_h,
            "tasa": round(fraudes_h / total_h * 100, 2) if total_h > 0 else 0,
        })

    # Fraude por categoría
    fraude_categoria = []
    for cat, grp in df.groupby("categoria_comercio"):
        fraudes_c = int(grp["target"].sum())
        total_c = len(grp)
        fraude_categoria.append({
            "categoria": cat,
            "total": total_c,
            "fraudes": fraudes_c,
            "tasa": round(fraudes_c / total_c * 100, 2),
        })
    fraude_categoria.sort(key=lambda x: x["tasa"], reverse=True)

    # Fraude por tipo de tarjeta
    fraude_tarjeta = []
    for tipo, grp in df.groupby("tipo_tarjeta"):
        fraudes_t = int(grp["target"].sum())
        total_t = len(grp)
        fraude_tarjeta.append({
            "tipo": tipo,
            "total": total_t,
            "fraudes": fraudes_t,
            "tasa": round(fraudes_t / total_t * 100, 2),
        })

    # Fraude por pais_coincide
    fraude_pais = []
    for val, grp in df.groupby("pais_coincide"):
        fraudes_p = int(grp["target"].sum())
        total_p = len(grp)
        fraude_pais.append({
            "coincide": bool(val),
            "total": total_p,
            "fraudes": fraudes_p,
            "tasa": round(fraudes_p / total_p * 100, 2),
        })

    # Correlación entre features numéricas y target
    num_cols = ["hora", "monto_log", "score_dispositivo", "intentos_fallidos_24h", "pais_coincide", "es_hora_riesgo", "target"]
    corr_matrix = df[num_cols].corr().round(3)
    corr_data = {
        "nombres": num_cols,
        "matriz": corr_matrix.values.tolist(),
    }

    # Estadísticas de score_dispositivo
    score_stats = {
        "min": round(float(df["score_dispositivo"].min()), 2),
        "max": round(float(df["score_dispositivo"].max()), 2),
        "media": round(float(df["score_dispositivo"].mean()), 2),
        "mediana": round(float(df["score_dispositivo"].median()), 2),
    }

    # Intentos fallidos distribución
    intentos_dist = df["intentos_fallidos_24h"].value_counts().sort_index()
    intentos_data = [{"intentos": int(k), "conteo": int(v)} for k, v in intentos_dist.items()]

    ts_min = df["timestamp"].min().strftime("%Y-%m-%d")
    ts_max = df["timestamp"].max().strftime("%Y-%m-%d")

    return {
        "resumen_dataset": {
            "total_transacciones": total,
            "total_fraudes": total_fraudes,
            "tasa_fraude_pct": round(total_fraudes / total * 100, 2),
            "nulos_score_dispositivo": impute_report["nulos_imputados"],
            "rango_fechas": {"inicio": ts_min, "fin": ts_max},
        },
        "distribucion_monto": {
            "bins_labels": labels,
            "conteos_total": dist_monto_total,
            "conteos_fraude": dist_monto_fraude,
        },
        "fraude_por_hora": fraude_hora,
        "fraude_por_categoria": fraude_categoria,
        "fraude_por_tipo_tarjeta": fraude_tarjeta,
        "fraude_por_pais_coincide": fraude_pais,
        "correlacion_features": corr_data,
        "score_dispositivo_stats": score_stats,
        "intentos_fallidos_distribucion": intentos_data,
        "imputacion_report": impute_report,
    }
