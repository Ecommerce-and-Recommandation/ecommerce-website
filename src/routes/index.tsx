import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { useProducts, useCategories, useShopRecommendations } from '@/lib/hooks';
import { useState, useEffect } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { ShopProduct } from '@/lib/api';

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
    const { data: recs } = useShopRecommendations();

    useEffect(() => { setPage(1); }, [category, searchQuery]);

    const totalPages = productData ? Math.ceil(productData.total / productData.page_size) : 1;

    return (
        <div className="space-y-8">
            {/* Recommendations Section */}
            {recs && recs.recommendations.length > 0 && (
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                        <h2 className="text-xl font-bold text-white">
                            {recs.source === 'knn' ? 'Recommended for You' : 'Popular Products'}
                        </h2>
                        {recs.source === 'knn' && (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                                AI Powered
                            </span>
                        )}
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {recs.recommendations.slice(0, 6).map((r) => (
                            <Link
                                key={r.stock_code}
                                to="/products/$productId"
                                params={{ productId: String(r.id) }}
                                onClick={() => tracker.trackClickRecommendation(r.id, recs.source)}
                                className="group flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
                            >
                                <div className="relative h-36 overflow-hidden bg-slate-800">
                                    <img
                                        src={r.image_url}
                                        alt={r.name}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="line-clamp-2 text-xs font-medium text-slate-300">{r.name}</p>
                                    <p className="mt-1 text-sm font-bold text-emerald-400">£{r.price.toFixed(2)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setCategory('')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                        !category ? 'bg-emerald-500 text-white' : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                    }`}
                >
                    All
                </button>
                {categories?.map((c) => (
                    <button
                        key={c.name}
                        onClick={() => setCategory(c.name)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            category === c.name ? 'bg-emerald-500 text-white' : 'border border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
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
                        <p className="py-20 text-center text-slate-500">No products found.</p>
                    )}
                </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="rounded-lg border border-slate-700 p-2 transition-colors hover:border-slate-500 disabled:opacity-30"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-sm text-slate-400">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="rounded-lg border border-slate-700 p-2 transition-colors hover:border-slate-500 disabled:opacity-30"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

function ProductCard({ product: p }: { product: ShopProduct }) {
    return (
        <Link
            to="/products/$productId"
            params={{ productId: String(p.id) }}
            className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
        >
            <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                />
                <span className="absolute left-2 top-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-[10px] font-medium text-slate-300 backdrop-blur-sm">
                    {p.category}
                </span>
            </div>
            <div className="flex flex-1 flex-col p-3">
                <h3 className="line-clamp-2 text-sm font-medium text-slate-200 group-hover:text-white">{p.name}</h3>
                <div className="mt-auto flex items-center justify-between pt-2">
                    <span className="text-base font-bold text-emerald-400">£{p.price.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500">{p.purchase_count} sold</span>
                </div>
            </div>
        </Link>
    );
}

export const Route = createFileRoute('/')({
    component: ShopHomePage,
    validateSearch: (search: Record<string, unknown>): SearchParams => ({
        search: typeof search.search === 'string' ? search.search : undefined,
    }),
});
