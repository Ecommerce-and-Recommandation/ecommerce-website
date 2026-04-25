import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { orderService } from '@/services/orderService';

export function useMyOrders() {
    return useQuery({
        queryKey: queryKeys.myOrders,
        queryFn: orderService.getMyOrders,
    });
}

export function useAdminOrders() {
    return useQuery({
        queryKey: queryKeys.adminOrders,
        queryFn: orderService.getAdminOrders,
        refetchInterval: 15_000,
    });
}

export function useUpdateOrderStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) => orderService.updateOrderStatus(id, status),
        onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.adminOrders }),
    });
}
