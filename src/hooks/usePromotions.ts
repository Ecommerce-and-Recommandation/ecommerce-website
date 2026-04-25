import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { promotionService } from '@/services/promotionService';
import type { PromotionData } from '@/types/promotionTypes';

export function useAdminPromotions() {
    return useQuery({
        queryKey: queryKeys.adminPromotions,
        queryFn: promotionService.getPromotions,
    });
}

export function useAvailablePromotions(cartTotal: number) {
    return useQuery({
        queryKey: queryKeys.availablePromotions(cartTotal),
        queryFn: () => promotionService.getAvailablePromotions(cartTotal),
        enabled: cartTotal > 0,
    });
}

export function useAdminPromoSuggestions() {
    return useQuery({
        queryKey: queryKeys.adminPromoSuggestions,
        queryFn: promotionService.getSuggestions,
    });
}

export function useCreatePromotion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<PromotionData>) => promotionService.createPromotion(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: queryKeys.adminPromotions });
            void qc.invalidateQueries({ queryKey: queryKeys.adminPromoSuggestions });
        },
    });
}

export function useDeletePromotion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => promotionService.deletePromotion(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminPromotions }),
    });
}

export function useApplyPromotion() {
    return useMutation({
        mutationFn: ({ code, cartTotal }: { code: string; cartTotal: number }) => promotionService.applyPromotion(code, cartTotal),
    });
}
