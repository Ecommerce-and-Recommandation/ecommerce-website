import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRecommendations } from '@/lib/hooks';
import { Loader2, Package, Search } from 'lucide-react';

export const Route = createFileRoute('/admin/model/recommendation')({
    component: RecommendationPage,
});

function RecommendationPage() {
    const [stockCode, setStockCode] = useState('');
    const [activeCode, setActiveCode] = useState('');

    const { data, isLoading, isError, error } = useRecommendations(activeCode, 10);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setActiveCode(stockCode.trim());
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Product Recommendations</h1>
                <p className="text-muted-foreground">Gợi ý sản phẩm tương tự dựa trên KNN Content-based Filtering</p>
            </div>

            {/* Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Tìm sản phẩm tương tự</CardTitle>
                    <CardDescription>Nhập StockCode (ví dụ: 85123A, 22423, 47566)</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Nhập StockCode..."
                                value={stockCode}
                                onChange={(e) => {
                                    setStockCode(e.target.value);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!stockCode.trim()}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Package className="h-4 w-4" />
                            Search
                        </button>
                    </form>

                    {/* Quick picks */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Thử nhanh:</span>
                        {['85123A', '22423', '47566', '84879', '21232'].map((code) => (
                            <button
                                key={code}
                                type="button"
                                onClick={() => {
                                    setStockCode(code);
                                    setActiveCode(code);
                                }}
                                className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            >
                                {code}
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {isLoading && (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            )}

            {isError && (
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="pt-6 text-sm text-destructive">
                        {error.message.includes('404') ? `Sản phẩm '${activeCode}' không tìm thấy trong database.` : `Lỗi: ${error.message}`}
                    </CardContent>
                </Card>
            )}

            {data && (
                <div className="space-y-4">
                    <h2 className="font-semibold">
                        Top {data.recommendations.length} sản phẩm tương tự với <span className="font-mono text-chart-1">{data.source_product}</span>
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {data.recommendations.map((item) => (
                            <Card key={item.stock_code} className="transition-shadow hover:shadow-md">
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium text-muted-foreground">#{item.rank}</p>
                                            <p className="mt-1 truncate font-mono text-sm font-bold">{item.stock_code}</p>
                                            {item.description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>}
                                        </div>
                                    </div>

                                    {/* Similarity bar */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Similarity</span>
                                            <span className="font-medium">{(item.similarity * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-chart-2 transition-all"
                                                style={{
                                                    width: `${String(item.similarity * 100)}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
