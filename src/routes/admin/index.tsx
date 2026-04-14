import { createFileRoute } from '@tanstack/react-router';
import { useHealth, useModelInfo, useSegmentsOverview } from '@/lib/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Package, Users, Activity } from 'lucide-react';

function AdminDashboard() {
    const { data: health } = useHealth();
    const { data: modelInfo } = useModelInfo();
    const { data: segments } = useSegmentsOverview();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">ML Admin Dashboard</h1>
                <p className="text-muted-foreground">Model performance & customer analytics</p>
            </div>

            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                        <Activity className="h-8 w-8 text-emerald-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">API Status</p>
                            <p className="text-lg font-bold">{health?.models_loaded ? 'Online' : 'Offline'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                        <Brain className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Models Loaded</p>
                            <p className="text-lg font-bold">{health?.models.length ?? 0}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                        <Package className="h-8 w-8 text-amber-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Total Products</p>
                            <p className="text-lg font-bold">{modelInfo?.knn.total_products ?? '—'}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 pt-6">
                        <Users className="h-8 w-8 text-violet-500" />
                        <div>
                            <p className="text-sm text-muted-foreground">Customer Segments</p>
                            <p className="text-lg font-bold">{segments?.n_clusters ?? '—'}</p>
                        </div>
                    </CardContent>
                </Card>
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
