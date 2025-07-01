import {Processor} from "@ecommerce/libs/src/common";
import {OrderEntity} from "@ecommerce/libs/src/entity/order";
import {inject, injectable} from "inversify";
import {DataSource} from "typeorm";
import {IncomingMessage, SendingMessage} from "@ecommerce/libs/src/domain/common";

@injectable()
class OrderGetProcessor implements Processor<number> {

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
    });
    const sendingMessage: SendingMessage<OrderEntity[]> = {
      type: "orders.get.by.user_id",
      payload: orders,
      key: payload.payload.toString()
    }
    await payload.reply(sendingMessage);
  }
}

export default OrderGetProcessor;