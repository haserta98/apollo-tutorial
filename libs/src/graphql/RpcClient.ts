import * as amqp from 'amqplib';
import {randomUUID} from 'crypto';
import {Bootable} from "../common";
import {SendingMessage} from "../domain/common";
import {QueueType, queueWithShard} from "../constants/Queue";

export interface RpcClient extends Bootable {
  send<T = any, R = any>(queue: string, message: SendingMessage<T>, timeoutMs?: number): Promise<SendingMessage<R>>;
}

export type RpcCallback<T = any> = (data: T) => void;

export class RMQRpcClient implements RpcClient {

  private correlationMap = new Map<string, RpcCallback>();

  constructor(
    private channel: amqp.Channel,
    private replyQueue: string,
    private shardSize: number = 1
  ) {
  }

  async initialize(): Promise<void> {
    this.replyQueue = (await this.channel.assertQueue(this.replyQueue, {exclusive: true})).queue;
    await this.ensureReplyConsumer();
  }

  public async send<T = any, R = any>(queue: QueueType, message: SendingMessage<T>, timeoutMs = 5000): Promise<R> {
    const correlationId = randomUUID();

    return new Promise<R>((resolve, reject) => {
      this.correlationMap.set(correlationId, resolve);

      const keyedQueue = queueWithShard(queue, message.key.toString(),this.shardSize);
      this.channel.sendToQueue(keyedQueue, Buffer.from(JSON.stringify(message)), {
        correlationId,
        replyTo: this.replyQueue,
      });

      setTimeout(() => {
        if (this.correlationMap.has(correlationId)) {
          this.correlationMap.delete(correlationId);
          reject(new Error(`RPC timeout after ${timeoutMs}ms`));
        }
      }, timeoutMs);
    });
  }

  private async ensureReplyConsumer() {
    await this.channel.consume(
      this.replyQueue,
      (msg) => {
        if (!msg) return;

        const correlationId = msg.properties.correlationId;
        const callback: RpcCallback = this.correlationMap.get(correlationId);
        if (callback) {
          callback(JSON.parse(msg.content.toString()));
          this.correlationMap.delete(correlationId);
        }
      },
      {noAck: true}
    );
  }

  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }
}
