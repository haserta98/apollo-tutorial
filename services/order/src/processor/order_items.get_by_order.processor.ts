import {Processor} from "@ecommerce/libs/src/common";
import {OrderEntity, OrderItemEntity} from "@ecommerce/libs/src/entity/order.entity";
import {inject, injectable} from "inversify";
import {DataSource} from "typeorm";
import {IncomingMessage, SendingMessage} from "@ecommerce/libs/src/domain/common";
import {SubQueueType} from "@ecommerce/libs/src/constants/queue";

@injectable()
class OrderItemsByOrderIdProcessor implements Processor<number> {

  constructor(@inject(DataSource) private readonly datasource: DataSource) {
  }

  async process(payload: IncomingMessage<number>): Promise<void> {
    const orderRepository = this.datasource.getRepository(OrderItemEntity);
    const orders = await orderRepository.find({
      where: {
        order: {
          id: payload.payload
        },
      },
      relations: ["order"]
    });
    const sendingMessage: SendingMessage<OrderItemEntity[]> = {
      type: SubQueueType.GET_ORDER_ITEMS_BY_ORDER_ID,
      payload: orders,
      key: payload.payload.toString()
    }
    await payload.reply(sendingMessage);
  }
}

export default OrderItemsByOrderIdProcessor;