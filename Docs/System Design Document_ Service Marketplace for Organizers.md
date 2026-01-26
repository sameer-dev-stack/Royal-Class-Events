# System Design Document: Service Marketplace for Organizers

## 1. High-Level System Architecture

The proposed system architecture is a **Modular Monolith** with a clear separation of concerns, designed for rapid development and future scalability into a microservices architecture. This approach balances the need for quick iteration with the long-term goal of handling high transaction volume.

### 1.1. Architectural Overview

The system is structured into three main layers: the **Client Layer**, the **API/Application Layer**, and the **Data/Integration Layer**.

| Layer | Components | Primary Function |
| :--- | :--- | :--- |
| **Client Layer** | Customer Web Portal, Vendor Mobile App (PWA/Native), Admin Dashboard | User interaction, service browsing, booking, and vendor management. |
| **API/Application Layer** | API Gateway, Core Services (IAM, Catalog, Booking, Payment) | Business logic execution, request routing, security, and rate limiting. |
| **Data/Integration Layer** | Primary Database (PostgreSQL), Search Engine (Elasticsearch), External APIs (Payment, Calendar) | Persistent data storage, high-speed search, and secure external communication. |

### 1.2. Key Technical Components

| Component | Technology/Tool | Rationale |
| :--- | :--- | :--- |
| **Backend Framework** | Python (FastAPI/Django) or Node.js (Express) | High performance, large ecosystem, and suitability for rapid API development. |
| **Primary Database** | **PostgreSQL** | Robust, open-source, and supports advanced features like JSONB for flexible data and geospatial queries (for localized services). |
| **Search Engine** | **Elasticsearch** or **Algolia** | Essential for fast, relevant searching of service listings, vendor profiles, and reviews. |
| **Payment Gateway** | **Stripe Connect** or **PayPal for Marketplaces** | Handles complex marketplace payment flows, including escrow, commission calculation, and vendor payouts (critical for the service model). |
| **Scheduling/Calendar** | **Google Calendar API** / **Outlook API** | Enables real-time synchronization of vendor availability to prevent double-booking and manage service fulfillment. |
| **Notifications** | **Twilio** (SMS), **SendGrid** (Email), **Firebase** (Push) | Reliable, multi-channel communication for booking confirmations, reminders, and payment alerts. |

### 1.3. Core Services Breakdown

The Application Layer is divided into the following functional services:

1.  **Identity & Access Management (IAM) Service**: Manages all user (Customer) and vendor (Organizer) accounts, authentication (OAuth 2.0/JWT), and role-based access control (RBAC).
2.  **Catalog Service**: Manages the creation, editing, and retrieval of all service listings, categories, pricing models, and vendor profiles.
3.  **Booking & Scheduling Service**: The core of the service marketplace. It handles availability checks, booking requests, confirmation logic, and calendar synchronization.
4.  **Payment & Escrow Service**: Manages all financial transactions, including customer payment capture, holding funds in escrow, calculating platform commission, and initiating vendor payouts.
5.  **Review & Rating Service**: Stores and manages customer feedback, ensuring reviews are only possible after service completion.

---

## 2. Database Schema and Data Models

The core of the system relies on several interconnected data models. The following tables represent the primary entities in the PostgreSQL database.

### 2.1. User and Vendor Models

| Table Name | Primary Fields | Description |
| :--- | :--- | :--- |
| **Users** | `user_id` (PK), `email`, `password_hash`, `first_name`, `last_name`, `role` (Customer/Admin) | Stores customer and admin account information. |
| **Vendors** | `vendor_id` (PK), `user_id` (FK), `business_name`, `bio`, `service_area` (GeoJSON/PostGIS), `verification_status` (Pending/Verified/Suspended) | Stores organizer-specific details, including service location data. |
| **Vendor_Profiles** | `profile_id` (PK), `vendor_id` (FK), `portfolio_url`, `certifications` (JSONB), `bank_account_id` (Stripe Connect ID) | Stores detailed, often sensitive, vendor information and financial links. |

### 2.2. Service and Booking Models

| Table Name | Primary Fields | Description |
| :--- | :--- | :--- |
| **Services** | `service_id` (PK), `vendor_id` (FK), `title`, `description`, `category`, `pricing_model` (Fixed/Hourly/Quote), `base_price` | Defines the specific service offerings (e.g., "4-Hour Home Decluttering"). |
| **Bookings** | `booking_id` (PK), `user_id` (FK), `vendor_id` (FK), `service_id` (FK), `start_time`, `end_time`, `status` (Pending/Confirmed/Completed/Cancelled) | Tracks the lifecycle of a service request. |
| **Availability** | `availability_id` (PK), `vendor_id` (FK), `day_of_week`, `start_time`, `end_time`, `is_recurring` | Stores the vendor's general working hours and availability slots. |

### 2.3. Financial and Review Models

| Table Name | Primary Fields | Description |
| :--- | :--- | :--- |
| **Transactions** | `transaction_id` (PK), `booking_id` (FK), `amount`, `platform_fee`, `vendor_payout`, `status` (Held/Released/Refunded), `payment_intent_id` (Stripe ID) | Manages the escrow and commission logic for each booking. |
| **Reviews** | `review_id` (PK), `booking_id` (FK), `user_id` (FK), `vendor_id` (FK), `rating` (1-5), `comment`, `created_at` | Stores customer feedback, linked directly to a completed booking to ensure authenticity. |

---

## 3. Core Workflows and API Design

The success of the marketplace hinges on two critical workflows: **Vendor Onboarding** and **Booking & Payment**.

### 3.1. Vendor Onboarding Workflow

This workflow ensures that only qualified organizers can list services, establishing trust in the marketplace.

| Step | Actor | Description | API Endpoint (Example) |
| :--- | :--- | :--- | :--- |
| **1. Registration** | Vendor | Creates a user account and selects the "Vendor" role. | `POST /api/v1/auth/register` |
| **2. Profile Setup** | Vendor | Submits business details, service area, and links bank account (via Stripe Connect). | `POST /api/v1/vendors/profile` |
| **3. Verification** | Admin/System | Admin reviews documents; System performs background check and updates `verification_status`. | `PUT /api/v1/vendors/{id}/verify` |
| **4. Service Listing** | Vendor | Creates and publishes service packages with pricing and availability. | `POST /api/v1/catalog/services` |

### 3.2. Booking and Payment Workflow (Escrow Model)

This workflow is adapted from the Amazon/Daraz transaction model, but with a crucial escrow step to manage service delivery risk.

| Step | Actor | Description | API Endpoint (Example) |
| :--- | :--- | :--- | :--- |
| **1. Search & Select** | Customer | Finds a service and checks the vendor's real-time availability. | `GET /api/v1/catalog/search` |
| **2. Booking Request** | Customer | Submits a booking request for a specific time slot. | `POST /api/v1/bookings` |
| **3. Payment Capture** | Customer/System | Customer pays the full service fee. System captures the payment and holds it in **escrow**. | `POST /api/v1/payments/capture` |
| **4. Service Execution** | Vendor | Provides the service at the scheduled time. | (Offline Action) |
| **5. Completion Confirmation** | Customer | Customer confirms the service is complete and satisfactory. | `POST /api/v1/bookings/{id}/confirm_completion` |
| **6. Payout & Commission** | System | System releases the vendor's payout (Service Fee - Platform Commission) and finalizes the transaction. | `POST /api/v1/payments/payout` |
| **7. Review** | Customer | Customer is prompted to leave a review for the vendor. | `POST /api/v1/reviews` |

### 3.3. API Design Principles

*   **RESTful Design**: Use standard HTTP methods (GET, POST, PUT, DELETE) and clear resource naming.
*   **Version Control**: All APIs should be versioned (e.g., `/api/v1/`) to allow for non-breaking changes.
*   **Security**: Enforce JWT-based authentication for all protected endpoints.
*   **Rate Limiting**: Implement rate limiting on search and booking endpoints to prevent abuse.

---
