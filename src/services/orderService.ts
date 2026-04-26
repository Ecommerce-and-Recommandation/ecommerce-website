import { apiClient } from './apiClient';
import type { OrderData } from '@/types/orderTypes';

export interface PaginatedOrders {
    orders: OrderData[];
    total: number;
    page: number;
    page_size: number;
}

export const orderService = {
    getMyOrders: () => apiClient.get<OrderData[]>('/orders/me').then((r) => r.data),
    getAdminOrders: (page = 1, pageSize = 20) =>
        apiClient.get<PaginatedOrders>('/admin/orders', { params: { page, page_size: pageSize } }).then((r) => r.data),
    updateOrderStatus: (id: number, status: string) =>
        apiClient.put<{ message: string }>(`/admin/orders/${id.toString()}/status`, { status }).then((r) => r.data),
};
