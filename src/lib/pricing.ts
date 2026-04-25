import type { PromotionData } from '@/types/promotionTypes';

type PromotionLike = Pick<PromotionData, 'discount_type' | 'discount_value'>;

const currencyFormatter = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
});

export function formatCurrency(amount: number) {
    return currencyFormatter.format(amount);
}

export function calculatePromotionDiscount(total: number, promotion?: PromotionLike | null) {
    if (!promotion) return 0;
    return promotion.discount_type === 'PERCENTAGE' ? (total * promotion.discount_value) / 100 : promotion.discount_value;
}

export function formatPromotionValue(promotion: PromotionLike) {
    return promotion.discount_type === 'PERCENTAGE' ? `-${promotion.discount_value.toString()}%` : `-${formatCurrency(promotion.discount_value)}`;
}
