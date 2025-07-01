import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import {inject, injectable} from "inversify";
import {QueueType, SubQueueType} from "@ecommerce/libs/src/constants/Queue";
import {OrderEntity} from "@ecommerce/libs/src/entity/order";
import {SendingMessage} from "@ecommerce/libs/src/domain/common";

@injectable()
class OrderGateway {

  constructor(@inject(RMQClient) private readonly client: RMQClient) {
  }

  async getOrders(userId: number): Promise<OrderEntity[]> {
    const msg: SendingMessage<number> = {
      type: SubQueueType.GET_ORDER_BY_USER_ID,
      payload: userId,
      key: userId.toString()
    }
    const incoming = await this.client.sendAndWait<OrderEntity[]>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }
}

export default OrderGateway;