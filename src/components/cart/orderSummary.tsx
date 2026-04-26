import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPromotionValue } from '@/lib/pricing';
import { apiClient } from '@/services/apiClient';
import { auth } from '@/lib/auth';
import { Sparkles } from 'lucide-react';
import type { PromotionData } from '@/types/promotionTypes';

interface DynamicVoucher {
    probability: number;
    segment: string;
    voucher: {
        discount_type: string;
        discount_value: number;
        message: string;
        min_order_amount: number;
    } | null;
    reason: string;
}

interface OrderSummaryProps {
    selectedCount: number;
    selectedTotal: number;
    discountData: { valid: boolean; message: string; amount: number; id: number | null };
    availablePromos?: PromotionData[];
    onPromoSelect: (promoId: string) => void;
    onCheckout: () => void;
}

export function OrderSummary({ selectedCount, selectedTotal, discountData, availablePromos, onPromoSelect, onCheckout }: OrderSummaryProps) {
    const finalTotal = Math.max(0, selectedTotal - discountData.amount);
    const [dynamicVoucher, setDynamicVoucher] = useState<DynamicVoucher | null>(null);
    const [voucherDismissed, setVoucherDismissed] = useState(false);

    // Fetch dynamic AI voucher when cart total changes meaningfully
    useEffect(() => {
        if (selectedTotal <= 0 || !auth.isLoggedIn()) {
            setDynamicVoucher(null);
            return;
        }

        const controller = new AbortController();
        const fetchVoucher = async () => {
            try {
                const res = await apiClient.get<DynamicVoucher>('/promotions/dynamic-voucher', {
                    params: { cart_total: selectedTotal },
                    signal: controller.signal,
                });
                setDynamicVoucher(res.data);
                setVoucherDismissed(false);
            } catch {
                // Silently ignore — AI voucher is a nice-to-have
            }
        };

        // Debounce: only fetch after user stops adding items for 1 second
        const timer = setTimeout(fetchVoucher, 1000);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [selectedTotal]);

    const showVoucherBanner = dynamicVoucher?.voucher && !voucherDismissed && !discountData.valid;

    return (
        <div className="space-y-4">
            {/* AI Dynamic Voucher Banner */}
            {showVoucherBanner && dynamicVoucher?.voucher && (
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 animate-in slide-in-from-top-2 fade-in duration-500">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-bold">AI Recommendation</span>
                            <Badge variant="secondary" className="text-xs ml-auto">
                                {Math.round(dynamicVoucher.probability * 100)}% intent
                            </Badge>
                        </div>
                        <p className="text-sm font-medium">{dynamicVoucher.voucher.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Segment: {dynamicVoucher.segment}</span>
                            <span>•</span>
                            <span>
                                {dynamicVoucher.voucher.discount_type === 'PERCENTAGE'
                                    ? `${dynamicVoucher.voucher.discount_value}% off`
                                    : `£${dynamicVoucher.voucher.discount_value.toFixed(2)} off`}
                            </span>
                        </div>
                        <button
                            onClick={() => setVoucherDismissed(true)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Dismiss
                        </button>
                    </CardContent>
                </Card>
            )}

            {/* Main Order Summary Card */}
            <Card className="sticky top-24 h-fit border-muted-foreground/10 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal ({selectedCount} items)</span>
                            <span>{formatCurrency(selectedTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Shipping</span>
                            <span className="font-bold text-primary">Free</span>
                        </div>

                        {discountData.valid && (
                            <div className="animate-in fade-in slide-in-from-top-1 flex justify-between text-sm font-bold text-primary duration-200">
                                <span>{availablePromos?.find((p) => p.id === discountData.id)?.code ?? 'Discount'}</span>
                                <span>-{formatCurrency(discountData.amount)}</span>
                            </div>
                        )}

                        <Separator className="bg-muted-foreground/10" />
                        <div className="flex justify-between text-lg font-extrabold">
                            <span>Total</span>
                            <span>{formatCurrency(finalTotal)}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Select
                            value={discountData.id !== null ? String(discountData.id) : 'none'}
                            onValueChange={onPromoSelect}
                            disabled={selectedCount === 0 || !(availablePromos?.length ?? 0)}
                        >
                            <SelectTrigger className="w-full bg-muted/30">
                                <SelectValue placeholder={(availablePromos?.length ?? 0) > 0 ? 'Select a Promotion' : 'No promotions available'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No promotion</SelectItem>
                                {availablePromos?.map((promo) => (
                                    <SelectItem key={promo.id} value={String(promo.id)}>
                                        <div className="flex w-full items-center justify-between gap-4">
                                            <span className="font-bold">{promo.code}</span>
                                            <Badge variant="secondary" className="border-none bg-primary/10 font-bold text-primary">
                                                {formatPromotionValue(promo)}
                                            </Badge>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {discountData.message && !discountData.valid && <p className="px-1 text-[11px] font-bold text-destructive">{discountData.message}</p>}
                    </div>

                    <Button
                        size="lg"
                        className="h-12 w-full text-base font-bold transition-all hover:scale-[1.01] active:scale-[0.99]"
                        onClick={onCheckout}
                        disabled={selectedCount === 0}
                    >
                        Checkout ({selectedCount})
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
