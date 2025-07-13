import {Bootable} from "@ecommerce/libs/src/common";
import {inject, injectable} from "inversify";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";
import * as amqp from "amqplib"
import {QueueType, SubQueueType} from "@ecommerce/libs/src/constants/queue";
import {logger} from "@ecommerce/libs/src/logger";
import {PaymentCreateRequest} from "@ecommerce/libs/src/dto/payment.dto";
import {SendingMessageBuilder} from "@ecommerce/libs/src/domain/common";
import {PaymentResponse} from "@ecommerce/libs/src/domain/order";

@injectable()
class PaymentGateway implements Bootable {

  private channel: amqp.Channel;

  constructor(@inject(RmqClient) private readonly client: RmqClient) {
  }

  async initialize(): Promise<void> {
    try {
      this.channel = await this.client.getConnection().createChannel()
      await this.channel.assertQueue(QueueType.PAYMENT_CREATE, {durable: true});
      logger.info(`Payment producer queue '${QueueType.PAYMENT_CREATE}' created and ready for use.`);
    } catch (e) {
      logger.error("Failed to create payment producer queue and channel:", e);
      throw new Error("RabbitMQ connection failed");
    }
  }

  public async send(payment: PaymentCreateRequest): Promise<PaymentResponse> {
    const msg = SendingMessageBuilder.builder<PaymentCreateRequest>()
      .withType(SubQueueType.PAYMENT_CREATE)
      .withKey(payment.orderId.toString())
      .withPayload(payment)
      .build();
    const incoming = await this.client.sendAndWait<PaymentCreateRequest, PaymentResponse>(
      QueueType.PAYMENT_CREATE,
      msg
    );
    return incoming.payload;
  }
}

export default PaymentGateway;