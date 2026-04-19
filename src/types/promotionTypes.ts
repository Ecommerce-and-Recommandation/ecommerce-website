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
