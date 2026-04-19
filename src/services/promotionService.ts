import { apiClient } from './apiClient';
import type { PromotionData, PromoSuggestion } from '@/types/promotionTypes';

export const promotionService = {
    getPromotions: () => apiClient.get<PromotionData[]>('/promotions').then((r) => r.data),

    getAvailablePromotions: (cart_total: number) =>
        apiClient.get<PromotionData[]>('/promotions/available', { params: { cart_total } }).then((r) => r.data),

    createPromotion: (data: Partial<PromotionData>) => apiClient.post<PromotionData>('/promotions', data).then((r) => r.data),

    deletePromotion: (id: number) => apiClient.delete<{ message: string }>(`/promotions/${id.toString()}`).then((r) => r.data),

    getSuggestions: () => apiClient.get<PromoSuggestion[]>('/promotions/insights/suggestions').then((r) => r.data),

    applyPromotion: (code: string, cart_total: number) =>
        apiClient
            .post<{
                valid: boolean;
                message: string;
                discount_amount: number;
                promotion_id: number | null;
            }>('/promotions/apply', { code, cart_total })
            .then((r) => r.data),
};
