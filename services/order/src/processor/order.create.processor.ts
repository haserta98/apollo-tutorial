import {Processor} from "@ecommerce/libs/src/common";
import {IncomingMessage, SendingMessage} from "@ecommerce/libs/src/domain/common";
import {OrderEntity, OrderItemEntity} from "@ecommerce/libs/src/entity/order.entity";
import {inject, injectable} from "inversify";
import {DataSource} from "typeorm";
import {OrderCreateRequest, OrderCreateResponse} from "@ecommerce/libs/src/dto/order.dto";
import {UserEntity} from "@ecommerce/libs/src/entity/user.entity";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import LogBuilder from "@ecommerce/libs/src/log.builder";
import {logger} from "@ecommerce/libs/src/logger";

@injectable()
class OrderCreateProcessor implements Processor<OrderCreateRequest> {

  constructor(@inject(DataSource) private readonly datasource: DataSource,
              @inject(LogGateway) private readonly logGateway: LogGateway
  ) {
  }

  async process(payload: IncomingMessage<OrderCreateRequest>): Promise<void> {
    const orderRepository = this.datasource.getRepository(OrderEntity);
    const order = this.buildOrder(payload.payload);
    const orderEntity = orderRepository.create(order);
    const saved = await orderRepository.save(orderEntity);
    const sendingMessage: SendingMessage<OrderCreateResponse> = {
      type: "ORDER_CREATED",
      payload: {
        id: saved.id
      },
      key: payload.payload.userId.toString()
    }
    await payload.reply(sendingMessage);

    this.saveOrderLog(order);
  }

  private buildOrder(order: OrderCreateRequest) {
    const orderEntity = new OrderEntity();
    orderEntity.items = [];
    for (const item of order.items) {
      const orderItem: OrderItemEntity = new OrderItemEntity();
      orderItem.price = item.price;
      orderItem.productId = item.productId;
      orderItem.productName = item.productName;
      orderItem.quantity = item.quantity;
      orderEntity.items.push(orderItem);
    }
    orderEntity.user = {id: order.userId} as UserEntity;
    orderEntity.totalPrice = orderEntity.items.reduce((total, item) => total + item.price * item.quantity, 0);
    orderEntity.status = "pending";
    return orderEntity;
  }

  private saveOrderLog(order: OrderEntity) {
    const createLog = LogBuilder.builder()
      .withType("ORDER_CREATED")
      .withOwner(order.user.id.toString())
      .withMessage("Order created successfully")
      .build();
    this.logGateway
      .send(createLog)
      .catch((err) => {
        logger.error("Failed to send log:", err);
      });
  }
}

export default OrderCreateProcessor;