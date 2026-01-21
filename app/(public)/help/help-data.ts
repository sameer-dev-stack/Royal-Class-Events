
import { HelpCircle, Shield, FileText, Briefcase, CreditCard, Sparkles } from "lucide-react";

export const HELP_CATEGORIES = [
    {
        id: "general",
        label: "General",
        icon: HelpCircle,
        description: "Basics about your account and attending events."
    },
    {
        id: "organizers",
        label: "For Organizers",
        icon: Briefcase,
        description: "Creating events, managing ticket sales, and payouts."
    },
    {
        id: "rules",
        label: "Platform Rules",
        icon: Shield,
        description: "Guidelines, community standards, and prohibited content."
    },
    {
        id: "payments",
        label: "Payments",
        icon: CreditCard,
        description: "Refunds, secure transactions, and billing."
    }
];

export const HELP_CONTENT = {
    general: [
        {
            question: "What is Royal Class Events?",
            answer: "Royal Class Events is a premium event management platform designed for exclusive, high-end experiences. We help organizers curate luxury events and allow attendees to discover and book VIP experiences seamlessly."
        },
        {
            question: "Is it free to join?",
            answer: "Yes! Signing up as an Attendee is completely free. You only pay for the tickets you purchase. Organizers can also join for free, with premium tools available for professional hosts."
        },
        {
            question: "How do I access my tickets?",
            answer: "After purchasing, your digital tickets are instantly available in the 'My Tickets' section of your profile. They include a unique QR code for seamless check-in at the venue."
        },
        {
            question: "Can I transfer my ticket to someone else?",
            answer: "Ticket transfer policies vary by event. Check the specific event details or contact the organizer directly through the event page to inquire about transfers."
        }
    ],
    organizers: [
        {
            question: "How do I become an organizer?",
            answer: "Simply go to your profile settings or click 'Create Event' and follow the prompt to upgrade your account to an Organizer. This unlocks the powerful Event Dashboard and Seat Engine tools."
        },
        {
            question: "What is the Royal Seat Engine?",
            answer: "It is our state-of-the-art drag-and-drop venue builder. You can design custom floor plans, assign reserved seating, VIP zones, and visualize your event layout in real-time."
        },
        {
            question: "When do I get paid for ticket sales?",
            answer: "Payouts are processed securely. Funds are typically available for withdrawal 3-5 business days after your event concludes, ensuring a secure experience for all parties."
        },
        {
            question: "Can I host free events?",
            answer: "Absolutely. You can host free events with full access to our registration and guest management tools at no cost."
        }
    ],
    rules: [
        {
            question: "What kind of events are allowed?",
            answer: "We welcome a wide range of events including galas, conferences, concerts, and workshops. However, all events must adhere to our 'Royal Standard' of quality and safety. We prohibit illegal gatherings, hate speech, or explicit content."
        },
        {
            question: "Community Guidelines",
            answer: "Respect and professionalism are paramount. Harassment, discrimination, or disruptive behavior at events or on the platform will result in immediate account suspension."
        },
        {
            question: "Content Policy",
            answer: "Event descriptions and images must be appropriate for a general audience. Misleading information or false advertising is strictly prohibited and monitored by our moderation team."
        },
        {
            question: "Cancellation Policy for Organizers",
            answer: "Organizers must provide at least 48 hours notice for cancellations unless due to force majeure. Repeated cancellations may affect your Organizer Score and platform privileges."
        }
    ],
    payments: [
        {
            question: "Is my payment information secure?",
            answer: "Yes. We use industry-leading payment processors (like SSLCommerz and Stripe) with bank-grade encryption. We do not store your full credit card details on our servers."
        },
        {
            question: "How do refunds work?",
            answer: "Refund policies are set by the event organizer (e.g., 'No Refunds', 'Refund up to 7 days before'). If an event is cancelled by the organizer, you receive a full automatic refund."
        },
        {
            question: "Are there booking fees?",
            answer: "A small service fee is applied to paid ticket transactions to maintain the platform's premium security and support services. This fee is unmistakably shown at checkout."
        }
    ]
};
