import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/lib/hooks';
import { Loader2, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import { adminPromotionsApi, shopApi, type CartItemData } from '@/lib/api';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function CartPage() {
    const { data: cart, isLoading } = useCart();
    const removeItem = useRemoveFromCart();
    const updateItem = useUpdateCartItem();

    // Selection State
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

    // Promo State
    const [discountData, setDiscountData] = useState<{ valid: boolean; message: string; amount: number; id: number | null }>({
        valid: false,
        message: '',
        amount: 0,
        id: null,
    });

    // Checkout State
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [checkoutMessage, setCheckoutMessage] = useState('');
    const queryClient = useQueryClient();

    // Dynamically calculate totals for selected items
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

    // Fetch dynamic available promos based on total
    const { data: availablePromos } = useQuery({
        queryKey: ['available-promos', selectedTotal],
        queryFn: () => adminPromotionsApi.getAvailablePromotions(selectedTotal),
        enabled: selectedTotal > 0,
    });

    // Reset or recalculate applied promo
    useEffect(() => {
        if (discountData.valid && discountData.id !== null && availablePromos) {
            const isValid = availablePromos.find((p) => p.id === discountData.id);
            if (!isValid) {
                setDiscountData({ valid: false, message: 'Applied promotion is no longer valid for this cart total.', amount: 0, id: null });
            } else {
                const newAmount = isValid.discount_type === 'PERCENTAGE' ? (selectedTotal * isValid.discount_value) / 100 : isValid.discount_value;
                setDiscountData((prev) => ({ ...prev, amount: newAmount }));
            }
        }
    }, [availablePromos, discountData.valid, discountData.id, selectedTotal]);

    // Auto-select all on first load
    // useEffect(() => {
    //     if (cart?.items && selectedItemIds.size === 0) {
    //         setSelectedItemIds(new Set(cart.items.map((i) => i.id)));
    //     }
    // }, [cart?.items]);

    function handleRemove(item: CartItemData) {
        removeItem.mutate(item.id);
        tracker.trackRemoveFromCart(item.product_id);
    }

    function handleQuantity(item: CartItemData, delta: number) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) {
            handleRemove(item);
        } else {
            updateItem.mutate({ itemId: item.id, quantity: newQty });
        }
    }

    // Group items by date added
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

    // Sort descending by date
    const sortedDates = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'Earlier') return 1;
        if (b === 'Earlier') return -1;
        return b.localeCompare(a);
    });

    function toggleSelection(itemId: number) {
        const next = new Set(selectedItemIds);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        setSelectedItemIds(next);
    }

    function toggleGroup(dateStr: string) {
        const items = groupedItems[dateStr] ?? [];
        const itemIds = items.map((i) => i.id);
        const allSelected = itemIds.every((id) => selectedItemIds.has(id));

        const next = new Set(selectedItemIds);
        for (const id of itemIds) {
            if (allSelected) next.delete(id);
            else next.add(id);
        }
        setSelectedItemIds(next);
    }

    function handlePromoSelect(promoIdStr: string) {
        if (promoIdStr === 'none') {
            setDiscountData({ valid: false, message: '', amount: 0, id: null });
            return;
        }

        const promoId = parseInt(promoIdStr);
        const selectedPromo = availablePromos?.find((p) => p.id === promoId);

        if (!selectedPromo) return;

        // Calculate offline since we already have the rules
        const discountAmount =
            selectedPromo.discount_type === 'PERCENTAGE' ? (selectedTotal * selectedPromo.discount_value) / 100 : selectedPromo.discount_value;

        setDiscountData({
            valid: true,
            message: 'Promotion applied!',
            amount: discountAmount,
            id: promoId,
        });
    }

    async function handleConfirmCheckout() {
        setIsCheckingOut(true);
        try {
            const res = await shopApi.checkout(Array.from(selectedItemIds), discountData.id ?? undefined);
            setCheckoutMessage(res.message);
            // Invalidate cart to show it empty now
            void queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch (error) {
            setCheckoutMessage(error instanceof Error ? error.message : 'Checkout failed. Please try again.');
        } finally {
            setIsCheckingOut(false);
        }
    }

    function formatDate(dateStr: string) {
        if (dateStr === 'Earlier') return 'Earlier Items';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-32">
                <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
                <p className="text-lg text-muted-foreground">Your cart is empty</p>
                <Link to="/" className="rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="text-muted-foreground transition-colors hover:text-foreground">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold">Shopping Cart</h1>
                <span className="text-muted-foreground">({cart.item_count} items)</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Cart Items List */}
                <div className="space-y-6 lg:col-span-2">
                    {sortedDates.map((dateStr) => {
                        const items = groupedItems[dateStr];
                        const allSelected = items.every((i) => selectedItemIds.has(i.id));

                        return (
                            <div key={dateStr} className="space-y-3">
                                {/* Group Header */}
                                <div className="flex items-center gap-3 border-b pb-2">
                                    <button
                                        onClick={() => {
                                            toggleGroup(dateStr);
                                        }}
                                        className={`flex h-5 w-5 items-center justify-center rounded border ${allSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-input hover:border-emerald-500'}`}
                                    >
                                        {allSelected && <Check className="h-3.5 w-3.5" />}
                                    </button>
                                    <h2 className="font-semibold text-foreground/80">{formatDate(dateStr)}</h2>
                                </div>

                                {/* Items in group */}
                                <div className="space-y-3">
                                    {items.map((item) => {
                                        const isSelected = selectedItemIds.has(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
                                            >
                                                {/* Checkbox */}
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => {
                                                            toggleSelection(item.id);
                                                        }}
                                                        className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-input hover:border-emerald-500'}`}
                                                    >
                                                        {isSelected && <Check className="h-3.5 w-3.5" />}
                                                    </button>
                                                </div>

                                                <Link to="/products/$productId" params={{ productId: String(item.product_id) }}>
                                                    <img
                                                        src={item.product_image}
                                                        alt={item.product_name}
                                                        className="h-24 w-24 rounded-lg object-cover"
                                                    />
                                                </Link>

                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <Link
                                                            to="/products/$productId"
                                                            params={{ productId: String(item.product_id) }}
                                                            className="font-medium hover:text-emerald-600"
                                                        >
                                                            {item.product_name}
                                                        </Link>
                                                        <p className="text-xs text-muted-foreground">SKU: {item.stock_code}</p>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    handleQuantity(item, -1);
                                                                }}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-emerald-500"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => {
                                                                    handleQuantity(item, 1);
                                                                }}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-emerald-500"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className="font-bold text-emerald-600">
                                                                £{(item.product_price * item.quantity).toFixed(2)}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    handleRemove(item);
                                                                }}
                                                                className="text-muted-foreground transition-colors hover:text-red-500"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="h-fit rounded-xl border bg-card p-6 shadow-sm sticky top-24">
                    <h2 className="text-lg font-bold">Order Summary</h2>
                    <div className="mt-4 space-y-3 border-t pt-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal ({selectedCount} items)</span>
                            <span>£{selectedTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Shipping</span>
                            <span className="text-emerald-600">Free</span>
                        </div>

                        {discountData.valid && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span>{availablePromos?.find((p) => p.id === discountData.id)?.code ?? 'Discount'}</span>
                                <span>-£{discountData.amount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="border-t pt-3">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-emerald-600">£{Math.max(0, selectedTotal - discountData.amount).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Select
                            value={discountData.id !== null ? String(discountData.id) : 'none'}
                            onValueChange={(val) => {
                                handlePromoSelect(val);
                            }}
                            disabled={selectedCount === 0 || !(availablePromos?.length ?? 0)}
                        >
                            <SelectTrigger className="w-full bg-muted/30">
                                <SelectValue placeholder={(availablePromos?.length ?? 0) > 0 ? 'Select a Promotion' : 'No promotions applied'} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No promotion</SelectItem>
                                {availablePromos?.map((promo) => (
                                    <SelectItem key={promo.id} value={String(promo.id)}>
                                        <div className="flex justify-between items-center w-full gap-4">
                                            <span className="font-medium">{promo.code}</span>
                                            <span className="text-xs text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                                                {promo.discount_type === 'PERCENTAGE'
                                                    ? `-${promo.discount_value.toString()}%`
                                                    : `-£${promo.discount_value.toString()}`}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {discountData.message && !discountData.valid && <p className="mt-2 text-xs font-semibold text-red-500">{discountData.message}</p>}

                    <button
                        onClick={() => {
                            setShowCheckoutModal(true);
                        }}
                        disabled={selectedCount === 0}
                        className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Checkout ({selectedCount})
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                    <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl animate-in zoom-in-95 duration-200">
                        {checkoutMessage ? (
                            <div className="flex flex-col items-center gap-4 text-center">
                                <div
                                    className={`flex h-16 w-16 items-center justify-center rounded-full ${checkoutMessage.includes('success') ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}
                                >
                                    <Check className="h-8 w-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Order Status</h2>
                                    <p className="mt-1 text-muted-foreground">{checkoutMessage}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowCheckoutModal(false);
                                        setCheckoutMessage('');
                                    }}
                                    className="mt-4 w-full rounded-xl bg-foreground text-background py-3 font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold mb-4">Confirm Checkout</h2>
                                <p className="text-muted-foreground mb-6">
                                    You are about to place an order for {selectedCount.toString()} items totaling{' '}
                                    <span className="font-bold text-foreground">£{Math.max(0, selectedTotal - discountData.amount).toFixed(2)}</span>.
                                    This action cannot be undone. Are you sure you want to proceed?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCheckoutModal(false);
                                        }}
                                        disabled={isCheckingOut}
                                        className="flex-1 rounded-xl border py-3 font-semibold hover:bg-muted"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            void handleConfirmCheckout();
                                        }}
                                        disabled={isCheckingOut}
                                        className="flex-1 rounded-xl bg-emerald-500 py-3 font-semibold text-white hover:bg-emerald-600 flex justify-center items-center gap-2"
                                    >
                                        {isCheckingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export const Route = createFileRoute('/cart')({
    component: CartPage,
});
