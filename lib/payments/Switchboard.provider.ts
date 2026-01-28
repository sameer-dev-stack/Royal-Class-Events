import { PaymentProvider, PaymentIntentRequest, PaymentIntentResponse, ExecutePaymentResponse, RefundResponse } from "./types";
import { SignJWT } from "jose";

export class SwitchboardPaymentProvider implements PaymentProvider {
    name = "switchboard";
    private baseUrl: string;
    private jwtSecret: string;

    constructor() {
        this.baseUrl = process.env.SWITCHBOARD_BASE_URL || "https://api.switchboardos.com";
        this.jwtSecret = process.env.SWITCHBOARD_S2S_JWT_SECRET || "";
    }

    private async generateToken() {
        const secret = new TextEncoder().encode(this.jwtSecret);
        return await new SignJWT({ iss: "royal-class-events" })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("5m")
            .sign(secret);
    }

    private async request(path: string, options: RequestInit = {}) {
        const token = await this.generateToken();
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...options,
            headers: {
                ...options.headers,
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Switchboard Error: ${response.statusText}`);
        }

        return response.json();
    }

    async createPaymentIntent(data: PaymentIntentRequest): Promise<PaymentIntentResponse> {
        return this.request("/v1/payment-intents", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async executePayment(paymentIntentId: string, provider: string): Promise<ExecutePaymentResponse> {
        return this.request("/v1/payments/execute", {
            method: "POST",
            body: JSON.stringify({ paymentIntentId, provider }),
        });
    }

    async requestRefund(transactionId: string, amount?: number): Promise<RefundResponse> {
        return this.request("/v1/refunds", {
            method: "POST",
            body: JSON.stringify({ transactionId, amount }),
        });
    }
}
