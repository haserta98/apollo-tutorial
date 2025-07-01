import {Subscriber} from "@ecommerce/libs/src/common";
import {OrderEntity} from "@ecommerce/libs/src/entity/order";
import {inject, injectable} from "inversify";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import * as amqp from "amqplib";
import {QueueType, SubQueueType} from "@ecommerce/libs/src/constants/Queue";
import OrderGetProcessor from "../processor/order.get.processor";
import {IncomingMessage} from "@ecommerce/libs/src/domain/common";

export type OrderMessagePayload = OrderEntity | number;

@injectable()
class OrderSubscriber extends Subscriber<OrderMessagePayload> {

  protected channel: amqp.Channel;
  protected readonly QUEUE_NAME = QueueType.ORDER;

  constructor(@inject(RMQClient) protected readonly rmqClient: RMQClient,
              @inject(OrderGetProcessor) private readonly orderGetProcessor: OrderGetProcessor) {
    super();
  }

  public async initialize(): Promise<void> {
    this.channel = await this.rmqClient.getConnection().createChannel()
    await this.subscribe();
  }

  protected async process(payload: IncomingMessage<OrderMessagePayload>): Promise<void> {
    switch (payload.type) {
      case SubQueueType.GET_ORDER_BY_USER_ID: {
        await this.orderGetProcessor.process(payload as IncomingMessage<number>);
        break;
      }
    }
  }
}

export default OrderSubscriber