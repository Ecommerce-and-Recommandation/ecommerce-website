import { createFileRoute, Link } from '@tanstack/react-router';
import { useProduct, useAddToCart } from '@/lib/hooks';
import { useEffect, useRef } from 'react';
import { Loader2, ShoppingCart, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import { shopApi, type ShopRecommendation } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

function ProductDetailPage() {
    const { productId } = Route.useParams();
    const id = Number(productId);
    const { data: product, isLoading } = useProduct(id);
    const addToCart = useAddToCart();
    const viewStart = useRef(Date.now());

    // Fetch recommendations based on this product's stock_code via KNN
    const { data: recs } = useQuery({
        queryKey: ['productRecs', product?.stock_code],
        queryFn: () => shopApi.recommendations(),
        enabled: !!product?.stock_code,
    });

    // Track view duration on unmount
    useEffect(() => {
        viewStart.current = Date.now();
        return () => {
            const duration = (Date.now() - viewStart.current) / 1000;
            if (id && duration > 1) {
                tracker.trackView(id, Math.round(duration));
            }
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
        return <p className="py-20 text-center text-slate-400">Product not found.</p>;
    }

    return (
        <div className="space-y-10">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back to shop
            </Link>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Image */}
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="aspect-square w-full object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col justify-center space-y-6">
                    <div>
                        <span className="inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                            {product.category}
                        </span>
                        <h1 className="mt-3 text-3xl font-bold text-white">{product.name}</h1>
                        <p className="mt-2 text-sm text-slate-400">SKU: {product.stock_code}</p>
                    </div>

                    <p className="leading-relaxed text-slate-300">{product.description}</p>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-emerald-400">£{product.price.toFixed(2)}</span>
                        <span className="text-sm text-slate-500">{product.purchase_count} sold</span>
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

            {/* Similar Products */}
            {recs && recs.recommendations.length > 0 && (
                <section>
                    <div className="mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                        <h2 className="text-xl font-bold text-white">You May Also Like</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {recs.recommendations
                            .filter((r: ShopRecommendation) => r.id !== id && r.id > 0)
                            .slice(0, 5)
                            .map((r: ShopRecommendation) => (
                                <Link
                                    key={r.stock_code}
                                    to="/products/$productId"
                                    params={{ productId: String(r.id) }}
                                    onClick={() => tracker.trackClickRecommendation(r.id, 'detail_page')}
                                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition-all hover:border-emerald-500/50"
                                >
                                    <div className="aspect-square overflow-hidden bg-slate-800">
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
        </div>
    );
}

export const Route = createFileRoute('/products/$productId')({
    component: ProductDetailPage,
});
