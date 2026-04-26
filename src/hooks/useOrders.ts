import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { orderService } from '@/services/orderService';

export function useMyOrders() {
    return useQuery({
        queryKey: queryKeys.myOrders,
        queryFn: orderService.getMyOrders,
    });
}

export function useAdminOrders(page = 1, pageSize = 20) {
    return useQuery({
        queryKey: queryKeys.adminOrders(page),
        queryFn: () => orderService.getAdminOrders(page, pageSize),
        placeholderData: (prev) => prev,
    });
}

export function useUpdateOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => orderService.updateOrderStatus(id, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] }),
    });
}
