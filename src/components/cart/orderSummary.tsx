import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { PromotionData } from '@/types/promotionTypes';

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

    return (
        <Card className="h-fit sticky top-24 shadow-sm border-muted-foreground/10">
            <CardHeader>
                <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Subtotal ({selectedCount} items)</span>
                        <span>£{selectedTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Shipping</span>
                        <span className="text-primary font-bold">Free</span>
                    </div>

                    {discountData.valid && (
                        <div className="flex justify-between text-sm text-primary font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                            <span>{availablePromos?.find((p) => p.id === discountData.id)?.code ?? 'Discount'}</span>
                            <span>-£{discountData.amount.toFixed(2)}</span>
                        </div>
                    )}

                    <Separator className="bg-muted-foreground/10" />
                    <div className="flex justify-between text-lg font-extrabold">
                        <span>Total</span>
                        <span>£{finalTotal.toFixed(2)}</span>
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
                                    <div className="flex justify-between items-center w-full gap-4">
                                        <span className="font-bold">{promo.code}</span>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold">
                                            {promo.discount_type === 'PERCENTAGE'
                                                ? `-${promo.discount_value.toString()}%`
                                                : `-£${promo.discount_value.toString()}`}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {discountData.message && !discountData.valid && (
                        <p className="text-[11px] font-bold text-destructive px-1">{discountData.message}</p>
                    )}
                </div>

                <Button
                    size="lg"
                    className="w-full font-bold text-base h-12 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    onClick={onCheckout}
                    disabled={selectedCount === 0}
                >
                    Checkout ({selectedCount})
                </Button>
            </CardContent>
        </Card>
    );
}
