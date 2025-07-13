import {inject, injectable} from "inversify";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import OrderSubscriber from "../subscriber/order.subscriber";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";

@injectable()
class OrderBootstrapper {

  constructor(@inject(RmqClient) private readonly rmqClient: RmqClient,
              @inject(OrderSubscriber) private readonly orderSubscriber: OrderSubscriber,
              @inject(LogGateway) private readonly logGateway: LogGateway,) {
  }

  async bootstrap(): Promise<void> {
    await this.rmqClient.connect();
    await this.orderSubscriber.initialize();
    await this.logGateway.initialize();
  }
}

export default OrderBootstrapper;