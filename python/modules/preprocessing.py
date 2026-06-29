import pandas as pd
import numpy as np


def load_and_preprocess(csv_path: str) -> tuple[pd.DataFrame, dict]:
    df = pd.read_csv(csv_path)
    df["timestamp"] = pd.to_datetime(df["timestamp"])

    # Features temporales
    df["hora"] = df["timestamp"].dt.hour
    df["dia_semana"] = df["timestamp"].dt.dayofweek
    df["mes"] = df["timestamp"].dt.month
    df["es_fin_semana"] = (df["dia_semana"] >= 5).astype(int)
    df["es_hora_riesgo"] = ((df["hora"] >= 23) | (df["hora"] <= 5)).astype(int)

    # Feature de monto
    df["monto_log"] = np.log1p(df["monto"])

    # Imputación estratificada de score_dispositivo
    impute_report = _impute_score_dispositivo(df)

    return df, impute_report


def _impute_score_dispositivo(df: pd.DataFrame) -> dict:
    nulos_antes = df["score_dispositivo"].isna().sum()
    medianas_por_grupo = {}

    grupo_medianas = df.groupby(["pais_coincide", "categoria_comercio"])["score_dispositivo"].median()
    for (pais, cat), mediana in grupo_medianas.items():
        key = f"{int(pais)}_{cat}"
        medianas_por_grupo[key] = round(float(mediana), 2) if not np.isnan(mediana) else None
        mask = df["pais_coincide"].eq(pais) & df["categoria_comercio"].eq(cat) & df["score_dispositivo"].isna()
        df.loc[mask, "score_dispositivo"] = mediana

    # Fallback: mediana global para grupos sin datos suficientes
    if df["score_dispositivo"].isna().any():
        mediana_global = df["score_dispositivo"].median()
        df["score_dispositivo"] = df["score_dispositivo"].fillna(mediana_global)

    return {
        "metodo": "mediana_estratificada",
        "grupos_usados": ["pais_coincide", "categoria_comercio"],
        "nulos_imputados": int(nulos_antes),
        "medianas_por_grupo": medianas_por_grupo,
    }


def get_feature_matrix(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    features = [
        "monto_log", "score_dispositivo", "intentos_fallidos_24h",
        "pais_coincide", "hora", "dia_semana", "es_fin_semana",
        "es_hora_riesgo", "mes",
    ]

    cat_dummies = pd.get_dummies(
        df[["categoria_comercio", "tipo_tarjeta"]],
        prefix=["cat", "tarj"],
        drop_first=False,
    )

    X = pd.concat([df[features], cat_dummies], axis=1)
    y = df["target"]
    return X, y
