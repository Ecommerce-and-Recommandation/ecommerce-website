export interface CartItemData {
    id: number;
    product_id: number;
    quantity: number;
    product_name: string;
    product_price: number;
    product_image: string;
    stock_code: string;
    added_at: string;
}

export interface CartResponse {
    items: CartItemData[];
    total: number;
    item_count: number;
}
