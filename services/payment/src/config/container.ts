import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import OrderBootstrapper from "./bootstrap";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import {SocketIoManager} from "@ecommerce/libs/src/socket/socket.io-manager";

class PaymentContainer extends IOContainer {

  private static instance: PaymentContainer | null = null;

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
    this.bind(LogGateway).toSelf();
    this.bind(SocketIoManager).toSelf();
  }

  public static getInstance(): PaymentContainer {
    if (!PaymentContainer.instance) {
      PaymentContainer.instance = new PaymentContainer();
    }
    return PaymentContainer.instance;
  }
}

export default PaymentContainer