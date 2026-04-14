import { useMutation, useQuery } from '@tanstack/react-query';
import { mlApi, type CustomerFeatures } from './api';

// ── Queries ────────────────────────────────────────────

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

// ── Mutations ──────────────────────────────────────────

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
