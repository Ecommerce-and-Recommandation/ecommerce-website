import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useModelInfo, useSegmentsOverview } from '@/lib/hooks';
import { BarChart3, Brain, Package, TrendingUp, Users, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const SEGMENT_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

export const Route = createFileRoute('/')({
    component: DashboardPage,
});

function DashboardPage() {
    const { data: modelInfo, isLoading: loadingModel } = useModelInfo();
    const { data: segments, isLoading: loadingSeg } = useSegmentsOverview();

    if (loadingModel || loadingSeg) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const metrics = modelInfo?.metrics;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">Tổng quan hệ thống E-commerce ML Models</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="F1-Score"
                    value={metrics ? `${(metrics.f1_score * 100).toFixed(1)}%` : '—'}
                    subtitle="Random Forest"
                    icon={<Brain className="h-5 w-5 text-chart-1" />}
                />
                <KpiCard
                    title="ROC-AUC"
                    value={metrics ? `${(metrics.roc_auc * 100).toFixed(1)}%` : '—'}
                    subtitle="Purchase Prediction"
                    icon={<TrendingUp className="h-5 w-5 text-chart-2" />}
                />
                <KpiCard
                    title="Total Products"
                    value={modelInfo?.knn.total_products.toLocaleString() ?? '—'}
                    subtitle={`Hit Rate: ${modelInfo ? (modelInfo.knn.hit_rate * 100).toFixed(1) : '0'}%`}
                    icon={<Package className="h-5 w-5 text-chart-3" />}
                />
                <KpiCard
                    title="Customer Segments"
                    value={String(segments?.n_clusters ?? '—')}
                    subtitle={`Silhouette: ${segments ? segments.silhouette_score.toFixed(3) : '—'}`}
                    icon={<Users className="h-5 w-5 text-chart-4" />}
                />
            </div>

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Model Metrics Bar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-4 w-4" />
                            Random Forest – Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {metrics && (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart
                                    data={[
                                        {
                                            name: 'Accuracy',
                                            value: metrics.accuracy,
                                        },
                                        {
                                            name: 'Precision',
                                            value: metrics.precision,
                                        },
                                        {
                                            name: 'Recall',
                                            value: metrics.recall,
                                        },
                                        {
                                            name: 'F1',
                                            value: metrics.f1_score,
                                        },
                                        {
                                            name: 'AUC',
                                            value: metrics.roc_auc,
                                        },
                                    ]}
                                    layout="vertical"
                                    margin={{ left: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                                    <XAxis type="number" domain={[0, 1]} tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`} />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                                        {['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'].map(
                                            (color, i) => (
                                                <Cell key={i} fill={color} />
                                            ),
                                        )}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Segment Pie */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Users className="h-4 w-4" />
                            Customer Segments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {segments && (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={segments.clusters.map((c, i) => ({
                                            name: c.segment_name,
                                            value: c.count,
                                            fill: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                                        }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name.replace(/[^\w\s/]/g, '').trim()} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {segments.clusters.map((_, i) => (
                                            // eslint-disable-next-line @typescript-eslint/no-deprecated
                                            <Cell key={i} fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => value.toLocaleString()} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        {segments && (
                            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                {segments.clusters.map((c, i) => (
                                    <div key={c.segment_id} className="flex items-center gap-2">
                                        <span
                                            className="h-3 w-3 rounded-full"
                                            style={{
                                                backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                                            }}
                                        />
                                        <span className="text-muted-foreground">{c.segment_name.replace(/[^\w\s/]/g, '').trim()}</span>
                                        <span className="ml-auto font-medium">{c.count.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Model metadata */}
            {modelInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Model Metadata</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 text-sm sm:grid-cols-3">
                            <Meta label="Model" value={modelInfo.model_type} />
                            <Meta label="Version" value={modelInfo.version} />
                            <Meta label="Features" value={String(modelInfo.n_features)} />
                            <Meta label="CV F1" value={`${(modelInfo.cv_f1_mean * 100).toFixed(1)}% ± ${(modelInfo.cv_f1_std * 100).toFixed(1)}%`} />
                            <Meta label="KNN Hit Rate" value={`${(modelInfo.knn.hit_rate * 100).toFixed(1)}%`} />
                            <Meta label="Silhouette" value={modelInfo.segmentation.silhouette_score.toFixed(3)} />
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function KpiCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="flex items-start gap-4 pt-6">
                <div className="rounded-lg bg-muted p-2.5">{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value}</p>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function Meta({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <span className="text-muted-foreground">{label}: </span>
            <span className="font-medium">{value}</span>
        </div>
    );
}
