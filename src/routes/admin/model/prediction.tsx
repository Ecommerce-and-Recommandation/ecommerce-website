import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePredictPurchase } from '@/hooks/useMl';
import type { CustomerFeatures } from '@/types/customerTypes';
import { Brain, Loader2, PartyPopper, ShieldAlert, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const DEFAULT_FEATURES: CustomerFeatures = {
    recency: 30,
    frequency: 5,
    monetary: 500,
    avg_order_value: 100,
    avg_items_per_order: 8,
    total_unique_products: 15,
    avg_days_between_orders: 20,
    cancellation_rate: 0.05,
    days_since_first_purchase: 180,
    is_weekend_shopper: 0.2,
    favorite_hour: 12,
    country: 'United Kingdom',
};

const FIELD_LABELS: Record<string, string> = {
    recency: 'Recency (days)',
    frequency: 'Frequency (orders)',
    monetary: 'Monetary (£)',
    avg_order_value: 'Avg Order Value',
    avg_items_per_order: 'Avg Items per Order',
    total_unique_products: 'Unique Products',
    avg_days_between_orders: 'Avg Days Between Orders',
    cancellation_rate: 'Cancellation Rate (0-1)',
    days_since_first_purchase: 'Customer Age (days)',
    is_weekend_shopper: 'Weekend Shopper (0-1)',
    favorite_hour: 'Favorite Hour',
    country: 'Country',
};

function PredictionPage() {
    const [features, setFeatures] = useState<CustomerFeatures>(DEFAULT_FEATURES);
    const mutation = usePredictPurchase();

    const handleChange = (key: keyof CustomerFeatures, value: string) => {
        setFeatures((prev) => ({
            ...prev,
            [key]: key === 'country' ? value : Number(value),
        }));
    };

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        mutation.mutate(features);
    };

    const result = mutation.data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Purchase Prediction</h1>
                <p className="text-muted-foreground font-medium">
                    Predict the probability of a customer returning for a purchase in the next 30 days.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Form */}
                <Card className="lg:col-span-3 shadow-md border-none overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg font-bold">Customer Profile Features</CardTitle>
                        <CardDescription className="font-medium">Enter behavioral data to run the AI prediction model.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(FIELD_LABELS).map(([key, label]) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label htmlFor={key} className="text-[10px] uppercase font-bold text-muted-foreground">
                                            {label}
                                        </Label>
                                        <Input
                                            id={key}
                                            type={key === 'country' ? 'text' : 'number'}
                                            step="any"
                                            value={features[key as keyof CustomerFeatures]}
                                            onChange={(e) => {
                                                handleChange(key as keyof CustomerFeatures, e.target.value);
                                            }}
                                            className="font-bold focus:ring-primary shadow-sm"
                                        />
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="w-full sm:w-auto px-8 h-12 text-lg font-extrabold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                            >
                                {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Brain className="h-5 w-5 mr-2" />}
                                Analyze & Predict
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Result */}
                <div className="space-y-4 lg:col-span-2">
                    {result && (
                        <>
                            <Card
                                className={`shadow-lg border-none overflow-hidden ${result.will_purchase ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/50' : 'bg-gradient-to-br from-red-50 to-red-100/50'}`}
                            >
                                <CardContent className="pt-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl shadow-sm ${result.will_purchase ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                            {result.will_purchase ? (
                                                <PartyPopper className="h-10 w-10 text-white" />
                                            ) : (
                                                <ShieldAlert className="h-10 w-10 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-extrabold ${result.will_purchase ? 'text-emerald-900' : 'text-red-900'}`}>
                                                {result.will_purchase ? 'Likely to Return' : 'Unlikely to Return'}
                                            </p>
                                            <p className="text-sm font-bold opacity-70">Probability: {(result.probability * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-8 space-y-2">
                                        <div className="h-4 w-full overflow-hidden rounded-full bg-white shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${result.probability >= 0.7 ? `bg-emerald-500` : result.probability >= 0.5 ? `bg-amber-500` : `bg-red-500`}`}
                                                style={{ width: `${String(result.probability * 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] uppercase font-extrabold text-muted-foreground/60">
                                            <span>Low Confidence</span>
                                            <span>Moderate</span>
                                            <span>High Confidence</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-md border-none">
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Classification Segment</span>
                                        <Badge variant="outline" className="font-extrabold text-xs">
                                            {result.segment_name}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Internal Segment ID</span>
                                        <span className="font-mono font-extrabold text-sm px-2 py-0.5 bg-muted rounded">#{result.segment_id}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {result.show_promotion && (
                                <Card className="border-none shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Brain className="h-24 w-24" />
                                    </div>
                                    <CardContent className="pt-6 relative z-10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="h-5 w-5" />
                                            <p className="text-sm font-extrabold uppercase">Smart Promotion Strategy</p>
                                        </div>
                                        <p className="text-lg font-bold leading-tight">{result.promotion_message}</p>
                                        <div className="mt-4 flex gap-2">
                                            <Badge className="bg-white/20 hover:bg-white/30 border-none font-bold">Retention Hook</Badge>
                                            <Badge className="bg-white/20 hover:bg-white/30 border-none font-bold">Incentive</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {mutation.isError && (
                        <Card className="border-none shadow-lg bg-destructive/10 text-destructive">
                            <CardContent className="pt-6 flex items-center gap-3">
                                <ShieldAlert className="h-5 w-5 flex-shrink-0" />
                                <p className="text-sm font-bold">System Error: {mutation.error.message}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/admin/model/prediction')({
    component: PredictionPage,
});
