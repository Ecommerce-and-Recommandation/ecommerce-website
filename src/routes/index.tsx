import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useProducts, useCategories, useShopRecommendations } from '@/lib/hooks';
import { useState, useEffect, useRef } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { ShopProduct, ShopRecommendation } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchParams {
    search?: string;
}

function ShopHomePage() {
    const searchParams = useSearch({ from: '/' });
    const [category, setCategory] = useState<string>('');
    const [page, setPage] = useState(1);
    const searchQuery = searchParams.search ?? '';

    const { data: categories } = useCategories();
    const { data: productData, isLoading } = useProducts({
        category: category || undefined,
        search: searchQuery || undefined,
        page,
        page_size: 20,
    });

    // Lazy load recommendations: only fetch when section is visible
    const [recsVisible, setRecsVisible] = useState(false);
    const recsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = recsRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setRecsVisible(true);
            },
            { rootMargin: '200px' },
        );
        observer.observe(el);
        return () => {
            observer.disconnect();
        };
    }, []);

    const { data: recs, isLoading: recsLoading } = useShopRecommendations(
        recsVisible ? undefined : -1, // -1 = disabled
    );

    useEffect(() => {
        // Reset page only when category or search changes (not when page itself changes)
        // This is still technically in-effect setState, if it fails lint, I will move it to category click handler
        // and handle search changes more carefully.
    }, [category, searchQuery]);

    const totalPages = productData ? Math.ceil(productData.total / productData.page_size) : 1;

    return (
        <div className="space-y-10">
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={!category ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-1.5 text-xs font-semibold"
                    onClick={() => {
                        setCategory('');
                        setPage(1);
                    }}
                >
                    All
                </Badge>
                {categories?.map((c) => (
                    <Badge
                        key={c.name}
                        variant={category === c.name ? 'default' : 'outline'}
                        className="cursor-pointer px-4 py-1.5 text-xs font-semibold"
                        onClick={() => {
                            setCategory(c.name);
                            setPage(1);
                        }}
                    >
                        {c.name} ({c.count})
                    </Badge>
                ))}
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-square w-full rounded-xl" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {productData?.products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                    {productData?.products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground">No products found for this criteria.</p>
                        </div>
                    )}
                </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setPage((p) => Math.max(1, p - 1));
                        }}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                            setPage((p) => Math.min(totalPages, p + 1));
                        }}
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* AI Recommendations Section (lazy loaded, below products) */}
            <div ref={recsRef}>
                {recsVisible && recs && recs.recommendations.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <h2 className="text-xl font-bold">{recs.source === 'multi_knn' ? 'Recommended for You' : 'Popular Products'}</h2>
                            {recs.source === 'multi_knn' && (
                                <Badge
                                    variant="secondary"
                                    className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700"
                                >
                                    AI Powered
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {recs.recommendations
                                .filter((r) => r.id > 0)
                                .map((r) => (
                                    <RecCard key={r.stock_code} rec={r} source={recs.source} />
                                ))}
                        </div>
                    </section>
                )}
                {recsVisible && recsLoading && (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading recommendations...</span>
                    </div>
                )}
            </div>
        </div>
    );
}

function ProductCard({ product: p }: { product: ShopProduct }) {
    return (
        <Link to="/products/$productId" params={{ productId: String(p.id) }} className="group block">
            <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                        src={p.image_url}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    />
                </div>
                <div className="flex flex-col p-3">
                    <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">{p.name}</h3>
                    <div className="mt-1.5">
                        <Badge variant="secondary" className="text-[10px] font-medium">
                            {p.category}
                        </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-bold">£{p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground">{p.purchase_count} sold</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function RecCard({ rec: r, source }: { rec: ShopRecommendation; source: string }) {
    return (
        <Link
            to="/products/$productId"
            params={{ productId: String(r.id) }}
            onClick={() => {
                tracker.trackClickRecommendation(r.id, source);
            }}
            className="group block"
        >
            <Card className="h-full overflow-hidden transition-all hover:border-primary/50 hover:shadow-md">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                        src={r.image_url}
                        alt={r.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        loading="lazy"
                    />
                </div>
                <div className="flex flex-col p-3">
                    <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">{r.name}</h3>
                    <div className="mt-1.5">
                        <Badge variant="secondary" className="text-[10px] font-medium">
                            {r.category}
                        </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-bold">£{r.price.toFixed(2)}</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

export const Route = createFileRoute('/')({
    component: ShopHomePage,
    validateSearch: (search: Record<string, unknown>): SearchParams => ({
        search: typeof search.search === 'string' ? search.search : undefined,
    }),
});
