import {inject, injectable} from "inversify";
import * as amqp from "amqplib";
import LogProcessor from "../processor/processor";
import {Subscriber} from "libs/src/common";
import Log from "libs/src/domain/log";
import {QueueType} from "libs/src/constants/Queue";
import RMQClient from "libs/src/graphql/RMQClient";
import {logger} from "libs/src/logger";

@injectable()
class LogSubscriber extends Subscriber<Log> {

  private channel: amqp.Channel;
  private readonly QUEUE_NAME = QueueType.LOG;

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient,
              @inject(LogProcessor) private readonly logProcessor: LogProcessor) {
    super()
  }

  public async initialize() {
    this.channel = await this.rmqClient.getConnection().createChannel()
    await this.subscribe();
  }

  protected async subscribe(): Promise<void> {
    await this.channel.assertQueue(this.QUEUE_NAME, {
      durable: true,
      autoDelete: false,
    });
    this.channel.consume(this.QUEUE_NAME, (msg) => {
      this.handleMessage(msg);
    }, {noAck: false});
  }

  protected async unsubscribe(): Promise<void> {
    await this.channel.deleteQueue(this.QUEUE_NAME);
  }

  protected async process(payload: Log): Promise<void> {
    if (!payload) {
      console.warn("Received empty payload, skipping processing.");
      return;
    }
    try {
      await this.logProcessor.process(payload);
    } catch (error) {
      logger.error("Error processing log:", error);
      throw error; // Re-throw to ensure message is not acknowledged
    }
  }

  private async handleMessage(message: amqp.Message | null) {
    if (!message) {
      console.warn("Received null message, skipping processing.");
      return;
    }
    try {
      const payload: Log = JSON.parse(message.content.toString());
      await this.process(payload);
      this.channel.ack(message);
    } catch (error) {
      logger.error("Error processing message:", error);
      this.channel.nack(message);
    }
  }
}

export default LogSubscriber