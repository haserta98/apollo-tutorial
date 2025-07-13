import {inject, injectable} from "inversify";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import {SocketIoManager} from "@ecommerce/libs/src/socket/socket.io-manager";
import {SocketManager} from "@ecommerce/libs/src/socket/socket-manager";
import PaymentCreateProcessor from "../payment.create.processor";
import PaymentCreateSubscriber from "../subscriber/payment.create.subscriber";
import DefaultPaymentGateway from "../gateway/payment.gateway";
import {DataSource} from "typeorm";

@injectable()
class PaymentBootstrapper {

  constructor(@inject(RmqClient) private readonly rmqClient: RmqClient,
              @inject(DataSource) private readonly dataSource: DataSource,
              @inject(LogGateway) private readonly logGateway: LogGateway,
              @inject(SocketIoManager) private readonly socketManager: SocketManager,
              @inject(PaymentCreateProcessor) private readonly paymentCreateProcessor: PaymentCreateProcessor,
              @inject(PaymentCreateSubscriber) private readonly paymentCreateSubscriber: PaymentCreateSubscriber,
              @inject(DefaultPaymentGateway) private readonly paymentGateway: DefaultPaymentGateway) {
  }

  async bootstrap(): Promise<void> {
    await this.rmqClient.connect();
    await this.logGateway.initialize();
    await this.socketManager.initialize();
    await this.paymentCreateProcessor.initialize();
    await this.paymentCreateSubscriber.initialize();
    await this.paymentGateway.initialize();
  }
}

export default PaymentBootstrapper;