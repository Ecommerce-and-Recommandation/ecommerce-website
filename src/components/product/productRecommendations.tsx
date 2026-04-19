import { Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Sparkles, Loader2 } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import type { ShopProduct, BehaviorRecommendationsResponse, ShopRecommendation } from '@/types/productTypes';

interface ProductRecommendationsProps {
    category: string;
    categoryProducts: ShopProduct[];
    recsData?: BehaviorRecommendationsResponse;
    recsLoading: boolean;
    recsVisible: boolean;
    currentProductId: number;
}

export function ProductRecommendations({
    category,
    categoryProducts,
    recsData,
    recsLoading,
    recsVisible,
    currentProductId,
}: ProductRecommendationsProps) {
    return (
        <div className="space-y-12">
            {/* Same Category */}
            {categoryProducts.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Tag className="h-5 w-5 text-blue-500" />
                        <h2 className="text-xl font-extrabold">More in {category}</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {categoryProducts.map((p) => (
                            <RecommendationCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            )}

            {/* AI Recommendations */}
            {recsVisible && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-extrabold">You May Also Like</h2>
                        {recsData?.source === 'multi_knn' && (
                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 font-bold">
                                AI Powered
                            </Badge>
                        )}
                    </div>

                    {recsLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {recsData?.recommendations
                                .filter((r) => r.id !== currentProductId && r.id > 0)
                                .map((r) => (
                                    <AIRecommendationCard key={r.stock_code} rec={r} />
                                ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}

function RecommendationCard({ product: p }: { product: ShopProduct }) {
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
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-bold">£{p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{p.purchase_count} sold</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

function AIRecommendationCard({ rec: r }: { rec: ShopRecommendation }) {
    return (
        <Link
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
                    <Badge variant="secondary" className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm text-[10px] font-bold">
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
    );
}
