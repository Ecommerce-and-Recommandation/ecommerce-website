import { apiClient } from './apiClient';
import type { ProductListResponse, ShopProduct, CategoryInfo, BehaviorRecommendationsResponse } from '@/types/productTypes';
import type { CartResponse, CartItemData } from '@/types/cartTypes';
import type { BehaviorProfileResponse } from '@/types/apiTypes';

export const shopService = {
    products: (params: { category?: string; search?: string; page?: number; page_size?: number }) =>
        apiClient.get<ProductListResponse>('/products', { params }).then((r) => r.data),

    product: (id: number) => apiClient.get<ShopProduct>(`/products/${id.toString()}`).then((r) => r.data),

    categories: () => apiClient.get<CategoryInfo[]>('/products/categories').then((r) => r.data),

    cart: () => apiClient.get<CartResponse>('/cart').then((r) => r.data),

    addToCart: (product_id: number, quantity = 1) => apiClient.post<CartItemData>('/cart', { product_id, quantity }).then((r) => r.data),

    updateCartItem: (itemId: number, quantity: number) =>
        apiClient.patch<{ message: string }>(`/cart/${itemId.toString()}`, { quantity }).then((r) => r.data),

    removeFromCart: (itemId: number) => apiClient.delete<{ message: string }>(`/cart/${itemId.toString()}`).then((r) => r.data),

    recommendations: (currentProductId?: number) =>
        apiClient
            .get<BehaviorRecommendationsResponse>('/behavior/recommendations', {
                params: currentProductId ? { current_product_id: currentProductId } : {},
            })
            .then((r) => r.data),

    behaviorProfile: () => apiClient.get<BehaviorProfileResponse>('/behavior/profile').then((r) => r.data),

    checkout: (selected_item_ids: number[], promotion_id?: number) =>
        apiClient
            .post<{ order_id: number; total_paid: number; message: string }>('/cart/checkout', {
                selected_item_ids,
                promotion_id,
            })
            .then((r) => r.data),
};
