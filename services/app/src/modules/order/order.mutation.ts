import {inject, injectable} from "inversify";
import OrderGateway from "../../gateway/order.gateway";
import {OrderCreateRequest} from "@ecommerce/libs/src/dto/order.dto";

@injectable()
class OrderMutation {

  constructor(@inject(OrderGateway) private readonly orderGateway: OrderGateway) {
  }

  public async createOrder(_, order: OrderCreateRequest) {
    return this.orderGateway.createOrder(order);
  }
}

export default OrderMutation;