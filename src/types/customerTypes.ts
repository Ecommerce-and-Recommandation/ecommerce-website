export interface CustomerFeatures {
    recency: number;
    frequency: number;
    monetary: number;
    avg_order_value: number;
    avg_items_per_order: number;
    total_unique_products: number;
    avg_days_between_orders: number;
    cancellation_rate: number;
    days_since_first_purchase: number;
    is_weekend_shopper: number;
    favorite_hour: number;
    country: string;
}

export interface PredictionResponse {
    will_purchase: boolean;
    probability: number;
    segment_id: number;
    segment_name: string;
    show_promotion: boolean;
    promotion_message: string | null;
}

export interface SegmentInfo {
    segment_id: number;
    segment_name: string;
    rfm_scores: Record<string, number>;
}

export interface ClusterOverview {
    segment_id: number;
    segment_name: string;
    count: number;
    percentage: number;
}

export interface SegmentOverviewResponse {
    total_customers: number;
    n_clusters: number;
    silhouette_score: number;
    clusters: ClusterOverview[];
}
