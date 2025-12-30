import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Send an email (MOCKED FOR DEV)
 */
export const sendEmail = internalAction({
    args: {
        to: v.string(),
        subject: v.string(),
        html: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`📧 [MOCK EMAIL] To: ${args.to} | Subject: ${args.subject}`);

        // Log to DB via internal mutation if we had one exposed, 
        // but actions can't easily call mutations without defining them.
        // For now, console log is sufficient for "Mock Everything" visible in dashboard logs.

        return { success: true, id: "mock-email-id" };
    },
});

/**
 * Send an SMS (MOCKED FOR DEV)
 */
export const sendSMS = internalAction({
    args: {
        to: v.string(),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        console.log(`📱 [MOCK SMS] To: ${args.to} | Body: ${args.body}`);
        return { success: true, id: "mock-sms-id" };
    },
});
