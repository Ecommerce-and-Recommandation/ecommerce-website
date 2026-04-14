import { createFileRoute, Link } from '@tanstack/react-router';
import { useCart, useRemoveFromCart, useUpdateCartItem } from '@/lib/hooks';
import { Loader2, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { CartItemData } from '@/lib/api';

function CartPage() {
    const { data: cart, isLoading } = useCart();
    const removeItem = useRemoveFromCart();
    const updateItem = useUpdateCartItem();

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
                <ShoppingBag className="h-16 w-16 text-slate-600" />
                <p className="text-lg text-slate-400">Your cart is empty</p>
                <Link
                    to="/"
                    className="rounded-xl bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link to="/" className="text-slate-400 transition-colors hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
                <span className="text-slate-500">({cart.item_count} items)</span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Cart Items */}
                <div className="space-y-3 lg:col-span-2">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
                        >
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
                                        className="font-medium text-white hover:text-emerald-400"
                                    >
                                        {item.product_name}
                                    </Link>
                                    <p className="text-xs text-slate-500">SKU: {item.stock_code}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantity(item, -1)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 transition-colors hover:border-slate-500"
                                        >
                                            <Minus className="h-3.5 w-3.5" />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantity(item, 1)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 transition-colors hover:border-slate-500"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-emerald-400">
                                            £{(item.product_price * item.quantity).toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(item)}
                                            className="text-slate-500 transition-colors hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="h-fit rounded-xl border border-slate-800 bg-slate-900 p-6">
                    <h2 className="text-lg font-bold text-white">Order Summary</h2>
                    <div className="mt-4 space-y-3 border-t border-slate-800 pt-4">
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Subtotal</span>
                            <span>£{cart.total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-400">
                            <span>Shipping</span>
                            <span className="text-emerald-400">Free</span>
                        </div>
                        <div className="border-t border-slate-800 pt-3">
                            <div className="flex justify-between text-lg font-bold text-white">
                                <span>Total</span>
                                <span className="text-emerald-400">£{cart.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <button className="mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40">
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/cart')({
    component: CartPage,
});
