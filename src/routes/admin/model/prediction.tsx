import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePredictPurchase } from '@/lib/hooks';
import type { CustomerFeatures } from '@/lib/api';
import { Brain, Loader2, PartyPopper, ShieldAlert } from 'lucide-react';

export const Route = createFileRoute('/admin/model/prediction')({
    component: PredictionPage,
});

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
    recency: 'Recency (ngày)',
    frequency: 'Frequency (đơn hàng)',
    monetary: 'Monetary (£)',
    avg_order_value: 'Giá trị TB / đơn',
    avg_items_per_order: 'Items TB / đơn',
    total_unique_products: 'SP khác nhau',
    avg_days_between_orders: 'Khoảng cách TB (ngày)',
    cancellation_rate: 'Tỷ lệ hủy (0-1)',
    days_since_first_purchase: 'Tuổi KH (ngày)',
    is_weekend_shopper: 'Weekend shopper (0-1)',
    favorite_hour: 'Giờ mua phổ biến',
    country: 'Quốc gia',
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

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(features);
    };

    const result = mutation.data;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Purchase Prediction</h1>
                <p className="text-muted-foreground">Dự đoán xác suất khách hàng quay lại mua hàng trong 30 ngày tới</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                {/* Form */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="text-base">Customer Features</CardTitle>
                        <CardDescription>Nhập thông tin hành vi khách hàng</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Object.entries(FIELD_LABELS).map(([key, label]) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label htmlFor={key} className="text-xs">
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
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                            >
                                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                                Predict
                            </button>
                        </form>
                    </CardContent>
                </Card>

                {/* Result */}
                <div className="space-y-4 lg:col-span-2">
                    {result && (
                        <>
                            <Card className={result.will_purchase ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        {result.will_purchase ? (
                                            <PartyPopper className="h-8 w-8 text-emerald-500" />
                                        ) : (
                                            <ShieldAlert className="h-8 w-8 text-red-500" />
                                        )}
                                        <div>
                                            <p className="text-lg font-bold">{result.will_purchase ? "Sẽ mua lại ✅" : "Không mua lại ❌"}</p>
                                            <p className="text-sm text-muted-foreground">Xác suất: {(result.probability * 100).toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mt-4">
                                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full transition-all ${result.probability >= 0.7 ? `bg-emerald-500` : result.probability >= 0.5 ? `bg-yellow-500` : `bg-red-500`}`}
                                                style={{
                                                    width: `${String(result.probability * 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                                            <span>0%</span>
                                            <span>50%</span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Segment</span>
                                        <span className="font-medium">{result.segment_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Segment ID</span>
                                        <span className="font-mono font-medium">{result.segment_id}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {result.show_promotion && (
                                <Card className="border-amber-500/30 bg-amber-500/5">
                                    <CardContent className="pt-6">
                                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">🎁 Smart Promotion</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{result.promotion_message}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}

                    {mutation.isError && (
                        <Card className="border-destructive/30 bg-destructive/5">
                            <CardContent className="pt-6 text-sm text-destructive">Lỗi: {mutation.error.message}</CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
