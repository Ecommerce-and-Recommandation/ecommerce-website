import { Checkbox } from '@/components/ui/checkbox';
import { CartItem } from './cartItem';
import type { CartItemData } from '@/types/cartTypes';

interface CartGroupProps {
    dateStr: string;
    items: CartItemData[];
    selectedItemIds: Set<number>;
    onToggleSelection: (id: number) => void;
    onToggleGroup: (dateStr: string) => void;
    onQuantityChange: (item: CartItemData, delta: number) => void;
    onRemove: (item: CartItemData) => void;
}

export function CartGroup({ dateStr, items, selectedItemIds, onToggleSelection, onToggleGroup, onQuantityChange, onRemove }: CartGroupProps) {
    const allSelected = items.every((i) => selectedItemIds.has(i.id));

    function formatDate(str: string) {
        if (str === 'Earlier') return 'Earlier Items';
        const d = new Date(str);
        if (isNaN(d.getTime())) return str;
        return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    }

    return (
        <div className="space-y-3 animate-in fade-in duration-300">
            {/* Group Header */}
            <div className="flex items-center gap-3 border-b border-muted-foreground/10 pb-2 ml-1">
                <Checkbox
                    checked={allSelected}
                    onCheckedChange={() => {
                        onToggleGroup(dateStr);
                    }}
                />
                <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">{formatDate(dateStr)}</h2>
            </div>

            {/* Items in group */}
            <div className="space-y-3">
                {items.map((item) => (
                    <CartItem
                        key={item.id}
                        item={item}
                        isSelected={selectedItemIds.has(item.id)}
                        onToggle={onToggleSelection}
                        onQuantityChange={onQuantityChange}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
}
