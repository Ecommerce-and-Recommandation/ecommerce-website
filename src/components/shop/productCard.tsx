import { Link } from '@tanstack/react-router';
import type { ShopProduct } from '@/types/productTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
    product: ShopProduct;
}

export function ProductCard({ product: p }: ProductCardProps) {
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
                    <div className="mt-1.5">
                        <Badge variant="secondary" className="text-[10px] font-medium">
                            {p.category}
                        </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-base font-bold">£{p.price.toFixed(2)}</span>
                        <span className="text-[10px] text-muted-foreground">{p.purchase_count} sold</span>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
