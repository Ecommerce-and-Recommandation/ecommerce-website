import { Button } from '@/components/ui/button';
import { Minus, Plus, ShoppingCart, Loader2, CheckCircle } from 'lucide-react';

interface ProductActionsProps {
    quantity: number;
    setQuantity: (q: number | ((q: number) => number)) => void;
    onAddToCart: () => void;
    isPending: boolean;
    justAdded: boolean;
}

export function ProductActions({ quantity, setQuantity, onAddToCart, isPending, justAdded }: ProductActionsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            {/* Quantity Selector */}
            <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-1.5 h-14 shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setQuantity((q) => Math.max(1, q - 1));
                    }}
                    disabled={quantity <= 1 || isPending}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-extrabold">{quantity}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        setQuantity((q) => q + 1);
                    }}
                    disabled={isPending}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Add to Cart Button */}
            <Button
                size="lg"
                className="flex-1 h-14 text-lg font-extrabold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                onClick={onAddToCart}
                disabled={isPending || justAdded}
            >
                {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : justAdded ? (
                    <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                    <ShoppingCart className="h-5 w-5 mr-2" />
                )}
                {justAdded ? 'Added to Cart!' : 'Add to Cart'}
            </Button>
        </div>
    );
}
