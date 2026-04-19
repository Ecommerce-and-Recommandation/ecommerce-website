import { Badge } from '@/components/ui/badge';
import type { CategoryInfo } from '@/types/productTypes';

interface CategoryFiltersProps {
    categories?: CategoryInfo[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryFilters({ categories, activeCategory, onCategoryChange }: CategoryFiltersProps) {
    return (
        <div className="flex flex-wrap gap-2">
            <Badge
                variant={!activeCategory ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-1.5 text-xs font-semibold"
                onClick={() => {
                    onCategoryChange('');
                }}
            >
                All
            </Badge>
            {categories?.map((c) => (
                <Badge
                    key={c.name}
                    variant={activeCategory === c.name ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-1.5 text-xs font-semibold"
                    onClick={() => {
                        onCategoryChange(c.name);
                    }}
                >
                    {c.name} ({c.count})
                </Badge>
            ))}
        </div>
    );
}
