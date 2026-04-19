import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService';
import type { PromotionData } from '@/types/promotionTypes';

export function useAdminPromotions() {
    return useQuery({
        queryKey: ['admin-promos'],
        queryFn: promotionService.getPromotions,
    });
}

export function useAvailablePromotions(cartTotal: number) {
    return useQuery({
        queryKey: ['available-promos', cartTotal],
        queryFn: () => promotionService.getAvailablePromotions(cartTotal),
        enabled: cartTotal > 0,
    });
}

export function useAdminPromoSuggestions() {
    return useQuery({
        queryKey: ['admin-promo-suggestions'],
        queryFn: promotionService.getSuggestions,
    });
}

export function useCreatePromotion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<PromotionData>) => promotionService.createPromotion(data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: ['admin-promos'] });
            void qc.invalidateQueries({ queryKey: ['admin-promo-suggestions'] });
        },
    });
}

export function useDeletePromotion() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => promotionService.deletePromotion(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-promos'] }),
    });
}

export function useApplyPromotion() {
    return useMutation({
        mutationFn: ({ code, cartTotal }: { code: string; cartTotal: number }) => promotionService.applyPromotion(code, cartTotal),
    });
}
