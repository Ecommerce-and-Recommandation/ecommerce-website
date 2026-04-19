import { createFileRoute, Link } from '@tanstack/react-router';
import { useProduct, useAddToCart, useShopRecommendations, useProducts } from '@/lib/hooks';
import { useEffect, useRef, useState } from 'react';
import { Loader2, ShoppingCart, ArrowLeft, CheckCircle, Sparkles, Tag } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { ShopRecommendation } from '@/lib/api';

function ProductDetailPage() {
    const { productId } = Route.useParams();
    const id = Number(productId);
    const { data: product, isLoading } = useProduct(id);
    const addToCart = useAddToCart();
    const viewStart = useRef(Date.now());

    // Same-category products
    const { data: categoryProducts } = useProducts({
        category: product?.category,
        page: 1,
        page_size: 11, // fetch 11, we'll filter out self
    });

    // Lazy load AI recommendations
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
        return () => observer.disconnect();
    }, []);

    const { data: recs, isLoading: recsLoading } = useShopRecommendations(recsVisible ? id : undefined);

    // Track view duration on unmount (tracker ignores <3s bounces)
    useEffect(() => {
        viewStart.current = Date.now();
        return () => {
            const duration = (Date.now() - viewStart.current) / 1000;
            tracker.trackView(id, duration);
        };
    }, [id]);

    function handleAddToCart() {
        if (!product) return;
        addToCart.mutate({ productId: product.id });
        tracker.trackAddToCart(product.id);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!product) {
        return <p className="py-20 text-center text-muted-foreground">Product not found.</p>;
    }

    const sameCategoryItems = categoryProducts?.products.filter((p) => p.id !== id).slice(0, 10) ?? [];

    return (
        <div className="space-y-12">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to shop
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Image */}
                <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                            {product.category}
                        </span>
                        <h1 className="mt-3 text-3xl font-bold">{product.name}</h1>
                        <p className="mt-2 text-sm text-muted-foreground">SKU: {product.stock_code}</p>
                    </div>

                    <p className="leading-relaxed text-muted-foreground">{product.description}</p>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-emerald-600">£{product.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">{product.purchase_count} sold</span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={addToCart.isPending || addToCart.isSuccess}
                        className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-70"
                    >
                        {addToCart.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : addToCart.isSuccess ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            <ShoppingCart className="h-5 w-5" />
                        )}
                        {addToCart.isSuccess ? 'Added to Cart!' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            {/* Same Category */}
            {sameCategoryItems.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-bold">More in {product.category}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {sameCategoryItems.map((p) => (
                            <Link
                                key={p.id}
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
                                    <div className="mt-auto flex items-center justify-between pt-2">
                                        <span className="text-base font-bold text-emerald-600">£{p.price.toFixed(2)}</span>
                                        <span className="text-[10px] text-muted-foreground">{p.purchase_count} sold</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* AI Recommendations (lazy loaded) */}
            <div ref={recsRef}>
                {recsVisible && recs && recs.recommendations.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            <h2 className="text-xl font-bold">You May Also Like</h2>
                            {recs.source === 'multi_knn' && (
                                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">AI Powered</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {recs.recommendations
                                .filter((r: ShopRecommendation) => r.id !== id && r.id > 0)
                                .map((r: ShopRecommendation) => (
                                    <Link
                                        key={r.stock_code}
                                        to="/products/$productId"
                                        params={{ productId: String(r.id) }}
                                        onClick={() => tracker.trackClickRecommendation(r.id, 'detail_page')}
                                        className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-muted">
                                            <img
                                                src={r.image_url}
                                                alt={r.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                            <span className="absolute left-2 top-2 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground backdrop-blur-sm">
                                                {r.category}
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-3">
                                            <h3 className="line-clamp-2 text-sm font-medium group-hover:text-emerald-600">{r.name}</h3>
                                            <div className="mt-auto flex items-center justify-between pt-2">
                                                <span className="text-base font-bold text-emerald-600">£{r.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </Link>
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

export const Route = createFileRoute('/products/$productId')({
    component: ProductDetailPage,
});
