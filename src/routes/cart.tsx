import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/hooks/useCart';
import { useAvailablePromotions } from '@/hooks/usePromotions';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { calculatePromotionDiscount } from '@/lib/pricing';
import { tracker } from '@/lib/tracker';
import { CartGroup } from '@/components/cart/cartGroup';
import { OrderSummary } from '@/components/cart/orderSummary';
import type { CartItemData } from '@/types/cartTypes';

function CartPage() {
    const { data: cart, isLoading } = useCart();
    const removeItem = useRemoveFromCart();
    const updateItem = useUpdateCartItem();

    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(() => new Set());
    const [discountData, setDiscountData] = useState<{ valid: boolean; message: string; amount: number; id: number | null }>({
        valid: false,
        message: '',
        amount: 0,
        id: null,
    });

    const navigate = useNavigate();

    const { selectedTotal, selectedCount } = useMemo(() => {
        let total = 0;
        let count = 0;
        if (cart?.items) {
            for (const item of cart.items) {
                if (selectedItemIds.has(item.id)) {
                    total += item.product_price * item.quantity;
                    count += item.quantity;
                }
            }
        }
        return { selectedTotal: total, selectedCount: count };
    }, [cart?.items, selectedItemIds]);

    const { data: availablePromos } = useAvailablePromotions(selectedTotal);

    useEffect(() => {
        if (discountData.valid && discountData.id !== null && availablePromos) {
            const promo = availablePromos.find((p) => p.id === discountData.id);
            if (!promo) {
                setDiscountData({ valid: false, message: 'Promotion no longer valid.', amount: 0, id: null });
            } else {
                setDiscountData((prev) => ({ ...prev, amount: calculatePromotionDiscount(selectedTotal, promo) }));
            }
        }
    }, [availablePromos, discountData.valid, discountData.id, selectedTotal]);

    const groupedItems = useMemo(() => {
        if (!cart?.items) return {};
        const groups: Record<string, CartItemData[]> = {};
        for (const item of cart.items) {
            const dateStr = item.added_at ? item.added_at.split('T')[0] : 'Earlier';
            groups[dateStr] ??= [];
            groups[dateStr].push(item);
        }
        return groups;
    }, [cart?.items]);

    const sortedDates = useMemo(
        () =>
            Object.keys(groupedItems).sort((a, b) => {
                if (a === 'Earlier') return 1;
                if (b === 'Earlier') return -1;
                return b.localeCompare(a);
            }),
        [groupedItems],
    );

    const handleProceedToCheckout = () => {
        void navigate({
            to: '/checkout',
            search: {
                items: Array.from(selectedItemIds).join(','),
                promo: discountData.id ? discountData.id.toString() : undefined,
            }
        });
    };

    if (isLoading)
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );

    if (!cart || cart.items.length === 0)
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-32 animate-in fade-in duration-500">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
                <p className="text-lg font-bold text-muted-foreground">Your cart is empty</p>
                <Link
                    to="/"
                    className="rounded-xl bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
                >
                    Start Shopping
                </Link>
            </div>
        );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-extrabold tracking-tight">Shopping Cart</h1>
                <span className="text-muted-foreground font-medium">({cart.item_count} items)</span>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="space-y-8 lg:col-span-2">
                    {sortedDates.map((dateStr) => (
                        <CartGroup
                            key={dateStr}
                            dateStr={dateStr}
                            items={groupedItems[dateStr]}
                            selectedItemIds={selectedItemIds}
                            onToggleSelection={(id) => {
                                const next = new Set(selectedItemIds);
                                if (next.has(id)) next.delete(id);
                                else next.add(id);
                                setSelectedItemIds(next);
                            }}
                            onToggleGroup={(ds) => {
                                const items = groupedItems[ds] ?? [];
                                const ids = items.map((i) => i.id);
                                const allSel = ids.every((id) => selectedItemIds.has(id));
                                const next = new Set(selectedItemIds);
                                ids.forEach((id) => (allSel ? next.delete(id) : next.add(id)));
                                setSelectedItemIds(next);
                            }}
                            onQuantityChange={(item, delta) => {
                                const newQty = item.quantity + delta;
                                if (newQty <= 0) {
                                    removeItem.mutate(item.id);
                                    tracker.trackRemoveFromCart(item.product_id);
                                } else {
                                    updateItem.mutate({ itemId: item.id, quantity: newQty });
                                }
                            }}
                            onRemove={(item) => {
                                removeItem.mutate(item.id);
                                tracker.trackRemoveFromCart(item.product_id);
                            }}
                        />
                    ))}
                </div>

                <OrderSummary
                    selectedCount={selectedCount}
                    selectedTotal={selectedTotal}
                    discountData={discountData}
                    availablePromos={availablePromos}
                    onPromoSelect={(pId) => {
                        if (pId === 'none') {
                            setDiscountData({ valid: false, message: '', amount: 0, id: null });
                            return;
                        }
                        const promo = availablePromos?.find((p) => p.id === parseInt(pId));
                        if (!promo) return;
                        setDiscountData({
                            valid: true,
                            message: 'Applied!',
                            amount: calculatePromotionDiscount(selectedTotal, promo),
                            id: promo.id,
                        });
                    }}
                    onCheckout={handleProceedToCheckout}
                />
            </div>
        </div>
    );
}

export const Route = createFileRoute('/cart')({
    component: CartPage,
});
