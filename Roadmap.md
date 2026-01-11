# 🚀 Roadmap: Royal Class Marketplace

### 🏗️ Phase 29: Marketplace Foundation (Database & Identity)
**Goal:** Enable users to become "Suppliers" and store their business data.
*   **Task 29.1:** Update `convex/schema.ts` with `suppliers`, `services`, `leads`, `reviews` tables.
*   **Task 29.2:** Update `users` table role enum to include `supplier`.
*   **Task 29.3:** Build **Supplier Onboarding Flow** (`/supplier/join`):
    *   Step 1: Business Category (Venue, Decor, Catering).
    *   Step 2: Basic Info (Name, City, Cover Photo).
    *   Step 3: Pricing Model (Per Hour / Per Day / Packages).

### 🏪 Phase 30: The Storefront (Public Profiles)
**Goal:** Create high-SEO, premium profile pages for vendors.
*   **Task 30.1:** Build `app/marketplace/vendor/[slug]/page.tsx`.
*   **Task 30.2:** **Portfolio Gallery:** A masonry grid layout for high-res images/videos.
*   **Task 30.3:** **Service Cards:** "Silver Package", "Gold Package" display with pricing.
*   **Task 30.4:** **Availability Calendar:** A readonly calendar showing booked dates (synced with bookings).

### 💬 Phase 31: The RFQ Engine (Leads & Chat)
**Goal:** Replace "Add to Cart" with "Negotiate & Quote" for services.
*   **Task 31.1:** Build **"Request Quote" Modal** on Storefront.
*   **Task 31.2:** Build **Real-time Chat Interface** (`app/(dashboard)/messages/[leadId]`).
    *   Features: Text msg, Attachments, **"Send Custom Offer"** UI for Suppliers.
*   **Task 31.3:** **Offer Acceptance:** Client clicks "Accept Offer" $\to$ Triggers Payment Flow.

### 💼 Phase 32: Supplier Dashboard (The Command Center)
**Goal:** Give vendors tools to manage their business.
*   **Task 32.1:** Create `app/supplier/dashboard/page.tsx`.
*   **Task 32.2:** **Leads CRM:** Drag-and-drop Kanban board (New $\to$ Quoted $\to$ Booked).
*   **Task 32.3:** **Calendar Manager:** Block dates manually.
*   **Task 32.4:** **Analytics:** "Profile Views" and "Conversion Rate" charts.

### 💰 Phase 33: Escrow & Finance (The Trust Layer)
**Goal:** Secure high-value transactions.
*   **Task 33.1:** Implement **Milestone Payments** logic in backend.
    *   *Logic:* 20% Advance (Held in Platform) $\to$ Event Completion $\to$ Payout.
*   **Task 33.2:** Build **Wallet / Payouts** page for Suppliers (`/supplier/finance`).
    *   *Action:* "Request Withdrawal" button.

### 🤖 Phase 34: AI Recommendations (Differentiation)
**Goal:** Smart matchmaking.
*   **Task 34.1:** Implement **Vector Search** in Convex for Supplier Descriptions.
*   **Task 34.2:** Build **"Royal AI Planner"** Chatbot.
    *   *Input:* "I need a Wedding Venue in Dhaka for 500 guests."
    *   *Output:* Suggests 3 Verified Venues matching the criteria.

---

### 🎯 Immediate Priority: Phase 29 (Foundation)
We cannot build the UI until the Database supports `Suppliers`.
**Shall we start with Task 29.1 (Schema Update)?** 🏗️