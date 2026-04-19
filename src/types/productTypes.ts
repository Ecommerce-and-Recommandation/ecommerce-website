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
