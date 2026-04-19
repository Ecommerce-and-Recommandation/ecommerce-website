import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
});

// ── Types ──────────────────────────────────────────────

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

export interface RecommendationItem {
    rank: number;
    stock_code: string;
    description: string;
    price: number;
    similarity: number;
}

export interface RecommendationResponse {
    source_product: string;
    recommendations: RecommendationItem[];
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

export interface SegmentInfo {
    segment_id: number;
    segment_name: string;
    rfm_scores: Record<string, number>;
}

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

// ── Shop Types ─────────────────────────────────────────

export interface ShopProduct {
    id: number;
    stock_code: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    in_stock: boolean;
    purchase_count: number;
}

export interface ProductListResponse {
    products: ShopProduct[];
    total: number;
    page: number;
    page_size: number;
}

export interface CategoryInfo {
    name: string;
    count: number;
}

export interface CartItemData {
    id: number;
    product_id: number;
    quantity: number;
    product_name: string;
    product_price: number;
    product_image: string;
    stock_code: string;
    added_at: string;
}

export interface CartResponse {
    items: CartItemData[];
    total: number;
    item_count: number;
}

export interface ShopRecommendation {
    id: number;
    stock_code: string;
    name: string;
    price: number;
    image_url: string;
    category: string;
    similarity: number;
    source?: string;
}

export interface RecommendationSource {
    stock_code: string;
    weight: number;
    from: string;
}

export interface BehaviorRecommendationsResponse {
    source: 'multi_knn' | 'popular';
    source_products: RecommendationSource[];
    recommendations: ShopRecommendation[];
}

export interface BehaviorProfileResponse {
    rfm_features: Record<string, number | string>;
    prediction: PredictionResponse;
}

// ── Admin ML API ───────────────────────────────────────

export const mlApi = {
    health: () => api.get<HealthResponse>('/health').then((r) => r.data),

    predictPurchase: (features: CustomerFeatures) => api.post<PredictionResponse>('/predict/purchase', features).then((r) => r.data),

    recommend: (stockCode: string, topK = 10) =>
        api
            .get<RecommendationResponse>(`/recommend/${stockCode}`, {
                params: { top_k: topK },
            })
            .then((r): RecommendationResponse => r.data),

    segmentCustomer: (features: CustomerFeatures) => api.post<SegmentInfo>('/segment/customer', features).then((r) => r.data),

    segmentsOverview: () => api.get<SegmentOverviewResponse>('/segments/overview').then((r) => r.data),

    modelInfo: () => api.get<ModelInfoResponse>('/models/info').then((r) => r.data),
};

// ── Shop API ───────────────────────────────────────────

export const shopApi = {
    products: (params: { category?: string; search?: string; page?: number; page_size?: number }) =>
        api.get<ProductListResponse>('/products', { params }).then((r) => r.data),

    product: (id: number) => api.get<ShopProduct>(`/products/${id.toString()}`).then((r): ShopProduct => r.data),

    categories: () => api.get<CategoryInfo[]>('/products/categories').then((r) => r.data),

    cart: () => api.get<CartResponse>('/cart').then((r) => r.data),

    addToCart: (product_id: number, quantity = 1) => api.post<CartItemData>('/cart', { product_id, quantity }).then((r) => r.data),

    updateCartItem: (itemId: number, quantity: number) => api.patch<{ message: string }>(`/cart/${itemId.toString()}`, { quantity }).then((r): { message: string } => r.data),

    removeFromCart: (itemId: number) => api.delete<{ message: string }>(`/cart/${itemId.toString()}`).then((r): { message: string } => r.data),

    recommendations: (currentProductId?: number) =>
        api
            .get<BehaviorRecommendationsResponse>('/behavior/recommendations', {
                params: currentProductId ? { current_product_id: currentProductId } : {},
            })
            .then((r) => r.data),

    behaviorProfile: () => api.get<BehaviorProfileResponse>('/behavior/profile').then((r) => r.data),

    checkout: (selected_item_ids: number[], promotion_id?: number) =>
        api
            .post<{ order_id: number; total_paid: number; message: string }>('/cart/checkout', {
                selected_item_ids,
                promotion_id,
            })
            .then((r) => r.data),
};

// ── Admin Promotions API ──────────────────────────────────────

export interface PromotionData {
    id: number;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number;
    usage_limit: number | null;
    times_used: number;
    is_active: boolean;
    created_at: string;
    valid_until: string | null;
}

export interface PromoSuggestion {
    product_id: number;
    product_name: string;
    image_url: string;
    reason: string;
    suggested_action: string;
    suggested_promo: {
        code: string;
        discount_type: string;
        discount_value: number;
        message: string;
    };
}

export const adminPromotionsApi = {
    getPromotions: () => api.get<PromotionData[]>('/promotions').then((r) => r.data),

    getAvailablePromotions: (cart_total: number) => api.get<PromotionData[]>('/promotions/available', { params: { cart_total } }).then((r) => r.data),

    createPromotion: (data: Partial<PromotionData>) => api.post<PromotionData>('/promotions', data).then((r) => r.data),

    deletePromotion: (id: number) => api.delete<{ message: string }>(`/promotions/${id.toString()}`).then((r): { message: string } => r.data),

    getSuggestions: () => api.get<PromoSuggestion[]>('/promotions/insights/suggestions').then((r) => r.data),

    applyPromotion: (code: string, cart_total: number) =>
        api
            .post<{
                valid: boolean;
                message: string;
                discount_amount: number;
                promotion_id: number | null;
            }>('/promotions/apply', { code, cart_total })
            .then((r) => r.data),
};

export interface OrderItemData {
    id: number;
    product_id: number;
    quantity: number;
    price_at_time: number;
    product_name: string;
    product_image: string;
}

export interface OrderData {
    id: number;
    user_id: number;
    total_amount: number;
    discount_amount: number;
    status: string;
    created_at: string;
    items: OrderItemData[];
}

export const ordersApi = {
    getMyOrders: () => api.get<OrderData[]>('/orders/me').then((r) => r.data),
    getAdminOrders: () => api.get<OrderData[]>('/admin/orders').then((r) => r.data),
    updateOrderStatus: (id: number, status: string) => api.put<{ message: string }>(`/admin/orders/${id.toString()}/status`, { status }).then((r): { message: string } => r.data),
};
