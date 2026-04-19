export interface OrderItemData {
    id: number;
    product_id: number;
    quantity: number;
    price_at_time: number;
    product_name: string;
    product_image: string;
}

export interface OrderData {
    id: number;
    user_id: number;
    total_amount: number;
    discount_amount: number;
    status: string;
    created_at: string;
    items: OrderItemData[];
}
