import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { shopService } from '@/services/shopService';
import { apiClient } from '@/services/apiClient';
import type { ShopProduct, ProductListResponse } from '@/types/productTypes';

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

// Admin product hooks
export function useAdminProducts(params: { category?: string; search?: string; page?: number; page_size?: number }) {
    return useQuery({
        queryKey: queryKeys.adminProducts(params),
        queryFn: () => apiClient.get<ProductListResponse>('/admin/products', { params }).then((r) => r.data),
        placeholderData: (prev) => prev,
    });
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<ShopProduct>) => apiClient.post<ShopProduct>('/admin/products', data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
    });
}

export function useUpdateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<ShopProduct> }) =>
            apiClient.put<ShopProduct>(`/admin/products/${id.toString()}`, data).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiClient.delete(`/admin/products/${id.toString()}`).then((r) => r.data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
    });
}
