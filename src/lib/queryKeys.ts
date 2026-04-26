export const queryKeys = {
    cart: ['cart'] as const,
    categories: ['categories'] as const,
    myOrders: ['my-orders'] as const,
    adminOrders: (page: number) => ['admin-orders', page] as const,
    adminPromotions: ['admin-promos'] as const,
    adminPromoSuggestions: ['admin-promo-suggestions'] as const,
    adminProducts: (params: { category?: string; search?: string; page?: number; page_size?: number }) =>
        ['admin-products', params] as const,
    health: ['health'] as const,
    modelInfo: ['modelInfo'] as const,
    segmentsOverview: ['segmentsOverview'] as const,
    behaviorProfile: ['behaviorProfile'] as const,
    products: (params: { category?: string; search?: string; page?: number; page_size?: number }) => ['products', params] as const,
    product: (id: number) => ['product', id] as const,
    availablePromotions: (cartTotal: number) => ['available-promos', cartTotal] as const,
    recommendations: (stockCode: string, topK: number) => ['recommend', stockCode, topK] as const,
    shopRecommendations: (productId?: number | null) => ['shopRecommendations', productId ?? null] as const,
} as const;
