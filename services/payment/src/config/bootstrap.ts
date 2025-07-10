import {inject, injectable} from "inversify";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import {SocketIoManager} from "@ecommerce/libs/src/socket/socket.io-manager";
import {SocketManager} from "@ecommerce/libs/src/socket/socket-manager";

@injectable()
class PaymentBootstrapper {

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient,
              @inject(LogGateway) private readonly logGateway: LogGateway,
              @inject(SocketIoManager) private readonly socketManager: SocketManager,) {
  }

  async bootstrap(): Promise<void> {
    await this.rmqClient.connect();
    await this.logGateway.initialize();
    await this.socketManager.initialize();
  }
}

export default PaymentBootstrapper;