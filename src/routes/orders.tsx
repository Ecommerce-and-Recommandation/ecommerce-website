import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { Loader2, Package, CheckCircle2, Clock, Calendar, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

function OrdersPage() {
    const { data: orders, isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: () => ordersApi.getMyOrders(),
    });

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <Skeleton className="h-16 w-full" />
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
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
                    <Card key={order.id} className="overflow-hidden shadow-md">
                        <div className="border-b bg-muted/30 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Order ID</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Hash className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-bold text-sm">#{order.id}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Placed On</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                        <span className="font-medium text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total</p>
                                    <p className="font-bold text-lg">£{order.total_amount.toFixed(2)}</p>
                                </div>
                                <Badge
                                    variant={order.status === 'COMPLETED' || order.status === 'DELIVERED' ? 'default' : 'secondary'}
                                    className="h-8"
                                >
                                    {order.status === 'COMPLETED' || order.status === 'DELIVERED' ? (
                                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                    ) : (
                                        <Clock className="mr-1 h-3.5 w-3.5" />
                                    )}
                                    {order.status}
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="p-0">
                            <div className="divide-y px-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-6">
                                        <div className="h-20 w-20 overflow-hidden rounded-xl border bg-muted shadow-sm">
                                            <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-foreground text-sm leading-tight">{item.product_name}</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                                            <p className="text-xs text-muted-foreground">Price each: £{item.price_at_time.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">£{(item.price_at_time * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {order.discount_amount > 0 && (
                                <div className="bg-muted/20 border-t px-6 py-4 flex justify-between items-center text-sm">
                                    <span className="font-semibold text-muted-foreground">Promotion Applied</span>
                                    <span className="font-bold text-primary">-£{order.discount_amount.toFixed(2)}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export const Route = createFileRoute('/orders')({
    component: OrdersPage,
});
