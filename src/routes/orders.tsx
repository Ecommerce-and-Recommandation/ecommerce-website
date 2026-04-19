import { createFileRoute } from '@tanstack/react-router';
import { useMyOrders } from '@/hooks/useOrders';
import { Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderCard } from '@/components/orders/orderCard';

function OrdersPage() {
    const { data: orders, isLoading } = useMyOrders();

    if (isLoading) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="grid gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={`ord-skeleton-${String(i)}`} className="overflow-hidden">
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
            <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-inner">
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h1 className="mt-6 text-2xl font-extrabold tracking-tight">No orders yet</h1>
                <p className="mt-2 text-muted-foreground font-medium">It looks like you haven't placed any orders.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">My Orders</h1>
                <p className="mt-2 text-muted-foreground font-medium">Review and track your past purchases here.</p>
            </div>

            <div className="grid gap-6">
                {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        </div>
    );
}

export const Route = createFileRoute('/orders')({
    component: OrdersPage,
});
