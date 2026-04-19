import type { PredictionResponse } from './customerTypes';

export interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
}

export interface ModelInfoResponse {
    model_type: string;
    version: string;
    n_features: number;
    metrics: ModelMetrics;
    cv_f1_mean: number;
    cv_f1_std: number;
    segmentation: { n_clusters: number; silhouette_score: number };
    knn: { total_products: number; hit_rate: number };
}

export interface HealthResponse {
    status: string;
    models_loaded: boolean;
    models: string[];
}

export interface BehaviorProfileResponse {
    rfm_features: Record<string, number | string>;
    prediction: PredictionResponse;
}
