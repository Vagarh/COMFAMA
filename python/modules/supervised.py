import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score,
    roc_curve, precision_recall_curve, confusion_matrix,
)
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier
import shap


def train_models(X: pd.DataFrame, y: pd.Series) -> dict:
    # Split estratificado
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    # SMOTE solo en train
    smote = SMOTE(random_state=42, k_neighbors=5)
    X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
    n_sinteticos = int(y_train_sm.sum()) - int(y_train.sum())

    # RandomForest
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=10, class_weight="balanced",
        random_state=42, n_jobs=-1
    )
    rf.fit(X_train_sm, y_train_sm)
    rf_probs = rf.predict_proba(X_test)[:, 1]
    rf_metrics = _evaluate(rf_probs, y_test, X.columns.tolist(), rf.feature_importances_)
    rf_metrics["params"] = {
        "n_estimators": 300, "max_depth": 10, "class_weight": "balanced"
    }

    # XGBoost
    scale_pos = int((y == 0).sum()) / int((y == 1).sum())
    xgb = XGBClassifier(
        n_estimators=300, max_depth=6, learning_rate=0.1,
        scale_pos_weight=scale_pos, random_state=42,
        eval_metric="logloss", verbosity=0,
    )
    xgb.fit(X_train_sm, y_train_sm)
    xgb_probs = xgb.predict_proba(X_test)[:, 1]
    xgb_metrics = _evaluate(xgb_probs, y_test, X.columns.tolist(), xgb.feature_importances_)
    xgb_metrics["params"] = {
        "n_estimators": 300, "max_depth": 6, "scale_pos_weight": round(scale_pos, 2),
        "learning_rate": 0.1,
    }

    # SHAP sobre XGBoost (muestra de 2000 del test)
    sample_idx = np.random.RandomState(42).choice(len(X_test), size=min(2000, len(X_test)), replace=False)
    X_test_sample = X_test.iloc[sample_idx]
    y_test_sample = y_test.iloc[sample_idx]

    explainer = shap.TreeExplainer(xgb)
    shap_values_raw = explainer.shap_values(X_test_sample)
    # En versiones nuevas de SHAP puede devolver array 3D para clasificación binaria
    if hasattr(shap_values_raw, 'ndim') and shap_values_raw.ndim == 3:
        shap_values = shap_values_raw[:, :, 1]
    elif isinstance(shap_values_raw, list):
        shap_values = shap_values_raw[1]
    else:
        shap_values = shap_values_raw

    shap_mean_abs = np.abs(shap_values).mean(axis=0)
    feature_names = X.columns.tolist()
    shap_sorted = sorted(
        zip(feature_names, shap_mean_abs.tolist()),
        key=lambda x: x[1], reverse=True
    )

    # Ejemplo waterfall fraude
    fraude_idx = np.where(y_test_sample.values == 1)[0]
    no_fraude_idx = np.where(y_test_sample.values == 0)[0]

    waterfall_fraude = _waterfall(shap_values, X_test_sample, feature_names, fraude_idx[0], explainer.expected_value)
    waterfall_legitimo = _waterfall(shap_values, X_test_sample, feature_names, no_fraude_idx[0], explainer.expected_value)

    # Análisis de negocio (monto_log es log1p(monto), revertir para monto real)
    montos_fraude_test = np.expm1(X_test.iloc[np.where(y_test.values == 1)[0]]["monto_log"])
    monto_promedio_fraude = float(montos_fraude_test.mean())
    costo_fp = 5.0

    negocio = _negocio_analysis(rf_metrics, xgb_metrics, monto_promedio_fraude, costo_fp)

    return {
        "split_info": {
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
            "fraudes_test": int(y_test.sum()),
            "smote_sinteticos_generados": n_sinteticos,
        },
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "shap": {
            "modelo_seleccionado": "xgboost",
            "valores_medios_abs": [
                {"feature": f, "shap_mean_abs": round(v, 4)}
                for f, v in shap_sorted[:15]
            ],
            "waterfall_fraude": waterfall_fraude,
            "waterfall_legitimo": waterfall_legitimo,
        },
        "analisis_negocio": negocio,
    }


def _find_optimal_threshold(probs, y_true):
    thresholds = np.linspace(0.01, 0.99, 200)
    best_f1, best_t = 0, 0.5
    for t in thresholds:
        preds = (probs >= t).astype(int)
        f1 = f1_score(y_true, preds, zero_division=0)
        if f1 > best_f1:
            best_f1 = f1
            best_t = t
    return best_t


def _evaluate(probs, y_test, feature_names, importances) -> dict:
    threshold = _find_optimal_threshold(probs, y_test)
    preds = (probs >= threshold).astype(int)

    tn, fp, fn, tp = confusion_matrix(y_test, preds).ravel()

    fpr_arr, tpr_arr, _ = roc_curve(y_test, probs)
    prec_arr, rec_arr, _ = precision_recall_curve(y_test, probs)

    # Downsample curvas a 100 puntos
    idx_roc = np.linspace(0, len(fpr_arr) - 1, 100, dtype=int)
    idx_pr = np.linspace(0, len(prec_arr) - 1, 100, dtype=int)

    feat_imp = sorted(
        zip(feature_names, importances.tolist()),
        key=lambda x: x[1], reverse=True
    )

    return {
        "metricas": {
            "precision": round(precision_score(y_test, preds, zero_division=0), 4),
            "recall": round(recall_score(y_test, preds, zero_division=0), 4),
            "f1": round(f1_score(y_test, preds, zero_division=0), 4),
            "auc_roc": round(roc_auc_score(y_test, probs), 4),
            "pr_auc": round(average_precision_score(y_test, probs), 4),
            "threshold_optimo": round(float(threshold), 4),
        },
        "confusion_matrix": {
            "TP": int(tp), "FP": int(fp), "FN": int(fn), "TN": int(tn)
        },
        "curva_roc": {
            "fpr": [round(float(x), 4) for x in fpr_arr[idx_roc]],
            "tpr": [round(float(x), 4) for x in tpr_arr[idx_roc]],
        },
        "curva_pr": {
            "precision": [round(float(x), 4) for x in prec_arr[idx_pr]],
            "recall": [round(float(x), 4) for x in rec_arr[idx_pr]],
        },
        "feature_importance": [
            {"feature": f, "importance": round(v, 4)}
            for f, v in feat_imp[:15]
        ],
    }


def _waterfall(shap_values, X_sample, feature_names, idx, expected_value):
    contribs = shap_values[idx]
    row = X_sample.iloc[idx]
    sorted_contribs = sorted(
        zip(feature_names, contribs.tolist(), row.tolist()),
        key=lambda x: abs(x[1]), reverse=True
    )
    return {
        "valor_base": round(float(expected_value), 4),
        "contribuciones": [
            {"feature": f, "valor_feature": round(float(v), 4), "shap": round(float(s), 4)}
            for f, s, v in sorted_contribs[:10]
        ],
    }


def _negocio_analysis(rf: dict, xgb: dict, monto_prom_fraude: float, costo_fp: float) -> dict:
    test_fraudes = rf["confusion_matrix"]["TP"] + rf["confusion_matrix"]["FN"]

    def costos(cm):
        fn = cm["FN"]
        fp = cm["FP"]
        return {
            "fn": fn,
            "fp": fp,
            "costo_fraudes_perdidos": round(fn * monto_prom_fraude, 2),
            "costo_revisiones_falsas": round(fp * costo_fp, 2),
            "costo_total": round(fn * monto_prom_fraude + fp * costo_fp, 2),
            "ahorro_vs_sin_modelo": round(test_fraudes * monto_prom_fraude - (fn * monto_prom_fraude + fp * costo_fp), 2),
        }

    return {
        "monto_promedio_fraude": round(monto_prom_fraude, 2),
        "costo_fn_unitario": round(monto_prom_fraude, 2),
        "costo_fp_unitario": costo_fp,
        "comparativa": {
            "sin_modelo": {
                "fraudes_perdidos": test_fraudes,
                "costo_total_fraude": round(test_fraudes * monto_prom_fraude, 2),
            },
            "random_forest": costos(rf["confusion_matrix"]),
            "xgboost": costos(xgb["confusion_matrix"]),
        },
    }
