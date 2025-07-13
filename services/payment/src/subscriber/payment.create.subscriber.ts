import {Subscriber} from "@ecommerce/libs/src/common";
import {IncomingMessage} from "@ecommerce/libs/src/domain/common";
import {PaymentCreateRequest} from "@ecommerce/libs/src/dto/payment.dto";
import * as amqp from "amqplib";
import {QueueType} from "@ecommerce/libs/src/constants/queue";
import {inject, injectable} from "inversify";
import PaymentCreateProcessor from "../payment.create.processor";
import RmqClient from "@ecommerce/libs/src/graphql/rmq.client";

@injectable()
class PaymentCreateSubscriber extends Subscriber<PaymentCreateRequest> {

  protected channel: amqp.Channel;

  constructor(@inject(PaymentCreateProcessor) private readonly paymentCreateProcessor: PaymentCreateProcessor,
              @inject(RmqClient) protected readonly rmqClient: RmqClient) {
    super(QueueType.PAYMENT_CREATE);
  }

  async initialize(): Promise<void> {
    this.channel = await this.rmqClient.getConnection().createChannel()
    await this.subscribe();
  }

  protected async process(payload: IncomingMessage<PaymentCreateRequest>): Promise<void> {
    await this.paymentCreateProcessor.process(payload);
  }
}

export default PaymentCreateSubscriber;