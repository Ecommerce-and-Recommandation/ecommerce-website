import { useMutation, useQuery } from '@tanstack/react-query';
import { mlService } from '@/services/mlService';
import { shopService } from '@/services/shopService';
import type { CustomerFeatures } from '@/types/customerTypes';

export function useHealth() {
    return useQuery({
        queryKey: ['health'],
        queryFn: mlService.health,
        refetchInterval: 30_000,
    });
}

export function useModelInfo() {
    return useQuery({
        queryKey: ['modelInfo'],
        queryFn: mlService.modelInfo,
    });
}

export function useSegmentsOverview() {
    return useQuery({
        queryKey: ['segmentsOverview'],
        queryFn: mlService.segmentsOverview,
    });
}

export function useRecommendations(stockCode: string, topK = 10) {
    return useQuery({
        queryKey: ['recommend', stockCode, topK],
        queryFn: () => mlService.recommend(stockCode, topK),
        enabled: !!stockCode,
    });
}

export function usePredictPurchase() {
    return useMutation({
        mutationFn: (features: CustomerFeatures) => mlService.predictPurchase(features),
    });
}

export function useSegmentCustomer() {
    return useMutation({
        mutationFn: (features: CustomerFeatures) => mlService.segmentCustomer(features),
    });
}

export function useShopRecommendations(currentProductId?: number) {
    const enabled = currentProductId !== -1;
    const pid = currentProductId && currentProductId > 0 ? currentProductId : undefined;
    return useQuery({
        queryKey: ['shopRecommendations', pid ?? null],
        queryFn: () => shopService.recommendations(pid),
        enabled,
        staleTime: 0,
        refetchInterval: 30_000,
    });
}

export function useBehaviorProfile() {
    return useQuery({
        queryKey: ['behaviorProfile'],
        queryFn: shopService.behaviorProfile,
    });
}
