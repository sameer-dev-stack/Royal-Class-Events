export interface PaymentIntentRequest {
    amount: number;
    currency: string;
    description: string;
    metadata: Record<string, any>;
    customer: {
        id: string;
        email: string;
        name: string;
    };
}

export interface PaymentIntentResponse {
    id: string;
    checkoutUrl: string;
    status: string;
}

export interface ExecutePaymentResponse {
    transactionId: string;
    status: string;
}

export interface RefundResponse {
    refundId: string;
    status: string;
}

export interface PaymentProvider {
    name: string;
    createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse>;
    executePayment(paymentIntentId: string, provider: string): Promise<ExecutePaymentResponse>;
    requestRefund(transactionId: string, amount?: number): Promise<RefundResponse>;
}
