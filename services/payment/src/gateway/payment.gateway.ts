import {Bootable} from "@ecommerce/libs/src/common";
import {PaymentCreateRequest} from "@ecommerce/libs/src/dto/payment.dto";
import {injectable} from "inversify";
import {PaymentResponse} from "@ecommerce/libs/src/domain/order";
import {logger} from "@ecommerce/libs/src/logger";

export interface PaymentGateway extends Bootable {
  pay(request: PaymentCreateRequest): Promise<PaymentResponse>;
}

@injectable()
class DefaultPaymentGateway implements PaymentGateway {

  async initialize(): Promise<void> {
    logger.info("Initialize PaymentGateway ");
  }

  async pay(request: PaymentCreateRequest): Promise<PaymentResponse> {
    return {
      success: true,
      transactionId: request.transactionId,
      message: "Payment processed successfully"
    };
  }
}

export default DefaultPaymentGateway;