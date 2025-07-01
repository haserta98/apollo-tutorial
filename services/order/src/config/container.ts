import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import OrderBootstrapper from "./bootstrap";
import OrderSubscriber from "../subscriber/order.subscriber";
import OrderGetProcessor from "../processor/order.get.processor";

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
    this.bind(RMQClient).toSelf();
    this.bind(OrderBootstrapper).toSelf();
    this.bind(OrderSubscriber).toSelf();
    this.bind(OrderGetProcessor).toSelf();
  }

  public static getInstance(): OrderContainer {
    if (!OrderContainer.instance) {
      OrderContainer.instance = new OrderContainer();
    }
    return OrderContainer.instance;
  }
}

export default OrderContainer