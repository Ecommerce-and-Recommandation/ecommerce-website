import { Hash, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/pricing';
import type { OrderData } from '@/types/orderTypes';

interface OrderCardProps {
    order: OrderData;
}

export function OrderCard({ order }: OrderCardProps) {
    const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED';

    return (
        <Card className="overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b bg-muted/30 px-6 py-4">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order ID</p>
                        <div className="mt-0.5 flex items-center gap-1">
                            <Hash className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-bold">#{order.id}</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Placed On</p>
                        <div className="mt-0.5 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                                {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                        <p className="text-lg font-extrabold">{formatCurrency(order.total_amount)}</p>
                    </div>
                    <Badge
                        variant={isCompleted ? 'default' : 'secondary'}
                        className={`h-8 font-bold ${isCompleted ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                    >
                        {isCompleted ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : <Clock className="mr-1 h-3.5 w-3.5" />}
                        {order.status}
                    </Badge>
                </div>
            </div>

            <CardContent className="p-0">
                <div className="divide-y px-6">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-6">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm">
                                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="truncate text-sm leading-tight font-bold text-foreground">{item.product_name}</h3>
                                <p className="mt-1 text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                                <p className="text-xs text-muted-foreground">Price each: {formatCurrency(item.price_at_time)}</p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="font-extrabold">{formatCurrency(item.price_at_time * item.quantity)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {order.discount_amount > 0 && (
                    <div className="flex items-center justify-between border-t bg-primary/5 px-6 py-4 text-sm">
                        <span className="font-bold text-muted-foreground">Promotion Applied</span>
                        <span className="font-extrabold text-primary">-{formatCurrency(order.discount_amount)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
