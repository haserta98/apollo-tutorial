import {logger} from "../logger";
import {inject, injectable} from "inversify";
import * as amqp from "amqplib";
import {IncomingMessage, ReplyMessage, SendingMessage} from "../domain/common";
import {Message} from "amqplib";
import {RMQRpcClient, RpcClient} from "./RpcClient";

@injectable()
class RMQClient {
  private connection: amqp.ChannelModel;
  private channel: amqp.Channel | null = null;
  private readonly replyQueue = '';
  private readonly shardSize: number = 1;
  private rpcClient: RpcClient;

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
      await this.channel.prefetch(10);
      this.rpcClient = new RMQRpcClient(
        this.channel,
        this.replyQueue,
        this.shardSize
      )
      await this.rpcClient.initialize();


      logger.info(`Connected to RabbitMQ. Reply queue: ${this.replyQueue}`);
    } catch (error) {
      logger.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  public getConnection(): amqp.ChannelModel {
    if (!this.connection) {
      throw new Error("Connection not initialized. Call connect() first.");
    }
    return this.connection;
  }

  public sendAndWait = async <T>(queue: string, message: SendingMessage<any>): Promise<ReplyMessage<T>> => {
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
    return this.rpcClient.send<any, T>(
      queue,
      message,
      +process.env.RPC_TIMEOUT_MS || 5000
    )
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


}

export default RMQClient;
