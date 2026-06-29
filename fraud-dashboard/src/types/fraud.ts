// EDA Types
export interface EDAData {
  resumen_dataset: {
    total_transacciones: number;
    total_fraudes: number;
    tasa_fraude_pct: number;
    nulos_score_dispositivo: number;
    rango_fechas: { inicio: string; fin: string };
  };
  distribucion_monto: {
    bins_labels: string[];
    conteos_total: number[];
    conteos_fraude: number[];
  };
  fraude_por_hora: Array<{ hora: number; total: number; fraudes: number; tasa: number }>;
  fraude_por_categoria: Array<{ categoria: string; total: number; fraudes: number; tasa: number }>;
  fraude_por_tipo_tarjeta: Array<{ tipo: string; total: number; fraudes: number; tasa: number }>;
  fraude_por_pais_coincide: Array<{ coincide: boolean; total: number; fraudes: number; tasa: number }>;
  correlacion_features: { nombres: string[]; matriz: number[][] };
  score_dispositivo_stats: { min: number; max: number; media: number; mediana: number };
  intentos_fallidos_distribucion: Array<{ intentos: number; conteo: number }>;
  imputacion_report: {
    metodo: string;
    grupos_usados: string[];
    nulos_imputados: number;
    medianas_por_grupo: Record<string, number | null>;
  };
}

// Models Types
export interface ModelMetrics {
  precision: number;
  recall: number;
  f1: number;
  auc_roc: number;
  pr_auc: number;
  threshold_optimo: number;
}

export interface ConfusionMatrixData {
  TP: number;
  FP: number;
  FN: number;
  TN: number;
}

export interface ModelResult {
  params: Record<string, string | number>;
  metricas: ModelMetrics;
  confusion_matrix: ConfusionMatrixData;
  curva_roc: { fpr: number[]; tpr: number[] };
  curva_pr: { precision: number[]; recall: number[] };
  feature_importance: Array<{ feature: string; importance: number }>;
}

export interface ShapContrib {
  feature: string;
  valor_feature: number;
  shap: number;
}

export interface ModelsData {
  split_info: {
    train_size: number;
    test_size: number;
    fraudes_test: number;
    smote_sinteticos_generados: number;
  };
  random_forest: ModelResult;
  xgboost: ModelResult;
  shap: {
    modelo_seleccionado: string;
    valores_medios_abs: Array<{ feature: string; shap_mean_abs: number }>;
    waterfall_fraude: { valor_base: number; contribuciones: ShapContrib[] };
    waterfall_legitimo: { valor_base: number; contribuciones: ShapContrib[] };
  };
  analisis_negocio: {
    monto_promedio_fraude: number;
    costo_fn_unitario: number;
    costo_fp_unitario: number;
    comparativa: {
      sin_modelo: { fraudes_perdidos: number; costo_total_fraude: number };
      random_forest: { fn: number; fp: number; costo_fraudes_perdidos: number; costo_revisiones_falsas: number; costo_total: number; ahorro_vs_sin_modelo: number };
      xgboost: { fn: number; fp: number; costo_fraudes_perdidos: number; costo_revisiones_falsas: number; costo_total: number; ahorro_vs_sin_modelo: number };
    };
  };
}

// Anomalias Types
export interface AnomaliaItem {
  id_transaccion: string;
  anomaly_score: number;
  monto: number;
  categoria_comercio: string;
  hora: number;
  pais_coincide: number;
  score_dispositivo: number;
  intentos_fallidos_24h: number;
}

export interface AnomaliesData {
  configuracion: {
    modelo: string;
    contamination: number;
    justificacion_matematica: string;
    n_estimators: number;
    features_usadas: string[];
  };
  resultados: {
    total_anomalias_detectadas: number;
    distribucion_scores: {
      bins_left: number[];
      conteos: number[];
      threshold_anomalia: number;
    };
    top_anomalias: AnomaliaItem[];
    validacion_vs_target: {
      nota: string;
      precision_anomalia_vs_fraude: number;
      recall_anomalia_vs_fraude: number;
    };
    patrones_anomalias: {
      hora_promedio: number;
      monto_promedio: number;
      pct_pais_no_coincide: number;
      pct_categorias_alto_riesgo: number;
    };
  };
}

// Clustering Types
export interface ClusterInfo {
  id: number;
  nombre: string;
  descripcion: string;
  recomendacion: string;
  color: string;
  size: number;
  tasa_fraude: number;
  centroide: {
    monto_promedio: number;
    score_dispositivo_promedio: number;
    intentos_fallidos_promedio: number;
    hora_promedio: number;
    pct_pais_no_coincide: number;
    pct_hora_riesgo: number;
  };
}

export interface ClusteringData {
  configuracion: {
    modelo: string;
    k_elegido: number;
    metodo_seleccion: string;
    features_usadas: string[];
    scaler: string;
  };
  elbow_data: Array<{ k: number; inercia: number }>;
  clusters: ClusterInfo[];
  scatter_pca: Array<{ pca1: number; pca2: number; cluster: number; es_fraude: number }>;
  pca_varianza_explicada: number[];
}
