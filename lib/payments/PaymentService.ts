import { PaymentProvider, PaymentIntentRequest, PaymentIntentResponse, ExecutePaymentResponse, RefundResponse } from "./types";
import { SwitchboardPaymentProvider } from "./Switchboard.provider";

export class PaymentService {
    private static instance: PaymentService;
    private provider: PaymentProvider;

    private constructor() {
        // Defaulting to Switchboard as per architectural rules
        this.provider = new SwitchboardPaymentProvider();
    }

    public static getInstance(): PaymentService {
        if (!PaymentService.instance) {
            PaymentService.instance = new PaymentService();
        }
        return PaymentService.instance;
    }

    async createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse> {
        return this.provider.createPaymentIntent(data);
    }

    async executePayment(paymentIntentId: string, provider: string): Promise<ExecutePaymentResponse> {
        return this.provider.executePayment(paymentIntentId, provider);
    }

    async requestRefund(transactionId: string, amount?: number): Promise<RefundResponse> {
        return this.provider.requestRefund(transactionId, amount);
    }
}

export const paymentService = PaymentService.getInstance();
