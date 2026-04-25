import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { shopService } from '@/services/shopService';

export function useProducts(params: { category?: string; search?: string; page?: number; page_size?: number }) {
    return useQuery({
        queryKey: queryKeys.products(params),
        queryFn: () => shopService.products(params),
    });
}

export function useProduct(id: number) {
    return useQuery({
        queryKey: queryKeys.product(id),
        queryFn: () => shopService.product(id),
        enabled: !!id,
    });
}

export function useCategories() {
    return useQuery({
        queryKey: queryKeys.categories,
        queryFn: shopService.categories,
    });
}
