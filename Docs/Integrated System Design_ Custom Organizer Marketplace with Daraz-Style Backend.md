# Integrated System Design: Custom Organizer Marketplace with Daraz-Style Backend

This document outlines the architecture for a marketplace that combines a **Custom Interactive Frontend** (based on the Royal Seat Engine) with a **Robust Multi-Vendor Backend** (inspired by Daraz/Amazon).

## 1. The "Selling View" (Frontend Architecture)
The frontend is designed as a high-end, interactive experience for both Organizers (Vendors) and Attendees (Customers).

### 1.1. Interactive Seat & Venue Engine
*   **Technology**: Built with **Next.js** and **Konva.js** for a high-performance, infinite canvas experience.
*   **Organizer View (Builder)**: A dark-mode, professional editor for designing venue layouts, including:
    *   **Smart Seat Generation**: Grid-based and arc-based seating arrangements.
    *   **Asset Library**: Draggable architectural elements (Stages, Bars, Exits).
    *   **Category Management**: Global pricing and color syncing for different seat classes (VIP, General).
*   **Customer View (Viewer)**: A real-time, synced interface for booking:
    *   **Interactive Selection**: Click-to-select seats with live price updates.
    *   **LOD Rendering**: Performance optimization where individual seats hide when zoomed out, replaced by zone blocks.

### 1.2. Attendee Experience
*   **Royal Ticket Wallet**: A digital pass system with dynamic QR codes for entry.
*   **Grouped Tickets**: Multi-pass support for customers buying tickets for groups.
*   **Real-time Sync**: Powered by **Convex**, ensuring that once a seat is selected, it is locked across all users instantly.

---

## 2. The "Inner System" (Daraz-Style Backend)
While the frontend is custom, the backend follows the proven Daraz/Amazon multi-vendor operational model.

### 2.1. Vendor Management (Seller Center)
| Feature | Implementation Detail |
| :--- | :--- |
| **Onboarding** | Tiered verification (Identity -> Business License -> Bank Verification). |
| **Commission Engine** | Automated calculation of platform fees (e.g., 10-15%) per ticket sold. |
| **Payout System** | Integration with **Stripe Connect** for automated vendor payouts after event completion. |
| **Analytics** | Real-time sales dashboards, attendee demographics, and capacity tracking. |

### 2.2. Order & Fulfillment Logic
*   **Digital Fulfillment**: Unlike physical goods, "fulfillment" here is the generation of a secure, scannable ticket.
*   **Escrow Model**: Funds are held by the platform and released to the Organizer only after the event "Check-in" phase begins or ends, protecting customers from cancellations.
*   **Gate Scanner**: A dedicated mobile interface for Organizers to scan QR codes at the venue, syncing with the backend to mark attendees as "Checked In."

---

## 3. Technical Stack & Data Flow

### 3.1. The Stack
*   **Frontend**: Next.js (React), Tailwind CSS, Konva.js.
*   **Backend/Database**: Convex (Real-time NoSQL), PostgreSQL (for complex relational reporting).
*   **Payments**: Stripe Connect (Marketplace Edition).
*   **Infrastructure**: Vercel (Frontend), Python Intelligence Service (for advanced geometry/analytics).

### 3.2. Core Data Flow
1.  **Design**: Organizer uses the **Venue Builder** to create a layout.
2.  **Publish**: Layout is saved to **Convex**, and the event goes live on the marketplace.
3.  **Book**: Customer selects seats; **Convex** locks the seats in real-time.
4.  **Pay**: Payment is captured via **Stripe** and held in the platform's escrow account.
5.  **Fulfill**: System generates a **Royal Ticket** in the customer's wallet.
6.  **Verify**: At the event, Organizer uses the **Gate Scanner** to verify the ticket.
7.  **Payout**: Platform releases funds to the Organizer, minus the commission.

---

## 4. Strategic Recommendations
1.  **Role-Based Access**: Maintain a strict "Double-Lock" consistency for **Organizer** vs. **Attendee** roles to ensure security.
2.  **Mobile-First Scanner**: Ensure the Gate Scanner is optimized for low-light and high-speed scanning on mobile devices.
3.  **Scalability**: Use the LOD (Level of Detail) rendering logic to support venues with 10,000+ seats without browser lag.
