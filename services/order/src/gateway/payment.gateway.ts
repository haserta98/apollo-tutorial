import {Bootable} from "@ecommerce/libs/src/common";
import {inject, injectable} from "inversify";
import RMQClient from "@ecommerce/libs/src/graphql/RMQClient";
import * as amqp from "amqplib"
import {QueueType} from "@ecommerce/libs/src/constants/Queue";
import {logger} from "@ecommerce/libs/src/logger";
import {PaymentCreateRequest} from "@ecommerce/libs/src/dto/payment.dto";

@injectable()
class PaymentGateway implements Bootable {

  private channel: amqp.Channel;
  private QUEUE: QueueType = QueueType.PAYMENT;
  private readonly shardSize: number;

  constructor(@inject(RMQClient) private readonly client: RMQClient) {
    this.shardSize = process.env.SHARD_COUNT ? +process.env.SHARD_COUNT : 1;
  }

  async initialize(): Promise<void> {
    try {
      this.channel = await this.client.getConnection().createChannel()
      await this.channel.assertQueue(this.QUEUE, {durable: true});
      logger.info(`Payment producer queue '${this.QUEUE}' created and ready for use.`);
    } catch (e) {
      logger.error("Failed to create payment producer queue and channel:", e);
      throw new Error("RabbitMQ connection failed");
    }
  }

  public async send(payment: PaymentCreateRequest): Promise<void> {

  }
}

export default PaymentGateway;