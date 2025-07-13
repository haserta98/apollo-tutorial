import {Container as IOContainer} from 'inversify';
import {DataSource} from "typeorm";
import {AppDataSource} from "@ecommerce/libs/src/data-source";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import {SocketIoManager} from "@ecommerce/libs/src/socket/socket.io-manager";
import PaymentBootstrapper from "./bootstrap";
import PaymentCreateProcessor from "../payment.create.processor";
import PaymentCreateSubscriber from "../subscriber/payment.create.subscriber";

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
    this.bind(RmqClient).toSelf();
    this.bind(PaymentBootstrapper).toSelf();
    this.bind(LogGateway).toSelf();
    this.bind(SocketIoManager).toSelf();
    this.bind(PaymentCreateProcessor).toSelf();
    this.bind(PaymentCreateSubscriber).toSelf();
  }

  public static getInstance(): PaymentContainer {
    if (!PaymentContainer.instance) {
      PaymentContainer.instance = new PaymentContainer();
    }
    return PaymentContainer.instance;
  }
}

export default PaymentContainer