import { apiClient } from './apiClient';
import type { OrderData } from '@/types/orderTypes';

export const orderService = {
    getMyOrders: () => apiClient.get<OrderData[]>('/orders/me').then((r) => r.data),
    getAdminOrders: () => apiClient.get<OrderData[]>('/admin/orders').then((r) => r.data),
    updateOrderStatus: (id: number, status: string) =>
        apiClient.put<{ message: string }>(`/admin/orders/${id.toString()}/status`, { status }).then((r) => r.data),
};
