import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useMemo, useEffect } from 'react';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/lib/hooks';
import { Loader2, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Check } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { CartItemData } from '@/lib/api';

function CartPage() {
    const { data: cart, isLoading } = useCart();
    const removeItem = useRemoveFromCart();
    const updateItem = useUpdateCartItem();

    // Selection State
    const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());

    // Auto-select all on first load
    useEffect(() => {
        if (cart?.items && selectedItemIds.size === 0) {
            setSelectedItemIds(new Set(cart.items.map((i) => i.id)));
        }
    }, [cart?.items]);

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
            if (!groups[dateStr]) groups[dateStr] = [];
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

    // Calculate totals for selected items only
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

    function toggleSelection(itemId: number) {
        const next = new Set(selectedItemIds);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        setSelectedItemIds(next);
    }

    function toggleGroup(dateStr: string) {
        const items = groupedItems[dateStr] || [];
        const itemIds = items.map((i) => i.id);
        const allSelected = itemIds.every((id) => selectedItemIds.has(id));

        const next = new Set(selectedItemIds);
        for (const id of itemIds) {
            if (allSelected) next.delete(id);
            else next.add(id);
        }
        setSelectedItemIds(next);
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
                                        onClick={() => toggleGroup(dateStr)}
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
                                            <div key={item.id} className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
                                                {/* Checkbox */}
                                                <div className="flex items-center">
                                                    <button
                                                        onClick={() => toggleSelection(item.id)}
                                                        className={`flex h-5 w-5 items-center justify-center rounded border ${isSelected ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-input hover:border-emerald-500'}`}
                                                    >
                                                        {isSelected && <Check className="h-3.5 w-3.5" />}
                                                    </button>
                                                </div>

                                                <Link to="/products/$productId" params={{ productId: String(item.product_id) }}>
                                                    <img src={item.product_image} alt={item.product_name} className="h-24 w-24 rounded-lg object-cover" />
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
                                                                onClick={() => handleQuantity(item, -1)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-emerald-500"
                                                            >
                                                                <Minus className="h-3.5 w-3.5" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                            <button
                                                                onClick={() => handleQuantity(item, 1)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border transition-colors hover:border-emerald-500"
                                                            >
                                                                <Plus className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className="font-bold text-emerald-600">£{(item.product_price * item.quantity).toFixed(2)}</span>
                                                            <button
                                                                onClick={() => handleRemove(item)}
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
                        <div className="border-t pt-3">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="text-emerald-600">£{selectedTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        disabled={selectedCount === 0}
                        className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Checkout ({selectedCount})
                    </button>
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/cart')({
    component: CartPage,
});

