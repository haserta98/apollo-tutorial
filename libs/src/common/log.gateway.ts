import {inject, injectable} from "inversify";
import * as amqp from "amqplib"
import {Bootable} from "../common";
import {QueueType} from "../constants/queue";
import RmqClient from "../graphql/rmq.client";
import {logger} from "../logger";
import Log from "../domain/log";
import {SendingMessage, SendingMessageBuilder} from "../domain/common";

@injectable()
class LogGateway implements Bootable {

  private channel: amqp.Channel;
  private QUEUE: QueueType = QueueType.LOG;

  constructor(@inject(RmqClient) private readonly rmqClient: RmqClient) {
  }

  public async initialize() {
    try {
      this.channel = await this.rmqClient.getConnection().createChannel()
      await this.channel.assertQueue(this.QUEUE, {durable: true});
      logger.info(`Log queue '${this.QUEUE}' created and ready for use.`);
    } catch (e) {
      logger.error("Failed to create log queue and channel:", e);
      throw new Error("RabbitMQ connection failed");
    }
  }

  public async send(log: Log) {
    try {
      const payload: SendingMessage<Log> = SendingMessageBuilder.builder<Log>()
        .withPayload(log)
        .withKey(log.owner)
        .withType("log")
        .build();
      await this.rmqClient.send(this.QUEUE, payload, this.channel)
    } catch (error) {
      console.error("Failed to send log to queue:", error);
    }
  }
}

export default LogGateway;