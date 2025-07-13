import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import {inject, injectable} from "inversify";
import {QueueType, SubQueueType} from "@ecommerce/libs/src/constants/queue";
import {OrderEntity, OrderItemEntity} from "@ecommerce/libs/src/entity/order.entity";
import {SendingMessage, SendingMessageBuilder} from "@ecommerce/libs/src/domain/common";
import {OrderCreateRequest, OrderCreateResponse} from "@ecommerce/libs/src/dto/order.dto";

@injectable()
class OrderGateway {

  constructor(@inject(RmqClient) private readonly client: RmqClient) {
  }

  async getOrders(userId: number): Promise<OrderEntity[]> {
    const msg: SendingMessage<number> = SendingMessageBuilder.builder<number>()
      .withType(SubQueueType.GET_ORDER_BY_USER_ID)
      .withPayload(userId)
      .withKey(userId.toString())
      .build()
    const incoming = await this.client.sendAndWait<number, OrderEntity[]>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }

  async getOrderItems(orderId: number): Promise<OrderItemEntity[]> {
    const msg: SendingMessage<number> = SendingMessageBuilder.builder<number>()
      .withType(SubQueueType.GET_ORDER_ITEMS_BY_ORDER_ID)
      .withPayload(orderId)
      .withKey(orderId.toString())
      .build()
    const incoming = await this.client.sendAndWait<number, OrderItemEntity[]>(
      QueueType.ORDER,
      msg
    )
    return incoming.payload;
  }

  async getOrder(orderId: number): Promise<OrderEntity> {
    const msg: SendingMessage<number> = SendingMessageBuilder.builder<number>()
      .withType(SubQueueType.GET_ORDER_BY_ID)
      .withPayload(orderId)
      .withKey(orderId.toString())
      .build()
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