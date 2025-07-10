import {Subscriber} from "@ecommerce/libs/src/common";
import {OrderEntity} from "@ecommerce/libs/src/entity/order.entity";
import {inject, injectable} from "inversify";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import * as amqp from "amqplib";
import {QueueType, SubQueueType} from "@ecommerce/libs/src/constants/Queue";
import OrderGetByUserProcessor from "../processor/order.get_by_user.processor";
import {IncomingMessage} from "@ecommerce/libs/src/domain/common";
import OrderGetByIdProcessor from "../processor/order.get_by_id.processor";
import {logger} from "@ecommerce/libs/src/logger";
import OrderItemsByOrderIdProcessor from "../processor/order_items.get_by_order.processor";
import OrderCreateProcessor from "../processor/order.create.processor";
import {OrderCreateRequest} from "@ecommerce/libs/src/dto/order.dto";

export type OrderMessagePayload = OrderEntity | number | OrderCreateRequest;

@injectable()
class OrderSubscriber extends Subscriber<OrderMessagePayload> {

  protected channel: amqp.Channel;
  protected readonly QUEUE_NAME = QueueType.ORDER;

  constructor(@inject(RMQClient) protected readonly rmqClient: RMQClient,
              @inject(OrderGetByUserProcessor) private readonly orderGetProcessor: OrderGetByUserProcessor,
              @inject(OrderGetByIdProcessor) private readonly orderGetByIdProcessor: OrderGetByIdProcessor,
              @inject(OrderItemsByOrderIdProcessor) private readonly orderItemsByOrderIdProcessor: OrderItemsByOrderIdProcessor,
              @inject(OrderCreateProcessor) private readonly orderCreateProcessor: OrderCreateProcessor) {
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
      case SubQueueType.GET_ORDER_BY_ID: {
        await this.orderGetByIdProcessor.process(payload as IncomingMessage<number>);
        break;
      }
      case SubQueueType.GET_ORDER_ITEMS_BY_ORDER_ID: {
        await this.orderItemsByOrderIdProcessor.process(payload as IncomingMessage<number>);
        break;
      }
      case SubQueueType.CREATE: {
        await this.orderCreateProcessor.process(payload as IncomingMessage<OrderCreateRequest>);
        break;
      }
      default:
        logger.error(`No processor found for message type: ${payload.type}`);
        await payload.reply(null)
        break;
    }
  }
}

export default OrderSubscriber