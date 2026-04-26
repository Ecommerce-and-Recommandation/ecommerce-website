import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAdminOrders } from '@/hooks/useOrders';
import { Loader2, PackageSearch, TrendingUp, DollarSign, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function AdminOrdersPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useAdminOrders(page, 15);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    if (isLoading && !data) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const orders = data?.orders ?? [];
    const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

    // Quick Stats
    const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== 'CANCELED' ? order.total_amount : 0), 0);
    const totalOrders = data?.total ?? 0;
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">Manage Orders</h1>
                <p className="mt-2 text-muted-foreground">Monitor sales, approve pending transactions, and track revenue.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (page)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</div>
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
                        <PackageSearch className="h-12 w-12 mb-4 opacity-50" />
                        <p>No orders completely logged yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Order ID</th>
                                    <th className="px-6 py-3 font-medium">Items</th>
                                    <th className="px-6 py-3 font-medium">Total Price</th>
                                    <th className="px-6 py-3 font-medium">Discount</th>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium right-0">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-muted/10 transition-colors cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-6 py-4 font-bold uppercase">
                                            #{order.id} (User {order.user_id})
                                        </td>
                                        <td className="px-6 py-4">
                                            {order.items.length} items
                                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                {order.items.map((i) => i.product_name).join(', ')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold">£{order.total_amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            {order.discount_amount > 0 ? (
                                                <Badge variant="secondary" className="font-bold">
                                                    -£{order.discount_amount.toFixed(2)}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground opacity-50">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                                            {new Date(order.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={order.status === 'COMPLETED' ? 'default' : 'secondary'} className="font-bold text-xs">
                                                {order.status}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-6 py-3 text-sm">
                        <span className="text-muted-foreground">
                            Page {page} of {totalPages} ({data?.total} orders)
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
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
                                <h3 className="text-sm font-semibold text-muted-foreground mb-3">Order Items</h3>
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
                                            {selectedOrder.items.map((item: any) => (
                                                <tr key={item.id}>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{item.product_name}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-3 text-right">£{item.price_at_time.toFixed(2)}</td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        £{(item.price_at_time * item.quantity).toFixed(2)}
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
                                        <span>£{(selectedOrder.total_amount + selectedOrder.discount_amount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-destructive">
                                        <span>Discount</span>
                                        <span>-£{selectedOrder.discount_amount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>£{selectedOrder.total_amount.toFixed(2)}</span>
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
