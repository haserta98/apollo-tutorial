import {logger} from "../logger";
import {injectable} from "inversify";
import * as amqp from "amqplib";
import {IncomingMessage, SendingMessage} from "../domain/common";
import {Message} from "amqplib";

@injectable()
class RMQClient {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel | null = null;
  private replyQueue = '';
  private pendingReplies: Map<string, (response: any) => void> = new Map();
  private readonly shardSize: number = 1;

  constructor() {
    this.shardSize = process.env.SHARD_COUNT ? +process.env.SHARD_COUNT : 1
  }

  public async connect() {
    if (this.connection && this.channel) {
      logger.warn("RabbitMQ already connected.");
      return;
    }

    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || "amqp://localhost:5672",
        {
          heartbeat: +process.env.RMQ_CLIENT_HEARTBEAT || 60,
          timeout: +process.env.RMQ_CLIENT_CONNECTION_TIMEOUT || 30000,
        }
      );

      this.channel = await this.connection.createChannel();

      const {queue} = await this.channel.assertQueue('', {exclusive: true});
      this.replyQueue = queue;
      await this.channel.prefetch(10);

      await this.channel.consume(
        this.replyQueue,
        (msg) => {

          if (!msg) return;
          const correlationId = msg.properties.correlationId;
          const resolver = this.pendingReplies.get(correlationId);
          if (resolver) {
            const parsed = JSON.parse(msg.content.toString());
            resolver(parsed);
            this.pendingReplies.delete(correlationId);
          }
        },
        {noAck: true}
      );

      logger.info(`Connected to RabbitMQ. Reply queue: ${this.replyQueue}`);
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  public getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }
    return this.channel;
  }

  public getConnection(): amqp.ChannelModel {
    if (!this.connection) {
      throw new Error("Connection not initialized. Call connect() first.");
    }
    return this.connection;
  }

  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // convert to 32bit int
    }
    return Math.abs(hash);
  }

  public sendAndWait = async <T>(queue: string, message: SendingMessage<any>): Promise<SendingMessage<T>> => {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }

    if (!message || !message.type || !message.payload) {
      throw new Error("Invalid message format. Must contain type and payload.");
    }
    if (!queue) {
      throw new Error("Queue name must be provided.");
    }
    if (typeof message.key !== 'string') {
      throw new Error("Message key must be a string.");
    }
    if (message.key.length === 0) {
      throw new Error("Message key cannot be an empty string.");
    }
    const shard = this.hashString(message.key ?? "") % this.shardSize;
    const keyedQueue = `${queue}_${shard}`;

    const correlationId = this.generateCorrelationId();

    return new Promise<SendingMessage<T>>((resolve, reject) => {
      // Timeout fallback
      const timeout = setTimeout(() => {
        this.pendingReplies.delete(correlationId);
        reject(new Error(`Timeout while waiting for response to correlationId: ${correlationId}`));
      }, 5000);

      this.pendingReplies.set(correlationId, (response) => {
        clearTimeout(timeout);
        resolve(response);
      });

      this.channel.sendToQueue(keyedQueue, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: this.replyQueue,
      });
    });
  }

  public async reply(
    received: IncomingMessage<any>,
    sending: SendingMessage<any>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }
    const msg: Message = received.rawMessage;
    this.channel.sendToQueue(
      msg.properties.replyTo,
      Buffer.from(JSON.stringify(sending)),
      {
        correlationId: msg.properties.correlationId
      }
    );
  }

  private generateCorrelationId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export default RMQClient;
