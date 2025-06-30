import * as amqp from "amqplib"
import LogProcessor from "../processor/processor";
import Log from "../../../../libs/domain/log";
import {QueueType} from "../../../../libs/constants/Queue";
import {inject, injectable} from "inversify";
import RMQClient from "../../../../libs/graphql/RMQClient";
import {logger} from "../../../../libs/logger";

@injectable()
class LoggingBootstrapper {

  constructor(@inject(LogProcessor) private readonly logProcessor: LogProcessor,
              @inject(RMQClient) private readonly rmqClient: RMQClient) {
  }

  async initialize() {
    await this.logProcessor.initialize();
    await this.connect()
    await this.listenQueue();
  }

  async connect() {
    await this.rmqClient.connect();
  }

  private async listenQueue() {
    const queue = QueueType.LOG
    const channel = await this.rmqClient.getConnection().createChannel();
    await channel.assertQueue(queue, {durable: false});
    channel.consume(
      queue,
      (message) => {
        this.onMessage(message, channel);
      }, {noAck: false}
    );
  }

  private async onMessage(message: amqp.Message, channel: amqp.Channel) {
    let payload: Log;
    try {
      payload = JSON.parse(message.content.toString());
    } catch (e) {
      logger.error("Failed to parse message content:", e);
      channel.reject(message, false)
      return;
    }

    try {
      await this.logProcessor.process(payload);
      channel.ack(message);
    } catch (e) {
      logger.error("Error processing message:", e);
      channel.nack(message);
    }
  }


}

export default LoggingBootstrapper;