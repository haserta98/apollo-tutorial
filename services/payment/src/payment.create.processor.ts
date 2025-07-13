import {Bootable, Processor} from "@ecommerce/libs/src/common";
import {
  IncomingMessage,
  SendingMessage,
  SendingMessageBuilder
} from "@ecommerce/libs/src/domain/common";
import {PaymentCreateRequest} from "@ecommerce/libs/src/dto/payment.dto";
import {inject, injectable} from "inversify";
import DefaultPaymentGateway, {PaymentGateway} from "./gateway/payment.gateway";
import {PaymentResponse} from "@ecommerce/libs/src/domain/order";
import LogGateway from "@ecommerce/libs/src/common/log.gateway";
import Log from "@ecommerce/libs/src/domain/log";
import LogBuilder from "@ecommerce/libs/src/log.builder";
import {SubQueueType} from "@ecommerce/libs/src/constants/queue";
import {DataSource} from "typeorm";
import {OrderEntity} from "@ecommerce/libs/src/entity/order.entity";
import PaymentEntity from "@ecommerce/libs/src/entity/payment.entity";

@injectable()
class PaymentCreateProcessor implements Processor<PaymentCreateRequest>, Bootable {

  constructor(@inject(DefaultPaymentGateway) private readonly paymentGateway: PaymentGateway,
              @inject(LogGateway) private readonly logGateway: LogGateway,
              @inject(DataSource) private readonly datasource: DataSource) {
  }

  async initialize(): Promise<void> {
    await this.paymentGateway.initialize();
  }

  async process(payload: IncomingMessage<PaymentCreateRequest>): Promise<void> {
    const invalidReason = this.validatePayment(payload.payload);
    if (!invalidReason) {
      await this.replyError(payload, invalidReason);
      return;
    }
    let response: PaymentResponse;
    switch (payload.payload.paymentGateway) {
      default:
        response = await this.paymentGateway.pay(payload.payload);
        break;
    }
    await this.savePayment(response, payload.payload);
    await this.log(payload.payload, response);
    const sendingMessage: SendingMessage<PaymentResponse> = {
      key: payload.key,
      type: payload.type,
      payload: response
    }
    await payload.reply(sendingMessage);
  }

  async log(request: PaymentCreateRequest, response: PaymentResponse) {
    const log: Log = LogBuilder.builder()
      .withType(SubQueueType.PAYMENT_CREATE)
      .withOwner(request.userId.toString())
      .withMessage(response.message)
      .build();
    await this.logGateway.send(log);
  }

  async savePayment(response: PaymentResponse, request: PaymentCreateRequest): Promise<void> {
    const paymentRepository = this.datasource.getRepository(PaymentEntity);
    const orderRepository = this.datasource.getRepository(OrderEntity);
    const order = await orderRepository.findOne({
      where: {id: +request.orderId},
      relations: ['user']
    });
    if (!order) {
      throw new Error(`Order with id ${request.orderId} not found`);
    }
    const payment = new PaymentEntity();
    payment.transactionId = request.transactionId;
    payment.billAmount = request.billAmount;
    payment.paidAmount = request.paidAmount;
    payment.type = request.type;
    payment.subType = request.subType;
    payment.paymentGateway = request.paymentGateway;
    payment.paymentMethod = request.paymentMethod;
    payment.paymentStatus = response.success ? "success" : "failed";
    payment.user = order.user;
    payment.order = order;
    await paymentRepository.save(payment);
  }

  private validatePayment(payload: PaymentCreateRequest): string | null {
    return null;
  }

  private async replyError(payload: IncomingMessage<PaymentCreateRequest>, reason: string) {
    const errorMessage = `Payment validation failed: ${reason}`;
    const message: PaymentResponse = {
      success: false,
      message: errorMessage,
      transactionId: payload.payload.transactionId
    }
    const replyMessage: SendingMessage<PaymentResponse> = SendingMessageBuilder.builder<PaymentResponse>()
      .withType(payload.type)
      .withKey(payload.key)
      .withPayload(message)
      .build();
    await payload.reply(replyMessage);
  }
}

export default PaymentCreateProcessor;