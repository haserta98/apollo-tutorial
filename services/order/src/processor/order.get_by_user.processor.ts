import {Processor} from "@ecommerce/libs/src/common";
import {OrderEntity} from "@ecommerce/libs/src/entity/order";
import {inject, injectable} from "inversify";
import {DataSource} from "typeorm";
import {IncomingMessage, SendingMessage} from "@ecommerce/libs/src/domain/common";
import {SubQueueType} from "@ecommerce/libs/src/constants/Queue";

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
    const sendingMessage: SendingMessage<OrderEntity[]> = {
      type: SubQueueType.GET_ORDER_BY_USER_ID,
      payload: orders,
      key: payload.payload.toString()
    }
    await payload.reply(sendingMessage);
  }
}

export default OrderGetByUserProcessor;