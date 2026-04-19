import { createFileRoute } from '@tanstack/react-router';
import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Loader2, PackageSearch, TrendingUp, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

function AdminOrdersPage() {
    const { data: orders, isLoading } = useAdminOrders();
    const updateStatus = useUpdateOrderStatus();

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!orders) return null;

    // Quick Stats
    const totalRevenue = orders.reduce((acc, order) => acc + (order.status !== 'CANCELED' ? order.total_amount : 0), 0);
    const totalOrders = orders.length;
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
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
                                    <th className="px-6 py-3 font-medium right-0">Status Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-muted/10 transition-colors">
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
                                            <Select
                                                value={order.status}
                                                onValueChange={(val) => {
                                                    updateStatus.mutate({ id: order.id, status: val });
                                                }}
                                                disabled={updateStatus.isPending && updateStatus.variables.id === order.id}
                                            >
                                                <SelectTrigger className="w-[140px] h-8 text-xs font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['PENDING', 'COMPLETED', 'DELIVERED', 'CANCELED'].map((s) => (
                                                        <SelectItem key={s} value={s} className="font-bold">
                                                            {s}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}

export const Route = createFileRoute('/admin/orders')({
    component: AdminOrdersPage,
});
