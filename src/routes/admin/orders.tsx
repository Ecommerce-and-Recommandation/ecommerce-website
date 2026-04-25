import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAdminOrders } from '@/hooks/useOrders';
import { Loader2, PackageSearch, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/pricing';
import type { OrderData, OrderItemData } from '@/types/orderTypes';

function AdminOrdersPage() {
    const { data: orders, isLoading } = useAdminOrders();
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!orders) return null;

    const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== 'CANCELED' ? order.total_amount : 0), 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

    return (
        <div className="animate-in fade-in space-y-8 duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Manage Orders</h1>
                <p className="mt-2 text-muted-foreground">Monitor sales, approve pending transactions, and track revenue.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingOrders}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm">
                <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-semibold">Recent Transactions</h2>
                </div>

                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <PackageSearch className="mb-4 h-12 w-12 opacity-50" />
                        <p>No orders completely logged yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">Items</th>
                                    <th className="px-6 py-3 font-medium">Total Price</th>
                                    <th className="px-6 py-3 font-medium">Discount</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="right-0 px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="cursor-pointer transition-colors hover:bg-muted/10"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                        }}
                                    >
                                        <td className="px-6 py-4 font-bold uppercase">
                                            #{order.id} (User {order.user_id})
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.items.length} items
                                            <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                                {order.items.map((i) => i.product_name).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">{formatCurrency(order.total_amount)}</td>
                                        <td className="px-6 py-4">
                                            {order.discount_amount > 0 ? (
                                                <Badge variant="secondary" className="font-bold">
                                                    -{formatCurrency(order.discount_amount)}
                                                </Badge>
                                            ) : (
                                                <span className="opacity-50 text-muted-foreground">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-xs font-bold">
                                                {order.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <Dialog
                open={!!selectedOrder}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedOrder(null);
                    }
                }}
            >
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Order Details #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>Placed on {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString() : ''}</DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="mt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold text-muted-foreground">User ID</p>
                                    <p className="font-medium">{selectedOrder.user_id}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-muted-foreground">Status</p>
                                    <Badge variant={selectedOrder.status === 'COMPLETED' ? 'default' : 'secondary'} className="mt-1 font-bold">
                                        {selectedOrder.status}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Order Items</h3>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium">Product</th>
                                                <th className="px-4 py-2 text-center font-medium">Qty</th>
                                                <th className="px-4 py-2 text-right font-medium">Price</th>
                                                <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {selectedOrder.items.map((item: OrderItemData) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{item.product_name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right">{formatCurrency(item.price_at_time)}</td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(item.price_at_time * item.quantity)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex justify-end text-sm">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(selectedOrder.total_amount + selectedOrder.discount_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-destructive">
                                        <span>Discount</span>
                                        <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                                    </div>
                                    <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export const Route = createFileRoute('/admin/orders')({
    component: AdminOrdersPage,
});
