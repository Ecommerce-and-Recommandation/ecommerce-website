import { createFileRoute } from '@tanstack/react-router';
import { adminPromotionsApi, type PromoSuggestion } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';

function AdminPromotionsPage() {
    const queryClient = useQueryClient();

    // Fetch lists
    const { data: promotions, isLoading: isLoadingPromos } = useQuery({
        queryKey: ['admin-promos'],
        queryFn: () => adminPromotionsApi.getPromotions(),
    });

    const { data: suggestions, isLoading: isLoadingSuggestions } = useQuery({
        queryKey: ['admin-promo-suggestions'],
        queryFn: () => adminPromotionsApi.getSuggestions(),
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: adminPromotionsApi.createPromotion,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
            setCode('');
            setDiscountValue(10);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminPromotionsApi.deletePromotion,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['admin-promos'] });
        },
    });

    // Form state
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState<number>(10);
    const [minOrder, setMinOrder] = useState<number>(0);

    function handleCreate(e: React.SyntheticEvent) {
        e.preventDefault();
        createMutation.mutate({
            code: code.toUpperCase(),
            discount_type: discountType,
            discount_value: discountValue,
            min_order_amount: minOrder,
        });
    }

    function handleAcceptSuggestion(sug: PromoSuggestion) {
        createMutation.mutate({
            code: sug.suggested_promo.code,
            discount_type: sug.suggested_promo.discount_type,
            discount_value: sug.suggested_promo.discount_value,
            min_order_amount: 0,
        });
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Promotions & Vouchers</h1>
                <p className="mt-2 text-muted-foreground">Manage discount codes and AI-driven sales campaigns.</p>
            </div>

            {/* AI Insights Widget */}
            <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-emerald-500/5 p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-indigo-500" />
                    <h2 className="text-xl font-bold text-foreground">AI Sales Insights</h2>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">Beta</span>
                </div>

                {isLoadingSuggestions ? (
                    <div className="flex h-32 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                    </div>
                ) : !suggestions || suggestions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No current insights. Your conversion rates look healthy!</p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {suggestions.map((s) => (
                            <div
                                key={s.product_id}
                                className="flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-indigo-500/30"
                            >
                                <div className="flex gap-3">
                                    <img src={s.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                                    <div>
                                        <h3 className="line-clamp-2 text-sm font-semibold">{s.product_name}</h3>
                                        <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/20">
                                    <div>
                                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Suggested Code:</p>
                                        <p className="font-mono text-sm font-bold">{s.suggested_promo.code}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleAcceptSuggestion(s);
                                        }}
                                        disabled={createMutation.isPending}
                                        className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        Create <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                {/* Promotions Table */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="border-b bg-muted/40 px-6 py-4">
                        <h2 className="font-semibold">Active Promotions</h2>
                    </div>
                    {isLoadingPromos ? (
                        <div className="p-8 text-center text-muted-foreground">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b text-muted-foreground">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Code</th>
                                        <th className="px-6 py-4 font-medium">Discount</th>
                                        <th className="px-6 py-4 font-medium">Min Order</th>
                                        <th className="px-6 py-4 font-medium">Uses</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {promotions?.map((p) => (
                                        <tr key={p.id} className="transition-colors hover:bg-muted/50">
                                            <td className="px-6 py-4 font-mono font-semibold text-emerald-600">{p.code}</td>
                                            <td className="px-6 py-4">
                                                {p.discount_type === 'PERCENTAGE' ? `${p.discount_value.toString()}%` : `£${p.discount_value.toString()}`}
                                            </td>
                                            <td className="px-6 py-4">£{p.min_order_amount}</td>
                                            <td className="px-6 py-4">
                                                {p.times_used.toString()} {p.usage_limit ? `/ ${p.usage_limit.toString()}` : ''}
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.is_active ? (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">
                                                        ACTIVE
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold text-red-700">
                                                        INACTIVE
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        deleteMutation.mutate(p.id);
                                                    }}
                                                    className="text-muted-foreground hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {promotions?.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No promotions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Form */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm self-start">
                    <h2 className="mb-4 font-semibold">Create Custom Promo</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Code</label>
                            <input
                                required
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                }}
                                placeholder="SUMMER20"
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm uppercase placeholder:normal-case"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Type</label>
                                <select
                                    value={discountType}
                                    onChange={(e) => {
                                        setDiscountType(e.target.value);
                                    }}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                >
                                    <option value="PERCENTAGE">% Off</option>
                                    <option value="FIXED_AMOUNT">£ Off</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Value</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    value={discountValue}
                                    onChange={(e) => {
                                        setDiscountValue(Number(e.target.value));
                                    }}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Min Order Amount (£)</label>
                            <input
                                type="number"
                                min="0"
                                value={minOrder}
                                onChange={(e) => {
                                    setMinOrder(Number(e.target.value));
                                }}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={createMutation.isPending || !code}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            <Plus className="h-4 w-4" /> Create Promotion
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/admin/promotions')({
    component: AdminPromotionsPage,
});
