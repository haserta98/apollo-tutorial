import {inject, injectable} from "inversify";
import OrderGateway from "../../gateway/order.gateway";

@injectable()
class OrderResolver {

  constructor(@inject(OrderGateway) private readonly gateway: OrderGateway) {
  }

  resolveOrders(userId: number) {
    return this.gateway.getOrders(userId);
  }

  resolveOrder(orderId: number) {
    return this.gateway.getOrder(orderId);
  }

  resolveOrderItems(orderId: number) {
    return this.gateway.getOrderItems(orderId);
  }

}

export default OrderResolver;