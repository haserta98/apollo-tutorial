import {inject, injectable} from "inversify";
import * as amqp from "amqplib"
import {Bootable} from "../common";
import {QueueType, queueWithShard} from "../constants/Queue";
import RMQClient from "../graphql/RMQClient";
import {logger} from "../logger";
import Log from "../domain/log";
import {SendingMessage} from "../domain/common";

@injectable()
class LogGateway implements Bootable {

  private channel: amqp.Channel;
  private QUEUE: QueueType = QueueType.LOG;
  private shardSize: number;

  constructor(@inject(RMQClient) private readonly rmqClient: RMQClient) {
    this.shardSize = process.env.SHARD_COUNT ? +process.env.SHARD_COUNT : 1;
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
      const keyedQueue = queueWithShard(this.QUEUE, payload.key.toString(), this.shardSize);
      const messageBuffer = Buffer.from(JSON.stringify(payload));
      this.channel.sendToQueue(keyedQueue, messageBuffer);
    } catch (error) {
      console.error("Failed to send log to queue:", error);
    }
  }
}

export default LogGateway;