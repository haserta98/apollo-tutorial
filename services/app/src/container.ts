import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import UserService from "./modules/user/user.service";
import UserMutation from "./modules/user/user.mutation";
import UserResolver from "./modules/user/user.resolver";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import GraphqlBootstrapper from "./graphql.bootstrap";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import OrderGateway from "./gateway/order.gateway";
import OrderResolver from "./modules/order/order.resolver";
import OrderMutation from "./modules/order/order.mutation";

class IoContainer extends IOContainer {

  private static instance: IoContainer | null = null;

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
    this.bind(GraphqlBootstrapper).toSelf()
    this.bind(UserService).toSelf()
    this.bind(UserMutation).toSelf()
    this.bind(UserResolver).toSelf()
    this.bind(OrderGateway).toSelf();
    this.bind(OrderResolver).toSelf();
    this.bind(OrderMutation).toSelf();
    this.bind(LogGateway).toSelf();
  }

  public static getInstance(): IoContainer {
    if (!IoContainer.instance) {
      IoContainer.instance = new IoContainer();
    }
    return IoContainer.instance;
  }
}

export default IoContainer