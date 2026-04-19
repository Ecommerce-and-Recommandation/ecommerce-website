import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useProducts, useCategories, useShopRecommendations } from '@/lib/hooks';
import { useState, useEffect, useRef } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { ShopProduct, ShopRecommendation } from '@/lib/api';

interface SearchParams {
    search?: string;
}

function ShopHomePage() {
    const searchParams = useSearch({ from: '/' }) as SearchParams;
    const [category, setCategory] = useState<string>('');
    const [page, setPage] = useState(1);
    const searchQuery = searchParams.search || '';

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
            ([entry]) => { if (entry.isIntersecting) setRecsVisible(true); },
            { rootMargin: '200px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { data: recs, isLoading: recsLoading } = useShopRecommendations(
        recsVisible ? undefined : -1, // -1 = disabled
    );

    useEffect(() => { setPage(1); }, [category, searchQuery]);

    const totalPages = productData ? Math.ceil(productData.total / productData.page_size) : 1;

    return (
        <div className="space-y-10">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setCategory('')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        !category ? 'bg-emerald-500 text-white' : 'border text-muted-foreground hover:border-emerald-500 hover:text-foreground'
                    }`}
                >
                    All
                </button>
                {categories?.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => setCategory(c.name)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            category === c.name ? 'bg-emerald-500 text-white' : 'border text-muted-foreground hover:border-emerald-500 hover:text-foreground'
                        }`}
                    >
                        {c.name} ({c.count})
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {productData?.products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                    {productData?.products.length === 0 && (
                        <p className="py-20 text-center text-muted-foreground">No products found.</p>
                    )}
                </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border p-2 transition-colors hover:border-emerald-500 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-lg border p-2 transition-colors hover:border-emerald-500 disabled:opacity-30"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* AI Recommendations Section (lazy loaded, below products) */}
            <div ref={recsRef}>
                {recsVisible && recs && recs.recommendations.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <h2 className="text-xl font-bold">
                                {recs.source === 'multi_knn' ? 'Recommended for You' : 'Popular Products'}
                            </h2>
                            {recs.source === 'multi_knn' && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                    AI Powered
                                </span>
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
        <Link
            to="/products/$productId"
            params={{ productId: String(p.id) }}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md"
        >
            <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                />
            </div>
            <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-medium group-hover:text-emerald-600">{p.name}</h3>
                <span className="mt-1.5 w-fit rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                    {p.category}
                </span>
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-emerald-600">£{p.price.toFixed(2)}</span>
                    <span className="text-[10px] text-muted-foreground">{p.purchase_count} sold</span>
                </div>
            </div>
        </Link>
    );
}

function RecCard({ rec: r, source }: { rec: ShopRecommendation; source: string }) {
    return (
        <Link
            to="/products/$productId"
            params={{ productId: String(r.id) }}
            onClick={() => tracker.trackClickRecommendation(r.id, source)}
            className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md"
        >
            <div className="relative aspect-square overflow-hidden bg-muted">
                <img
                    src={r.image_url}
                    alt={r.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                />
            </div>
            <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-medium group-hover:text-emerald-600">{r.name}</h3>
                <span className="mt-1.5 w-fit rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                    {r.category}
                </span>
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-emerald-600">£{r.price.toFixed(2)}</span>
                </div>
            </div>
        </Link>
    );
}

export const Route = createFileRoute('/')(
    {
        component: ShopHomePage,
        validateSearch: (search: Record<string, unknown>): SearchParams => ({
            search: typeof search.search === 'string' ? search.search : undefined,
        }),
    },
);
