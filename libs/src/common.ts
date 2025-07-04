import Log from "./domain/log";
import * as amqp from "amqplib";
import {logger} from "./logger";
import {IncomingMessage, IncomingMessageBuilder, SendingMessage} from "./domain/common";
import RMQClient from "./graphql/RMQClient";
import {QueueType, queueWithShard} from "./constants/Queue";

export interface Bootable {
  initialize(): Promise<void>;
}

export interface Processor<TPayload> {
  process(payload: IncomingMessage<TPayload>): Promise<void>;
}

export interface Logger {
  connect(): Promise<void>;

  send(log: Log): Promise<void>;
}

export abstract class Subscriber<TPayload> implements Bootable {

  protected rmqClient: RMQClient;
  protected QUEUE_NAME: QueueType;
  protected readonly shardSize: number;

  protected constructor() {
    this.shardSize = process.env.SHARD_COUNT ? +process.env.SHARD_COUNT : 1;
  }

  protected async subscribe(): Promise<void> {
    for (let i = 0; i < this.shardSize; i++) {
      await this.startShard(i);
    }
  }

  private async startShard(shard: number) {
    const channel = await this.rmqClient.getConnection().createChannel();
    await channel.prefetch(5);
    const queueName = `${this.QUEUE_NAME}_${shard}`;
    await channel.assertQueue(queueName, {
      durable: false,
    });
    await channel.consume(queueName, (msg) => {
      this.handleMessage(msg, channel);
    }, {noAck: false});
    logger.info(`Shard ${shard} for queue '${queueName}' is ready and listening for messages.`);
  }


  protected abstract process(payload: IncomingMessage<TPayload>): Promise<void>;

  abstract initialize(): Promise<void>;

  protected async handleMessage(message: amqp.Message | null, channel: amqp.Channel) {
    if (!message) {
      console.warn("Received null message, skipping processing.");
      return;
    }
    try {
      const payload: SendingMessage<any> = JSON.parse(message.content.toString());
      const incomingMessage: IncomingMessage<TPayload> = IncomingMessageBuilder.create(
        this.rmqClient,
        message,
        payload.type,
        payload.payload,
        payload.key
      )
      await this.process(incomingMessage);
      channel.ack(message);
    } catch (error) {
      logger.error("Error processing message:", error);
      channel.nack(message);
    }
  }

  protected async unsubscribe(): Promise<void> {
    //await this.channel.deleteQueue(this.QUEUE_NAME);
  }
}