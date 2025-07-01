import {inject, injectable} from "inversify";
import * as amqp from "amqplib"
import {QueueType} from "@ecommerce/libs/src/constants/Queue";
import Log from "@ecommerce/libs/src/domain/log";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import {logger} from "@ecommerce/libs/src/logger";
import {Bootable} from "@ecommerce/libs/src/common";
import {SendingMessage} from "@ecommerce/libs/src/domain/common";

@injectable()
class LogGateway implements Bootable {

  private channel: amqp.Channel;
  private QUEUE: QueueType = QueueType.LOG;

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient) {
  }

  public async initialize() {
    try {
      this.channel = await this.rmqClient.getConnection().createChannel()
      await this.channel.assertQueue(this.QUEUE, {durable: false});
      logger.info(`Log queue '${this.QUEUE}' created and ready for use.`);
    } catch (e) {
      logger.error("Failed to create log queue and channel:", e);
      throw new Error("RabbitMQ connection failed");
    }
  }

  public async send(log: Log) {
    try {
      const payload: SendingMessage<Log> = {
        type: "log",
        payload: log,
        key: log.owner
      }
      const messageBuffer = Buffer.from(JSON.stringify(payload));
      this.channel.sendToQueue(this.QUEUE, messageBuffer);
    } catch (error) {
      console.error("Failed to send log to queue:", error);
    }
  }
}

export default LogGateway;