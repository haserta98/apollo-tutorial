import {inject, injectable} from "inversify";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import OrderSubscriber from "../subscriber/order.subscriber";

@injectable()
class OrderBootstrapper {

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient,
              @inject(OrderSubscriber) private readonly orderSubscriber: OrderSubscriber) {
  }

  async bootstrap(): Promise<void> {
    await this.rmqClient.connect();
    await this.orderSubscriber.initialize();
  }
}

export default OrderBootstrapper;