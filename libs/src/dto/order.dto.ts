export interface OrderCreateRequest {
  items: OrderItemCreateRequest[];
  userId: number;
}

interface OrderItemCreateRequest {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface OrderCreateResponse {
  id: number;
}