export class OrderCreateRequest {
  items: OrderItemCreateRequest[];
  userId: number;
}

export class OrderItemCreateRequest {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}