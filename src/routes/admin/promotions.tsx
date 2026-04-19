import { createFileRoute } from '@tanstack/react-router';
import { adminPromotionsApi, type PromoSuggestion } from '@/lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            <Card className="border-none shadow-md bg-muted/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">AI Sales Insights</CardTitle>
                        <Badge variant="secondary">Beta</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoadingSuggestions ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : !suggestions || suggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground pb-6">No current insights. Your conversion rates look healthy!</p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {suggestions.map((s) => (
                                <div
                                    key={s.product_id}
                                    className="flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/30"
                                >
                                    <div className="flex gap-3">
                                        <img src={s.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                                        <div>
                                            <h3 className="line-clamp-2 text-sm font-semibold">{s.product_name}</h3>
                                            <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between rounded-lg bg-muted p-3">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Suggested Code</p>
                                            <p className="font-mono text-sm font-bold">{s.suggested_promo.code}</p>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => {
                                                handleAcceptSuggestion(s);
                                            }}
                                            disabled={createMutation.isPending}
                                            className="h-8 gap-1 text-xs"
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

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                {/* Promotions Table */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b bg-muted/40">
                        <CardTitle className="text-base">Active Promotions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
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
                                            <tr key={p.id} className="transition-colors hover:bg-muted/50 border-b last:border-0 font-medium">
                                                <td className="px-6 py-4 font-mono font-bold">{p.code}</td>
                                                <td className="px-6 py-4">
                                                    {p.discount_type === 'PERCENTAGE'
                                                        ? `${p.discount_value.toString()}%`
                                                        : `£${p.discount_value.toString()}`}
                                                </td>
                                                <td className="px-6 py-4">£{p.min_order_amount}</td>
                                                <td className="px-6 py-4">
                                                    {p.times_used.toString()} {p.usage_limit ? `/ ${p.usage_limit.toString()}` : ''}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {p.is_active ? (
                                                        <Badge variant="default" className="text-[10px] font-bold">
                                                            ACTIVE
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-[10px] font-bold">
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
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
                    </CardContent>
                </Card>

                {/* Create Form */}
                <Card className="shadow-sm self-start">
                    <CardHeader>
                        <CardTitle className="text-base">Create Custom Promo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="promo-code">Code</Label>
                                <Input
                                    id="promo-code"
                                    required
                                    value={code}
                                    onChange={(e) => {
                                        setCode(e.target.value);
                                    }}
                                    placeholder="SUMMER20"
                                    className="uppercase"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={discountType} onValueChange={setDiscountType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">% Off</SelectItem>
                                            <SelectItem value="FIXED_AMOUNT">£ Off</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="promo-val">Value</Label>
                                    <Input
                                        id="promo-val"
                                        required
                                        type="number"
                                        min="1"
                                        value={discountValue}
                                        onChange={(e) => {
                                            setDiscountValue(Number(e.target.value));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="promo-min">Min Order Amount (£)</Label>
                                <Input
                                    id="promo-min"
                                    type="number"
                                    min="0"
                                    value={minOrder}
                                    onChange={(e) => {
                                        setMinOrder(Number(e.target.value));
                                    }}
                                />
                            </div>
                            <Button type="submit" className="w-full font-bold" disabled={createMutation.isPending || !code}>
                                <Plus className="mr-2 h-4 w-4" /> Create Promotion
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/admin/promotions')({
    component: AdminPromotionsPage,
});
