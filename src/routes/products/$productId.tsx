import { createFileRoute, Link } from '@tanstack/react-router';
import { useProduct, useAddToCart, useShopRecommendations, useProducts } from '@/lib/hooks';
import { useEffect, useRef, useState } from 'react';
import { Loader2, ShoppingCart, ArrowLeft, CheckCircle, Sparkles, Tag, Plus, Minus } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { ShopRecommendation } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

function ProductDetailPage() {
    const { productId } = Route.useParams();
    const id = Number(productId);
    const { data: product, isLoading } = useProduct(id);
    const addToCart = useAddToCart();
    const viewStart = useRef<number>(0);
    const [quantity, setQuantity] = useState(1);

    // Provide brief success feedback then allow adding again
    const [justAdded, setJustAdded] = useState(false);

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
        return () => {
            observer.disconnect();
        };
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
        if (!product || quantity < 1) return;
        addToCart.mutate({ productId: product.id, quantity });
        tracker.trackAddToCart(product.id);

        // Visual feedback
        setJustAdded(true);
        setTimeout(() => {
            setJustAdded(false);
        }, 2000);
    }

    if (isLoading) {
        return (
            <div className="space-y-12">
                <Skeleton className="h-5 w-24" />
                <div className="grid gap-8 md:grid-cols-2">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-10 w-2/3" />
                        </div>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return <p className="py-20 text-center text-muted-foreground">Product not found.</p>;
    }

    const sameCategoryItems = categoryProducts?.products.filter((p) => p.id !== id).slice(0, 10) ?? [];

    return (
        <div className="space-y-12">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
                <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to shop
                </Link>
            </Button>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Image */}
                <Card className="overflow-hidden rounded-2xl border-none shadow-md">
                    <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover" />
                </Card>

                {/* Info */}
                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <Badge variant="secondary" className="mb-3">
                            {product.category}
                        </Badge>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="mt-2 text-sm text-muted-foreground font-mono">CODE: {product.stock_code}</p>
                    </div>

                    <p className="leading-relaxed text-muted-foreground">{product.description}</p>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">£{product.price.toFixed(2)}</span>
                        <span className="text-sm text-muted-foreground">{product.purchase_count} sold</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-1.5 h-14">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setQuantity((q) => Math.max(1, q - 1));
                                }}
                                disabled={quantity <= 1 || addToCart.isPending}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center text-lg font-bold">{quantity}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    setQuantity((q) => q + 1);
                                }}
                                disabled={addToCart.isPending}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                            size="lg"
                            className="flex-1 h-14 text-lg font-bold shadow-xl shadow-primary/10"
                            onClick={handleAddToCart}
                            disabled={addToCart.isPending || justAdded}
                        >
                            {addToCart.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : justAdded ? (
                                <CheckCircle className="h-5 w-5 mr-2" />
                            ) : (
                                <ShoppingCart className="h-5 w-5 mr-2" />
                            )}
                            {justAdded ? 'Added to Cart!' : 'Add to Cart'}
                        </Button>
                    </div>
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
                            <Link key={p.id} to="/products/$productId" params={{ productId: String(p.id) }} className="group block">
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
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-base font-bold">£{p.price.toFixed(2)}</span>
                                            <span className="text-[10px] text-muted-foreground">{p.purchase_count} sold</span>
                                        </div>
                                    </div>
                                </Card>
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
                                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700">
                                    AI Powered
                                </Badge>
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
                                        onClick={() => {
                                            tracker.trackClickRecommendation(r.id, 'detail_page');
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
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm text-[10px] font-medium"
                                                >
                                                    {r.category}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-col p-3">
                                                <h3 className="line-clamp-2 text-sm font-medium group-hover:text-primary">{r.name}</h3>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-base font-bold">£{r.price.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                    </section>
                )}
                {recsVisible && recsLoading && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="aspect-square w-full rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export const Route = createFileRoute('/products/$productId')({
    component: ProductDetailPage,
});
