import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { Loader2, Package, CheckCircle2, Clock } from 'lucide-react';

function OrdersPage() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => ordersApi.getMyOrders(),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Package className="h-10 w-10 text-muted-foreground" />
                </div>
                <h1 className="mt-6 text-2xl font-bold">No orders yet</h1>
                <p className="mt-2 text-muted-foreground">It looks like you haven't placed any orders.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <p className="mt-2 text-muted-foreground">Review and track your past purchases here.</p>
            </div>

            <div className="grid gap-6">
                {orders.map((order) => (
                    <div key={order.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Order ID</p>
                                <p className="font-semibold">#{order.id}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date Placed</p>
                                <p className="font-semibold">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="font-bold text-emerald-600">£{order.total_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <div className="flex items-center gap-1.5 font-semibold">
                                    {order.status === 'COMPLETED' || order.status === 'DELIVERED' ? (
                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-amber-500" />
                                    )}
                                    <span className={order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'text-emerald-500' : 'text-amber-500'}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="divide-y p-6">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg border bg-muted">
                                        <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-foreground">{item.product_name}</h3>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">£{(item.price_at_time * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        
                        {order.discount_amount > 0 && (
                            <div className="bg-emerald-50/50 border-t px-6 py-4 flex justify-between items-center text-sm">
                                <span className="font-medium text-emerald-700">Promotion Applied</span>
                                <span className="font-bold text-emerald-600">-£{order.discount_amount.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export const Route = createFileRoute('/orders')({
    component: OrdersPage,
});
