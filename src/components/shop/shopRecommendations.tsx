import { Link } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/pricing';
import { tracker } from '@/lib/tracker';
import type { BehaviorRecommendationsResponse, ShopRecommendation } from '@/types/productTypes';

interface ShopRecommendationsProps {
    data?: BehaviorRecommendationsResponse;
    isLoading: boolean;
    isVisible: boolean;
}

export function ShopRecommendations({ data: recs, isLoading, isVisible }: ShopRecommendationsProps) {
    if (!isVisible) return null;

    return (
        <div>
            {recs && recs.recommendations.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-bold">{recs.source === 'multi_knn' ? 'Recommended for You' : 'Popular Products'}</h2>
                        {recs.source === 'multi_knn' && (
                            <Badge
                                variant="secondary"
                                className="bg-emerald-500/10 font-bold text-emerald-700 hover:bg-emerald-500/10 hover:text-emerald-700"
                            >
                                AI Powered
                            </Badge>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {recs.recommendations
                            .filter((r) => r.id > 0)
                            .map((r) => (
                                <RecommendationCard key={r.stock_code} rec={r} source={recs.source} />
                            ))}
                    </div>
                </section>
            )}
            {isLoading && (
                <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading recommendations...</span>
                </div>
            )}
        </div>
    );
}

function RecommendationCard({ rec: r, source }: { rec: ShopRecommendation; source: string }) {
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
                        <span className="text-base font-bold">{formatCurrency(r.price)}</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
