export interface PaymentCreateRequest {
  userId: number;
  orderId: number;
  type: string;
  subType: string;
  billAmount: number;
  paidAmount: number;
  transactionId: string;
  paymentGateway: string;
  paymentMethod: string;
}