import { Hash, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OrderData } from '@/types/orderTypes';

interface OrderCardProps {
    order: OrderData;
}

export function OrderCard({ order }: OrderCardProps) {
    const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED';

    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Header */}
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
                            <span className="font-medium text-sm">
                                {new Date(order.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total</p>
                        <p className="font-extrabold text-lg">£{order.total_amount.toFixed(2)}</p>
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

            {/* Items */}
            <CardContent className="p-0">
                <div className="divide-y px-6">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 py-6">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-muted shadow-sm">
                                <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-foreground text-sm leading-tight truncate">{item.product_name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                                <p className="text-xs text-muted-foreground">Price each: £{item.price_at_time.toFixed(2)}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <p className="font-extrabold">£{(item.price_at_time * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Promo info */}
                {order.discount_amount > 0 && (
                    <div className="bg-primary/5 border-t px-6 py-4 flex justify-between items-center text-sm">
                        <span className="font-bold text-muted-foreground">Promotion Applied</span>
                        <span className="font-extrabold text-primary">-£{order.discount_amount.toFixed(2)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
