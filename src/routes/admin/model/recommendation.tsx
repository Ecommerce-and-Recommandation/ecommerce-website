import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRecommendations } from '@/hooks/useMl';
import { Loader2, Package, Search, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function RecommendationPage() {
    const [stockCode, setStockCode] = useState('');
    const [activeCode, setActiveCode] = useState('');

    const { data, isLoading, isError, error } = useRecommendations(activeCode, 10);

    const handleSearch = (e: React.SyntheticEvent) => {
        e.preventDefault();
        setActiveCode(stockCode.trim());
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Product Similarity Engine</h1>
                <p className="text-muted-foreground font-medium">
                    Fine-tune product associations using K-Nearest Neighbors (KNN) content-based filtering.
                </p>
            </div>

            {/* Search */}
            <Card className="shadow-lg border-none overflow-hidden hover:shadow-xl transition-shadow">
                <CardHeader className="bg-primary/5">
                    <CardTitle className="text-lg font-bold">Discover Similar Products</CardTitle>
                    <CardDescription className="font-medium">
                        Enter a StockCode (e.g., 85123A, 22423, 47566) to query the similarity matrix.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search by StockCode..."
                                value={stockCode}
                                onChange={(e) => {
                                    setStockCode(e.target.value);
                                }}
                                className="pl-10 h-12 font-bold focus:ring-primary shadow-sm"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={!stockCode.trim() || isLoading}
                            className="h-12 px-8 font-extrabold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Package className="h-4 w-4 mr-2" />}
                            Query Model
                        </Button>
                    </form>

                    {/* Quick picks */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-extrabold uppercase text-muted-foreground/60">Sample Data:</span>
                        {['85123A', '22423', '47566', '84879', '21232'].map((code) => (
                            <Button
                                key={code}
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setStockCode(code);
                                    setActiveCode(code);
                                }}
                                className="rounded-xl font-bold bg-muted/80 hover:bg-primary/10 hover:text-primary border-none shadow-sm transition-all"
                            >
                                {code}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Results Mapping */}
            {isLoading && (
                <div className="flex h-64 flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                    <p className="text-xs font-bold text-muted-foreground uppercase animate-pulse">Computing vector distances...</p>
                </div>
            )}

            {isError && (
                <Card className="border-none shadow-lg bg-destructive/10 text-destructive animate-in slide-in-from-top-4">
                    <CardContent className="pt-6 font-bold flex items-center gap-3">
                        <Search className="h-5 w-5" />
                        {error.message.includes('404')
                            ? `StockCode '${activeCode}' not found in the trained feature set.`
                            : `System Error: ${error.message}`}
                    </CardContent>
                </Card>
            )}

            {data && (
                <div className="space-y-6 animate-in fade-in duration-700">
                    <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-extrabold">
                            Top {data.recommendations.length} Nearest Neighbors for{' '}
                            <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded tracking-tight">#{data.source_product}</span>
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.recommendations.map((item) => (
                            <Card
                                key={item.stock_code}
                                className="transition-all hover:shadow-xl hover:-translate-y-1 border-none shadow-md overflow-hidden group"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="min-w-0 flex-1">
                                            <Badge className="bg-muted text-muted-foreground hover:bg-muted font-black border-none mb-1">
                                                RANK #{item.rank}
                                            </Badge>
                                            <p className="font-mono font-black text-lg text-primary group-hover:text-primary/80 transition-colors uppercase tracking-tight">
                                                {item.stock_code}
                                            </p>
                                            {item.description && (
                                                <p className="mt-1 text-sm font-bold text-muted-foreground line-clamp-1 leading-tight">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Similarity bar */}
                                    <div className="space-y-2 pt-2 border-t">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-extrabold uppercase text-muted-foreground/80 tracking-widest">
                                                Similarity Score
                                            </span>
                                            <span className="font-black text-xs text-primary">{(item.similarity * 100).toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${String(item.similarity * 100)}%` }}
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

export const Route = createFileRoute('/admin/model/recommendation')({
    component: RecommendationPage,
});
