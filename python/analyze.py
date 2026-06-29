import sys
import json
import shutil
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))

from modules.preprocessing import load_and_preprocess, get_feature_matrix
from modules.eda import generate_eda
from modules.supervised import train_models
from modules.unsupervised import detect_anomalies
from modules.clustering import cluster_transactions

CSV_PATH = Path(__file__).parent.parent / "Ejercicio Fraude.csv"
OUTPUT_DIR = Path(__file__).parent / "outputs"
DASHBOARD_DATA_DIR = Path(__file__).parent.parent / "fraud-dashboard" / "public" / "data"

OUTPUT_DIR.mkdir(exist_ok=True)


class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer,)):
            return int(obj)
        if isinstance(obj, (np.floating,)):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, bool):
            return bool(obj)
        return super().default(obj)


def save_json(data: dict, filename: str):
    path = OUTPUT_DIR / filename
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, cls=NpEncoder)
    print(f"  ✓ {filename} guardado ({path.stat().st_size / 1024:.1f} KB)")
    return path


def copy_to_dashboard(filename: str):
    if DASHBOARD_DATA_DIR.exists():
        shutil.copy(OUTPUT_DIR / filename, DASHBOARD_DATA_DIR / filename)
        print(f"  ✓ {filename} copiado a dashboard/public/data/")
    else:
        print(f"  ⚠ Dashboard no encontrado, omitiendo copia de {filename}")


def main():
    print("\n🔍 ANÁLISIS DE FRAUDE FINANCIERO")
    print("=" * 50)

    print("\n[1/5] Cargando y preprocesando datos...")
    df, impute_report = load_and_preprocess(str(CSV_PATH))
    print(f"  ✓ {len(df):,} transacciones cargadas")
    print(f"  ✓ {impute_report['nulos_imputados']} nulos imputados en score_dispositivo")

    print("\n[2/5] Generando EDA...")
    eda_data = generate_eda(df, impute_report)
    save_json(eda_data, "eda.json")

    print("\n[3/5] Entrenando modelos supervisados (RF + XGBoost + SHAP)...")
    print("  ⏳ Esto puede tomar 3-5 minutos...")
    X, y = get_feature_matrix(df)
    models_data = train_models(X, y)
    save_json(models_data, "models.json")
    rf_f1 = models_data["random_forest"]["metricas"]["f1"]
    xgb_f1 = models_data["xgboost"]["metricas"]["f1"]
    print(f"  ✓ RandomForest F1: {rf_f1} | XGBoost F1: {xgb_f1}")

    print("\n[4/5] Detección de anomalías (Isolation Forest)...")
    anomalias_data = detect_anomalies(df)
    save_json(anomalias_data, "anomalias.json")
    n_anom = anomalias_data["resultados"]["total_anomalias_detectadas"]
    print(f"  ✓ {n_anom} anomalías detectadas")

    print("\n[5/5] Clustering de riesgo (KMeans K=4)...")
    clustering_data = cluster_transactions(df)
    save_json(clustering_data, "clustering.json")
    for c in clustering_data["clusters"]:
        print(f"  ✓ Cluster {c['id']}: {c['nombre']} | Fraude: {c['tasa_fraude']}%")

    print("\n📦 Copiando JSONs al dashboard...")
    for f in ["eda.json", "models.json", "anomalias.json", "clustering.json"]:
        copy_to_dashboard(f)

    print("\n✅ ANÁLISIS COMPLETO")
    print("=" * 50)
    print(f"Archivos generados en: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
