import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSegmentsOverview, useSegmentCustomer } from '@/hooks/useMl';
import type { CustomerFeatures } from '@/types/customerTypes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2, Users, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

    const handleClassify = (e: React.SyntheticEvent) => {
        e.preventDefault();
        segmentMut.mutate(features);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Customer Segmentation</h1>
                    <p className="text-muted-foreground font-medium">AI-driven behavioral analysis using K-Means and PCA dimensionality reduction.</p>
                </div>
            </div>

            {/* Overview Section */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                </div>
            ) : (
                overview && (
                    <div className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Stats Cards */}
                            <Card className="shadow-md border-none bg-primary/5 h-full">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                            Model Performance
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-3xl font-extrabold">{overview.silhouette_score.toFixed(3)}</p>
                                        <p className="text-xs font-bold text-muted-foreground">Silhouette Score (Clustering Quality)</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-xl font-bold">{overview.n_clusters}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Clusters</p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold">{overview.total_customers.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Data Points</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Distribution Chart */}
                            <Card className="lg:col-span-2 shadow-md border-none overflow-hidden">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex items-center gap-2">
                                        <PieChartIcon className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                            Volume Distribution
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart
                                            data={overview.clusters.map((c) => ({
                                                name: c.segment_name.replace(/[^\w\s/]/g, '').trim(),
                                                count: c.count,
                                            }))}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                labelStyle={{ fontWeight: 800 }}
                                            />
                                            <Bar dataKey="count" radius={[8, 8, 8, 8]} barSize={40}>
                                                {overview.clusters.map((_, index) => (
                                                    /* eslint-disable-next-line @typescript-eslint/no-deprecated */
                                                    <Cell key={`cell-${String(index)}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cluster Detailed Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {overview.clusters.map((c, i) => (
                                <Card key={c.segment_id} className="border-none shadow-md overflow-hidden transition-transform hover:scale-[1.02]">
                                    <div className="h-1.5 w-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <CardContent className="pt-5">
                                        <p className="text-xs font-extrabold uppercase text-muted-foreground tracking-tight truncate">
                                            {c.segment_name.replace(/[^\w\s/]/g, '').trim()}
                                        </p>
                                        <p className="mt-1 text-2xl font-black">{c.count.toLocaleString()}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <Badge variant="secondary" className="text-[10px] font-bold">
                                                {String(c.percentage)}%
                                            </Badge>
                                            <span className="text-[10px] font-bold text-muted-foreground">Population</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )
            )}

            {/* Interactive Classification */}
            <Card className="shadow-xl border-none overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold">
                        <Users className="h-5 w-5 text-primary" />
                        Interactive Customer Classification
                    </CardTitle>
                    <CardDescription className="font-medium">
                        Define arbitrary customer traits to see which behavioral segment they map to.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleClassify} className="space-y-8">
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                                    <Label htmlFor={`seg-${key}`} className="text-[10px] font-extrabold uppercase text-muted-foreground/80">
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
                                        className="font-bold shadow-sm focus:ring-primary h-10"
                                    />
                                </div>
                            ))}
                        </div>

                        <Button
                            type="submit"
                            disabled={segmentMut.isPending}
                            className="w-full sm:w-auto px-10 h-12 text-lg font-extrabold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                        >
                            {segmentMut.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Users className="h-5 w-5 mr-2" />}
                            Run Classification Engine
                        </Button>
                    </form>

                    {segmentMut.data && (
                        <div className="mt-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 animate-in slide-in-from-bottom-4 duration-500">
                            <p className="text-xs font-extrabold uppercase text-primary/70 mb-1">Model Output Determination</p>
                            <div className="flex flex-wrap items-baseline gap-3 mb-6">
                                <h2 className="text-3xl font-black text-primary">{segmentMut.data.segment_name}</h2>
                                <Badge variant="outline" className="font-mono font-bold">
                                    ID: {segmentMut.data.segment_id}
                                </Badge>
                            </div>

                            <Separator className="mb-6 bg-primary/10" />

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {Object.entries(segmentMut.data.rfm_scores).map(([k, v]) => (
                                    <div key={k} className="bg-white/50 p-3 rounded-xl shadow-sm border border-white/80">
                                        <p className="text-[10px] font-extrabold uppercase text-muted-foreground mb-1">{k.replace(/_/g, ' ')}</p>
                                        <p className="font-mono font-black text-lg text-primary">{v.toFixed(2)}</p>
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

import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/admin/model/segmentation')({
    component: SegmentationPage,
});
