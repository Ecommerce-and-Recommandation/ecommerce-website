import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSegmentsOverview, useSegmentCustomer } from '@/lib/hooks';
import type { CustomerFeatures } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Users } from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

export const Route = createFileRoute('/admin/model/segmentation')({
    component: SegmentationPage,
});

function SegmentationPage() {
    const { data: overview, isLoading } = useSegmentsOverview();
    const segmentMut = useSegmentCustomer();

    const [features, setFeatures] = useState<CustomerFeatures>({
        recency: 10,
        frequency: 12,
        monetary: 2500,
        avg_order_value: 200,
        avg_items_per_order: 15,
        total_unique_products: 40,
        avg_days_between_orders: 14,
        cancellation_rate: 0.02,
        days_since_first_purchase: 400,
        is_weekend_shopper: 0.1,
        favorite_hour: 11,
        country: 'United Kingdom',
    });

    const handleChange = (key: keyof CustomerFeatures, value: string) => {
        setFeatures((prev) => ({
            ...prev,
            [key]: key === 'country' ? value : Number(value),
        }));
    };

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const handleClassify = (e: React.FormEvent) => {
        e.preventDefault();
        segmentMut.mutate(features);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Customer Segmentation</h1>
                <p className="text-muted-foreground">Phân khúc khách hàng bằng K-Means + PCA</p>
            </div>
            {/* Overview */}
            {isLoading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                overview && (
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Bar chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Segment Distribution</CardTitle>
                                <CardDescription>
                                    {overview.total_customers.toLocaleString()} khách hàng · {overview.n_clusters} segments · Silhouette{' '}
                                    {overview.silhouette_score.toFixed(3)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart
                                        data={overview.clusters.map((c, i) => ({
                                            name: c.segment_name.replace(/[^\w\s/]/g, '').trim(),
                                            count: c.count,
                                            fill: COLORS[i % COLORS.length],
                                        }))}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {overview.clusters.map((_, i) => (
                                                // eslint-disable-next-line @typescript-eslint/no-deprecated
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Segment cards */}
                        <div className="grid grid-cols-2 gap-3">
                            {overview.clusters.map((c, i) => (
                                <Card
                                    key={c.segment_id}
                                    className="border-l-4"
                                    style={{
                                        borderLeftColor: COLORS[i % COLORS.length],
                                    }}
                                >
                                    <CardContent className="pt-5">
                                        <p className="text-sm font-semibold">{c.segment_name.replace(/[^\w\s/]/g, '').trim()}</p>
                                        <p className="mt-1 text-2xl font-bold">{c.count.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground">{c.percentage}% of customers</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            )}
            {/* Classify a customer */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Users className="h-4 w-4" />
                        Classify Customer
                    </CardTitle>
                    <CardDescription>Nhập RFM features để xác định khách hàng thuộc segment nào</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleClassify} className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {(
                                [
                                    'recency',
                                    'frequency',
                                    'monetary',
                                    'avg_order_value',
                                    'total_unique_products',
                                    'avg_days_between_orders',
                                    'days_since_first_purchase',
                                    'country',
                                ] as const
                            ).map((key) => (
                                <div key={key} className="space-y-1.5">
                                    <Label htmlFor={`seg-${key}`} className="text-xs">
                                        {key.replace(/_/g, ' ')}
                                    </Label>
                                    <Input
                                        id={`seg-${key}`}
                                        type={key === 'country' ? 'text' : 'number'}
                                        step="any"
                                        value={features[key]}
                                        onChange={(e) => {
                                            handleChange(key, e.target.value);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={segmentMut.isPending}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            {segmentMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                            Classify
                        </button>
                    </form>

                    {segmentMut.data && (
                        <div className="mt-6 rounded-lg border bg-muted/50 p-4">
                            <p className="text-sm text-muted-foreground">Kết quả phân loại:</p>
                            <p className="mt-1 text-lg font-bold">{segmentMut.data.segment_name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Segment ID: {segmentMut.data.segment_id}</p>

                            <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                                {Object.entries(segmentMut.data.rfm_scores).map(([k, v]) => (
                                    <div key={k}>
                                        <span className="text-muted-foreground">{k.replace(/_/g, ' ')}</span>
                                        <p className="font-mono font-medium">{v.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
