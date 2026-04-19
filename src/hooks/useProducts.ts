import { useQuery } from '@tanstack/react-query';
import { shopService } from '@/services/shopService';

export function useProducts(params: { category?: string; search?: string; page?: number; page_size?: number }) {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => shopService.products(params),
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: ['product', id],
        queryFn: () => shopService.product(id),
        enabled: !!id,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: shopService.categories,
    });
}
