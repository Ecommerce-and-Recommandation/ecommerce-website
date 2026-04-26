import type { ShopProduct } from '@/types/productTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing';
import { Link } from '@tanstack/react-router';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from '@tanstack/react-router';

interface ProductDetailsProps {
    product: ShopProduct;
}

export function ProductDetails({ product }: ProductDetailsProps) {
    const navigate = useNavigate();

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <Card className="overflow-hidden rounded-2xl border-none shadow-lg">
                <img src={product.image_url} alt={product.name} className="aspect-square w-full object-cover transition-all duration-500 hover:scale-105" />
            </Card>

            <div className="flex flex-col justify-center space-y-6">
                <div>
                    <Badge variant="secondary" className="mb-3 px-3 py-1 font-bold">
                        {product.category}
                    </Badge>
                    <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">{product.name}</h1>
                    <p className="mt-2 font-mono text-sm font-bold text-muted-foreground">CODE: {product.stock_code}</p>
                </div>

                <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>

                <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-primary">{formatCurrency(product.price)}</span>
                    <span className="text-sm font-bold text-muted-foreground">{product.purchase_count} sold</span>
                </div>

                {product.variants && product.variants.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                        <label className="text-sm font-bold text-muted-foreground">Product Options (Variants)</label>
                        <Select 
                            value={String(product.id)}
                            onValueChange={(val) => {
                                void navigate({ to: `/products/${val}` });
                            }}
                        >
                            <SelectTrigger className="w-full lg:w-[300px]">
                                <SelectValue placeholder="Select variant" />
                            </SelectTrigger>
                            <SelectContent>
                                {product.variants.map((v) => (
                                    <SelectItem key={v.id} value={String(v.id)}>
                                        {v.name} ({v.stock_code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        </div>
    );
}
