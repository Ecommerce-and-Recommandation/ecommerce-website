import type { ShopProduct } from '@/types/productTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductDetailsProps {
    product: ShopProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
    return (
        <div className="grid gap-8 md:grid-cols-2">
            {/* Image */}
            <Card className="overflow-hidden rounded-2xl border-none shadow-lg">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="aspect-square w-full object-cover transition-all hover:scale-105 duration-500"
                />
            </Card>

            {/* Info */}
            <div className="flex flex-col justify-center space-y-6">
                <div>
                    <Badge variant="secondary" className="mb-3 px-3 py-1 font-bold">
                        {product.category}
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{product.name}</h1>
                    <p className="mt-2 text-sm text-muted-foreground font-mono font-bold">CODE: {product.stock_code}</p>
                </div>

                <p className="leading-relaxed text-muted-foreground text-lg">{product.description}</p>

                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-primary">£{product.price.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground font-bold">{product.purchase_count} sold</span>
                </div>
            </div>
        </div>
    );
}
