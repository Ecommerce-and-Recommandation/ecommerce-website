import { createFileRoute } from '@tanstack/react-router';
import { useHealth, useModelInfo, useSegmentsOverview } from '@/hooks/useMl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Package, Users, Activity, PieChart, TrendingUp } from 'lucide-react';

function AdminDashboard() {
    const { data: health } = useHealth();
    const { data: modelInfo } = useModelInfo();
    const { data: segments } = useSegmentsOverview();

    const stats = [
        {
            label: 'API Status',
            value: health?.models_loaded ? 'Online' : 'Offline',
            icon: Activity,
            color: health?.models_loaded ? 'text-emerald-500' : 'text-destructive',
        },
        {
            label: 'Models Loaded',
            value: health?.models.length ?? 0,
            icon: Brain,
            color: 'text-blue-500',
        },
        {
            label: 'Total Products (KNN)',
            value: modelInfo?.knn.total_products ?? '—',
            icon: Package,
            color: 'text-amber-500',
        },
        {
            label: 'Customer Segments',
            value: segments?.n_clusters ?? '—',
            icon: Users,
            color: 'text-teal-500',
        },
    ];

    // Color palette for segments
    const segmentColors = [
        'bg-blue-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-rose-500',
        'bg-violet-500',
        'bg-cyan-500',
        'bg-orange-500',
        'bg-indigo-500',
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ML Admin Dashboard</h1>
                <p className="text-muted-foreground">Model performance & customer analytics</p>
            </div>

            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="flex items-center gap-3 pt-6">
                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-lg font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Model Metrics */}
            {modelInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BarChart3 className="h-5 w-5" /> Model Performance (Random Forest)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-5">
                            {Object.entries(modelInfo.metrics).map(([key, val]) => (
                                <div key={key} className="text-center">
                                    <p className="text-2xl font-bold">{((val as number) * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground capitalize">{key.replace('_', ' ')}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
                            <span>
                                <strong>CV F1:</strong> {(modelInfo.cv_f1_mean * 100).toFixed(1)}% ± {(modelInfo.cv_f1_std * 100).toFixed(1)}%
                            </span>
                            <span>
                                <strong>KNN Hit Rate:</strong> {(modelInfo.knn.hit_rate * 100).toFixed(1)}%
                            </span>
                            <span>
                                <strong>Silhouette:</strong> {modelInfo.segmentation.silhouette_score.toFixed(3)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Customer Segmentation Visualization */}
            {segments && (
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <PieChart className="h-5 w-5" /> Customer Segments (K-Means + PCA)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {segments.clusters.map((cluster, idx) => (
                                    <div key={cluster.segment_id}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium flex items-center gap-2">
                                                <span className={`inline-block w-3 h-3 rounded-full ${segmentColors[idx % segmentColors.length]}`} />
                                                {cluster.segment_name}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {cluster.count.toLocaleString()} ({cluster.percentage}%)
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${segmentColors[idx % segmentColors.length]}`}
                                                style={{ width: `${cluster.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-5 w-5" /> Segmentation Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-3xl font-bold">{segments.total_customers.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Total Customers</p>
                                </div>
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-3xl font-bold">{segments.n_clusters}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Clusters (K)</p>
                                </div>
                            </div>
                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                <p className="text-3xl font-bold">{segments.silhouette_score.toFixed(3)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Silhouette Score</p>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                                Silhouette Score đo mức độ tách biệt rõ ràng giữa các nhóm khách hàng. Giá trị càng gần 1 thì phân cụm càng tốt.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard,
});
