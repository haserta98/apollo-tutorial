import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import OrderBootstrapper from "./bootstrap";
import OrderSubscriber from "../subscriber/order.subscriber";
import OrderGetByUserProcessor from "../processor/order.get_by_user.processor";
import OrderGetByIdProcessor from "../processor/order.get_by_id.processor";
import OrderItemsByOrderIdProcessor from "../processor/order_items.get_by_order.processor";
import OrderCreateProcessor from "../processor/order.create.processor";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import PaymentGateway from "../gateway/payment.gateway";

class OrderContainer extends IOContainer {

  private static instance: OrderContainer | null = null;

  constructor() {
    super({
      defaultScope: "Singleton",
      autobind: true,
    });
    this.init();
  }

  private init() {
    this.bind(DataSource).toConstantValue(AppDataSource);
    this.bind(RmqClient).toSelf();
    this.bind(OrderBootstrapper).toSelf();
    this.bind(OrderSubscriber).toSelf();
    this.bind(OrderGetByUserProcessor).toSelf();
    this.bind(OrderGetByIdProcessor).toSelf();
    this.bind(OrderItemsByOrderIdProcessor).toSelf();
    this.bind(OrderCreateProcessor).toSelf();
    this.bind(LogGateway).toSelf();
    this.bind(PaymentGateway).toSelf();
  }

  public static getInstance(): OrderContainer {
    if (!OrderContainer.instance) {
      OrderContainer.instance = new OrderContainer();
    }
    return OrderContainer.instance;
  }
}

export default OrderContainer