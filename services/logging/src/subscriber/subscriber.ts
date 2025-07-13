import {inject, injectable} from "inversify";
import * as amqp from "amqplib";
import LogProcessor from "../processor/log.processor";
import {Subscriber} from "@ecommerce/libs/src/common";
import Log from "@ecommerce/libs/src/domain/log";
import {QueueType} from "@ecommerce/libs/src/constants/queue";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import {logger} from "@ecommerce/libs/src/logger";
import {IncomingMessage} from "@ecommerce/libs/src/domain/common";

@injectable()
class LogSubscriber extends Subscriber<Log> {

  protected channel: amqp.Channel;

  constructor(@inject(RmqClient) protected readonly rmqClient: RmqClient,
              @inject(LogProcessor) private readonly logProcessor: LogProcessor) {
    super(QueueType.LOG);
  }

  public async initialize() {
    this.channel = await this.rmqClient.getConnection().createChannel()
    await this.subscribe();
  }

  protected async process(payload: IncomingMessage<Log>): Promise<void> {
    if (!payload) {
      console.warn("Received empty payload, skipping processing.");
      return;
    }
    try {
      await this.logProcessor.process(payload);
    } catch (error) {
      logger.error("Error processing log:", error);
      throw error;
    }
  }
}

export default LogSubscriber