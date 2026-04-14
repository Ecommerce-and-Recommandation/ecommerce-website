import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mlApi, shopApi, type CustomerFeatures } from './api';

// ── Admin / ML Queries ─────────────────────────────────

export function useHealth() {
    return useQuery({
        queryKey: ['health'],
        queryFn: mlApi.health,
        refetchInterval: 30_000,
    });
}

export function useModelInfo() {
    return useQuery({
        queryKey: ['modelInfo'],
        queryFn: mlApi.modelInfo,
    });
}

export function useSegmentsOverview() {
    return useQuery({
        queryKey: ['segmentsOverview'],
        queryFn: mlApi.segmentsOverview,
    });
}

export function useRecommendations(stockCode: string, topK = 10) {
    return useQuery({
        queryKey: ['recommend', stockCode, topK],
        queryFn: () => mlApi.recommend(stockCode, topK),
        enabled: !!stockCode,
    });
}

// ── Admin Mutations ────────────────────────────────────

export function usePredictPurchase() {
    return useMutation({
        mutationFn: (features: CustomerFeatures) => mlApi.predictPurchase(features),
    });
}

export function useSegmentCustomer() {
    return useMutation({
        mutationFn: (features: CustomerFeatures) => mlApi.segmentCustomer(features),
    });
}

// ── Shop Queries ───────────────────────────────────────

export function useProducts(params: { category?: string; search?: string; page?: number; page_size?: number }) {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => shopApi.products(params),
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => shopApi.product(id),
        enabled: !!id,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: shopApi.categories,
    });
}

export function useCart() {
    return useQuery({
        queryKey: ['cart'],
        queryFn: shopApi.cart,
    });
}

export function useShopRecommendations() {
    return useQuery({
        queryKey: ['shopRecommendations'],
        queryFn: shopApi.recommendations,
        refetchInterval: 60_000,
    });
}

export function useBehaviorProfile() {
    return useQuery({
        queryKey: ['behaviorProfile'],
        queryFn: shopApi.behaviorProfile,
    });
}

// ── Shop Mutations ─────────────────────────────────────

export function useAddToCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) =>
            shopApi.addToCart(productId, quantity),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}

export function useUpdateCartItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
            shopApi.updateCartItem(itemId, quantity),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}

export function useRemoveFromCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (itemId: number) => shopApi.removeFromCart(itemId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}
