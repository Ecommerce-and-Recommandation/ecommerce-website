import { Link } from '@tanstack/react-router';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { CartItemData } from '@/types/cartTypes';

interface CartItemProps {
    item: CartItemData;
    isSelected: boolean;
    onToggle: (id: number) => void;
    onQuantityChange: (item: CartItemData, delta: number) => void;
    onRemove: (item: CartItemData) => void;
}

export function CartItem({ item, isSelected, onToggle, onQuantityChange, onRemove }: CartItemProps) {
    return (
        <div className="flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {
                        onToggle(item.id);
                    }}
                />
            </div>

            <Link to="/products/$productId" params={{ productId: String(item.product_id) }}>
                <img src={item.product_image} alt={item.product_name} className="h-24 w-24 rounded-lg object-cover" />
            </Link>

            <div className="flex flex-1 flex-col justify-between">
                <div>
                    <Link
                        to="/products/$productId"
                        params={{ productId: String(item.product_id) }}
                        className="font-medium hover:text-primary transition-colors"
                    >
                        {item.product_name}
                    </Link>
                    <p className="text-xs text-muted-foreground">SKU: {item.stock_code}</p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                onQuantityChange(item, -1);
                            }}
                        >
                            <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                onQuantityChange(item, 1);
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="font-bold text-base">£{(item.product_price * item.quantity).toFixed(2)}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => {
                                onRemove(item);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
