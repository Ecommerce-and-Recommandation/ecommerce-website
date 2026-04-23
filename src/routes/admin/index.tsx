import { createFileRoute } from '@tanstack/react-router';
import { useHealth, useModelInfo, useSegmentsOverview } from '@/hooks/useMl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Package, Users, Activity } from 'lucide-react';

function AdminDashboard() {
    const { data: health } = useHealth();
    const { data: modelInfo } = useModelInfo();
    const { data: segments } = useSegmentsOverview();

    const stats = [
        {
            label: 'API Status',
            value: health?.models_loaded ? 'Online' : 'Offline',
            icon: Activity,
            color: 'text-primary',
        },
        {
            label: 'Models Loaded',
            value: health?.models.length ?? 0,
            icon: Brain,
            color: 'text-primary/80',
        },
        {
            label: 'Total Products',
            value: modelInfo?.knn.total_products ?? '—',
            icon: Package,
            color: 'text-primary/60',
        },
        {
            label: 'Customer Segments',
            value: segments?.n_clusters ?? '—',
            icon: Users,
            color: 'text-primary/40',
        },
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
                            <BarChart3 className="h-5 w-5" /> Model Performance
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export const Route = createFileRoute('/admin/')({
    component: AdminDashboard,
});
