import {inject, injectable} from "inversify";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import OrderSubscriber from "../subscriber/order.subscriber";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";

@injectable()
class OrderBootstrapper {

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient,
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