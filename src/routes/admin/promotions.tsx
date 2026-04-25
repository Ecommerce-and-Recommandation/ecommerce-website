import { createFileRoute } from '@tanstack/react-router';
import { useAdminPromotions, useAdminPromoSuggestions, useCreatePromotion, useDeletePromotion } from '@/hooks/usePromotions';
import { Sparkles, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PromoForm } from '@/components/promotions/promoForm';
import { formatCurrency, formatPromotionValue } from '@/lib/pricing';
import type { PromoSuggestion, PromotionData } from '@/types/promotionTypes';

function AdminPromotionsPage() {
    const { data: promotions, isLoading: isLoadingPromos } = useAdminPromotions();
    const { data: suggestions, isLoading: isLoadingSuggestions } = useAdminPromoSuggestions();

    const createMutation = useCreatePromotion();
    const deleteMutation = useDeletePromotion();

    const handleCreate = (data: { code: string; discount_type: string; discount_value: number; min_order_amount: number }) => {
        createMutation.mutate(data);
    };

    const handleAcceptSuggestion = (sug: PromoSuggestion) => {
        createMutation.mutate({
            code: sug.suggested_promo.code,
            discount_type: sug.suggested_promo.discount_type,
            discount_value: sug.suggested_promo.discount_value,
            min_order_amount: 0,
        });
    };

    return (
        <div className="animate-in fade-in space-y-8 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Promotions & Vouchers</h1>
                <p className="mt-2 font-medium text-muted-foreground">Manage discount codes and AI-driven sales campaigns.</p>
            </div>

            <Card className="border-none bg-linear-to-br from-primary/5 to-primary/10 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-bold">AI Sales Insights</CardTitle>
                        <Badge variant="secondary" className="bg-primary/20 font-bold text-primary">
                            Smart Insights
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingSuggestions ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !suggestions || suggestions.length === 0 ? (
                        <p className="pb-6 text-center text-sm font-medium text-muted-foreground">No current insights. Your conversion rates look healthy!</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {suggestions.map((s: PromoSuggestion) => (
                                <div
                                    key={s.product_id}
                                    className="flex flex-col justify-between rounded-xl border bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-md"
                                >
                                    <div className="flex gap-3">
                                        <img src={s.image_url} alt="" className="h-16 w-16 rounded-xl object-cover shadow-sm" />
                                        <div className="min-w-0">
                                            <h3 className="line-clamp-2 text-sm font-bold leading-tight">{s.product_name}</h3>
                                            <p className="mt-1 line-clamp-2 text-xs font-medium text-muted-foreground">{s.reason}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between rounded-xl border bg-muted/50 p-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">Suggested Code</p>
                                            <p className="truncate font-mono text-sm font-extrabold text-primary">{s.suggested_promo.code}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                handleAcceptSuggestion(s);
                                            }}
                                            disabled={createMutation.isPending}
                                            className="h-8 gap-1 text-xs font-bold"
                                        >
                                            Create <ArrowRight className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                <Card className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b bg-muted/40 px-6 py-4">
                        <CardTitle className="text-base font-bold">Active Promotions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoadingPromos ? (
                            <div className="p-12 text-center">
                                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                                <p className="mt-2 text-sm font-bold text-muted-foreground">Loading promotions...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b bg-muted/20 text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Discount</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Min Order</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Usage</th>
                                            <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="relative divide-y">
                                        {promotions?.map((p: PromotionData) => (
                                            <tr key={p.id} className="font-medium transition-colors hover:bg-muted/30">
                                                <td className="px-6 py-4">
                                                    <span className="rounded bg-muted px-2 py-1 font-mono font-extrabold text-primary">{p.code}</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold">{formatPromotionValue(p).slice(1)}</td>
                                                <td className="px-6 py-4 font-bold">{formatCurrency(p.min_order_amount)}</td>
                                                <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                                                    {String(p.times_used)} {p.usage_limit ? `/ ${String(p.usage_limit)}` : ''}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p.is_active ? (
                                                        <Badge className="bg-emerald-500 text-[10px] font-extrabold hover:bg-emerald-600">ACTIVE</Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-[10px] font-extrabold">
                                                            INACTIVE
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            deleteMutation.mutate(p.id);
                                                        }}
                                                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                                        title="Delete"
                                                        disabled={deleteMutation.isPending && deleteMutation.variables === p.id}
                                                    >
                                                        {deleteMutation.isPending && deleteMutation.variables === p.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {promotions?.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center font-bold text-muted-foreground">
                                                    No active promotions found. Create one to get started!
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="self-start">
                    <PromoForm onCreate={handleCreate} isPending={createMutation.isPending} />
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/admin/promotions')({
    component: AdminPromotionsPage,
});
