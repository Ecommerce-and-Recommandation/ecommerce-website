import { createFileRoute, useSearch } from '@tanstack/react-router';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useShopRecommendations } from '@/hooks/useMl';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryFilters } from '@/components/shop/categoryFilters';
import { ProductCard } from '@/components/shop/productCard';
import { ShopRecommendations } from '@/components/shop/shopRecommendations';

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

    const { data: recs, isLoading: recsLoading } = useShopRecommendations(recsVisible ? undefined : -1);

    const totalPages = productData ? Math.ceil(productData.total / productData.page_size) : 1;

    return (
        <div className="space-y-10">
            <CategoryFilters
                categories={categories}
                activeCategory={category}
                onCategoryChange={(c) => {
                    setCategory(c);
                    setPage(1);
                }}
            />

            {/* Product Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={`idx-skeleton-${String(i)}`} className="space-y-3">
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

            {/* AI Recommendations Section */}
            <div ref={recsRef}>
                <ShopRecommendations data={recs} isLoading={recsLoading} isVisible={recsVisible} />
            </div>
        </div>
    );
}

export const Route = createFileRoute('/')({
    component: ShopHomePage,
    validateSearch: (search: Record<string, unknown>): SearchParams => ({
        search: typeof search.search === 'string' ? search.search : undefined,
    }),
});
