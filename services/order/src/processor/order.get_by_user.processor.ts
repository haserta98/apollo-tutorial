import {Processor} from "@ecommerce/libs/src/common";
import {OrderEntity} from "@ecommerce/libs/src/entity/order.entity";
import {inject, injectable} from "inversify";
import {DataSource} from "typeorm";
import {
  IncomingMessage,
  SendingMessage,
  SendingMessageBuilder
} from "@ecommerce/libs/src/domain/common";
import {SubQueueType} from "@ecommerce/libs/src/constants/queue";

@injectable()
class OrderGetByUserProcessor implements Processor<number> {

  constructor(@inject(DataSource) private readonly datasource: DataSource) {
  }

  async process(payload: IncomingMessage<number>): Promise<void> {
    const orderRepository = this.datasource.getRepository(OrderEntity);
    const orders = await orderRepository.find({
      where: {
        user: {
          id: +payload.payload
        }
      },
      relations: ["user"]
    });
    const sendingMessage: SendingMessage<OrderEntity[]> = SendingMessageBuilder.builder<OrderEntity[]>()
      .withType(SubQueueType.GET_ORDER_BY_USER_ID)
      .withKey(payload.payload.toString())
      .withPayload(orders)
      .build();
    await payload.reply(sendingMessage);
  }
}

export default OrderGetByUserProcessor;