import {inject, injectable} from "inversify";
import OrderGateway from "../../gateway/order.gateway";

@injectable()
class OrderResolver {

  constructor(@inject(OrderGateway) private readonly gateway: OrderGateway) {
  }

  resolveOrders = async (userId: number) => {
    return this.gateway.getOrders(userId);
  }

}

export default OrderResolver;