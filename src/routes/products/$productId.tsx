import { createFileRoute, Link } from '@tanstack/react-router';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useShopRecommendations } from '@/hooks/useMl';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { tracker } from '@/lib/tracker';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductDetails } from '@/components/product/productDetails';
import { ProductActions } from '@/components/product/productActions';
import { ProductRecommendations } from '@/components/product/productRecommendations';

function ProductDetailPage() {
    const { productId } = Route.useParams();
    const id = Number(productId);
    const { data: product, isLoading } = useProduct(id);
    const addToCart = useAddToCart();
    const viewStart = useRef<number>(0);
    const [quantity, setQuantity] = useState(1);
    const [justAdded, setJustAdded] = useState(false);

    const { data: categoryProducts } = useProducts({
        category: product?.category,
        page: 1,
        page_size: 11,
    });

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

    useEffect(() => {
        viewStart.current = Date.now();
        return () => {
            const duration = (Date.now() - viewStart.current) / 1000;
            tracker.trackView(id, duration);
        };
    }, [id]);

    const handleAddToCart = () => {
        if (!product || quantity < 1) return;
        addToCart.mutate({ productId: product.id, quantity });
        tracker.trackAddToCart(product.id);
        setJustAdded(true);
        setTimeout(() => {
            setJustAdded(false);
        }, 2000);
    };

    if (isLoading)
        return (
            <div className="space-y-12 animate-in fade-in duration-500">
                <Skeleton className="h-5 w-24" />
                <div className="grid gap-8 md:grid-cols-2">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-10 w-2/3" />
                        </div>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-14 w-full" />
                    </div>
                </div>
            </div>
        );

    if (!product) return <p className="py-20 text-center text-muted-foreground font-bold">Product not found.</p>;

    const sameCategoryItems = categoryProducts?.products.filter((p) => p.id !== id).slice(0, 10) ?? [];

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-primary font-bold">
                <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to shop
                </Link>
            </Button>

            <div className="space-y-8">
                <ProductDetails product={product} />
                <ProductActions
                    quantity={quantity}
                    setQuantity={setQuantity}
                    onAddToCart={handleAddToCart}
                    isPending={addToCart.isPending}
                    justAdded={justAdded}
                />
            </div>

            <div ref={recsRef}>
                <ProductRecommendations
                    category={product.category}
                    categoryProducts={sameCategoryItems}
                    recsData={recs}
                    recsLoading={recsLoading}
                    recsVisible={recsVisible}
                    currentProductId={id}
                />
            </div>
        </div>
    );
}

export const Route = createFileRoute('/products/$productId')({
    component: ProductDetailPage,
});
