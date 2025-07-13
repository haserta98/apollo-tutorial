import LogProcessor from "../processor/log.processor";
import {inject, injectable} from "inversify";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import {Bootable} from "@ecommerce/libs/src/common";
import LogSubscriber from "../subscriber/subscriber";

@injectable()
class LoggingBootstrapper {

  constructor(@inject(LogProcessor) private readonly logProcessor: Bootable,
              @inject(LogSubscriber) private readonly logSubscriber: LogSubscriber,
              @inject(RmqClient) private readonly rmqClient: RmqClient) {
  }

  async initialize() {
    await this.rmqClient.connect();
    await this.logProcessor.initialize();
    await this.logSubscriber.initialize();
  }
}

export default LoggingBootstrapper;