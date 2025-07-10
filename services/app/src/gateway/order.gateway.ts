import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import {inject, injectable} from "inversify";
import {QueueType, SubQueueType} from "@ecommerce/libs/src/constants/Queue";
import {OrderEntity, OrderItemEntity} from "@ecommerce/libs/src/entity/order.entity";
import {SendingMessage} from "@ecommerce/libs/src/domain/common";
import {OrderCreateRequest, OrderCreateResponse} from "@ecommerce/libs/src/dto/order.dto";

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
    const incoming = await this.client.sendAndWait<number, OrderEntity[]>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }

  async getOrderItems(orderId: number): Promise<OrderItemEntity[]> {
    const msg: SendingMessage<number> = {
      type: SubQueueType.GET_ORDER_ITEMS_BY_ORDER_ID,
      payload: orderId,
      key: orderId.toString()
    }
    const incoming = await this.client.sendAndWait<number, OrderItemEntity[]>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }

  async getOrder(orderId: number): Promise<OrderEntity> {
    const msg: SendingMessage<number> = {
      type: SubQueueType.GET_ORDER_BY_ID,
      payload: orderId,
      key: orderId.toString()
    }
    const incoming = await this.client.sendAndWait<number, OrderEntity>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }

  async createOrder(order: OrderCreateRequest): Promise<OrderCreateResponse> {
    const msg: SendingMessage<OrderCreateRequest> = {
      type: SubQueueType.CREATE,
      payload: order,
      key: order.userId.toString()
    }
    const incoming = await this.client.sendAndWait<OrderCreateRequest, OrderCreateResponse>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }
}

export default OrderGateway;