import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA


CLUSTER_INTERPRETATIONS = {
    0: {
        "nombre": "Bajo Riesgo — Transacciones Típicas",
        "descripcion": "Transacciones de monto bajo en horario laboral con dispositivo confiable y país coincidente. Perfil de compra cotidiana.",
        "recomendacion": "Monitoreo estándar. Revisión solo si supera umbral de monto.",
        "color": "#22C55E",
    },
    1: {
        "nombre": "Riesgo Alto — Electrónica Nocturna Internacional",
        "descripcion": "Transacciones de alto monto en madrugada con score de dispositivo bajo y país no coincidente. Alta concentración de fraude en Electrónica y Viajes.",
        "recomendacion": "Bloqueo preventivo y autenticación adicional obligatoria.",
        "color": "#EF4444",
    },
    2: {
        "nombre": "Riesgo Moderado — Viajes y Servicios",
        "descripcion": "Transacciones de monto medio en categorías de viajes y servicios con intentos ocasionales de reintento.",
        "recomendacion": "Revisión manual para montos superiores a 500 USD y segunda validación de identidad.",
        "color": "#F59E0B",
    },
    3: {
        "nombre": "Reintentadores Sospechosos — Credential Stuffing",
        "descripcion": "Patrón de múltiples intentos fallidos en 24h independiente del horario. Posible ataque de fuerza bruta o credential stuffing.",
        "recomendacion": "Activar challenge de autenticación tras 2 intentos fallidos. Bloqueo temporal tras 3+.",
        "color": "#F97316",
    },
}


def cluster_transactions(df: pd.DataFrame) -> dict:
    features = [
        "monto_log", "score_dispositivo", "intentos_fallidos_24h",
        "hora", "pais_coincide", "es_hora_riesgo",
    ]

    X = df[features].copy()
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Método del codo K=2..8
    elbow_data = []
    for k in range(2, 9):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X_scaled)
        elbow_data.append({"k": k, "inercia": round(float(km.inertia_), 2)})

    # Modelo final K=4
    K = 4
    km_final = KMeans(n_clusters=K, random_state=42, n_init=10)
    km_final.fit(X_scaled)
    labels = km_final.labels_

    df_clust = df.copy()
    df_clust["cluster"] = labels

    # Reordenar clusters por tasa de fraude ascendente para asignar interpretaciones consistentes
    cluster_fraude_rate = df_clust.groupby("cluster")["target"].mean()
    rank_order = cluster_fraude_rate.sort_values().index.tolist()
    label_map = {old: new for new, old in enumerate(rank_order)}
    df_clust["cluster"] = df_clust["cluster"].map(label_map)

    # Centroides en espacio original
    centroides_scaled = km_final.cluster_centers_
    # Reordenar centroides también
    centroides_reord = centroides_scaled[rank_order]
    centroides_orig = scaler.inverse_transform(centroides_reord)

    clusters_info = []
    for c in range(K):
        sub = df_clust[df_clust["cluster"] == c]
        tasa = float(sub["target"].mean() * 100)
        interp = CLUSTER_INTERPRETATIONS.get(c, {})
        cent = centroides_orig[c]

        clusters_info.append({
            "id": c,
            "nombre": interp.get("nombre", f"Cluster {c}"),
            "descripcion": interp.get("descripcion", ""),
            "recomendacion": interp.get("recomendacion", ""),
            "color": interp.get("color", "#6B7280"),
            "size": int(len(sub)),
            "tasa_fraude": round(tasa, 2),
            "centroide": {
                "monto_promedio": round(float(np.expm1(cent[0])), 2),
                "score_dispositivo_promedio": round(float(cent[1]), 1),
                "intentos_fallidos_promedio": round(float(cent[2]), 2),
                "hora_promedio": round(float(cent[3]), 1),
                "pct_pais_no_coincide": round(float((sub["pais_coincide"] == 0).mean() * 100), 1),
                "pct_hora_riesgo": round(float(sub["es_hora_riesgo"].mean() * 100), 1),
            },
        })

    # PCA 2D para scatter (muestra de 3000 puntos)
    pca = PCA(n_components=2, random_state=42)
    X_pca = pca.fit_transform(X_scaled)
    sample_size = min(3000, len(df_clust))
    sample_idx = np.random.RandomState(42).choice(len(df_clust), size=sample_size, replace=False)

    scatter_data = []
    for i in sample_idx:
        scatter_data.append({
            "pca1": round(float(X_pca[i, 0]), 3),
            "pca2": round(float(X_pca[i, 1]), 3),
            "cluster": int(df_clust["cluster"].iloc[i]),
            "es_fraude": int(df["target"].iloc[i]),
        })

    varianza_explicada = [round(float(v * 100), 1) for v in pca.explained_variance_ratio_]

    return {
        "configuracion": {
            "modelo": "KMeans",
            "k_elegido": K,
            "metodo_seleccion": "elbow_method",
            "features_usadas": features,
            "scaler": "StandardScaler",
        },
        "elbow_data": elbow_data,
        "clusters": clusters_info,
        "scatter_pca": scatter_data,
        "pca_varianza_explicada": varianza_explicada,
    }
