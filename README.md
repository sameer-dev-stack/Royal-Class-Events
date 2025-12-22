# Royal Class Events - Project Documentation

## 1. Executive Summary
**Royal Class Events** is a premium event management platform designed to offer a "Royal Gold" aesthetic and a seamless user experience. It leverages a modern, decoupled architecture to provide real-time updates, AI-powered insights, and secure payment processing. The platform caters to both event organizers—offering tools for creation, management, and analytics—and attendees, providing easy discovery and ticketing.

## 2. Technology Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** JavaScript / JSX
- **Styling:** Tailwind CSS v4, Shadcn UI (Customized for "Royal Gold" theme)
- **Authentication:** Clerk
- **State/Data Fetching:** Convex React Client

### Backend-as-a-Service (BaaS)
- **Platform:** Convex
- **Language:** JavaScript / TypeScript
- **Capabilities:** Real-time Database, Serverless Functions, File Storage
- **Key Files:** `convex/schema.js` (DB definition), `convex/actions` (Business Logic)

### AI Intelligence Service (Microservice)
- **Framework:** Python (FastAPI)
- **Purpose:** Predictive analytics for event demand, revenue forecasting, and dynamic pricing.
- **Key Logic:** `python-service/models/`

### AI Content Generation
- **Provider:** Google Gemini API
- **Purpose:** auto-generating event titles and descriptions based on user prompts.
- **Integration:** Next.js API Routes (`app/api/generate-event`)

### Infrastructure & Tools
- **Payments:** Stripe Integration
- **Ticketing:** `html5-qrcode` & `react-qr-code` for QR generation and scanning.
- **Linting:** ESLint

## 3. Architecture Overview

The system operates on a triangular architecture:

1.  **The Client (Next.js):** Handles UI, user interaction, and authentication. It subscribes to Convex queries for real-time data updates.
2.  **The Backend (Convex):** Acts as the central source of truth. It stores all persistent data (Users, Events, Tickets) and orchestrates complex workflows.
3.  **The Intelligence Engine (Python):** A stateless microservice. Convex calls this service to perform heavy calculations (e.g., forecasting revenue) and stores the results back in the database.

**Data Flow Example (Intelligence):**
> *User requests forecast* -> *Convex Action triggered* -> *Call Python Service* -> *Return prediction* -> *Update DB* -> *Client UI auto-updates*

## 4. Key Directory Structure

```text
/
├── app/                    # Next.js App Router pages & API routes
│   ├── (auth)/             # Authentication routes (Sign-in/up)
│   ├── (main)/             # Core application (Dashboard, My Events)
│   ├── (public)/           # Public-facing pages (Event details, Explore)
│   └── api/                # Next.js API endpoints (Gemini, Proxy)
├── components/             # Reusable UI components (Shadcn + Custom)
├── convex/                 # Backend logic & Database Schema
│   ├── schema.js           # Database Table definitions
│   └── intelligence.js     # Backend actions for AI service
├── python-service/         # Independent Python FastAPI microservice
│   ├── main.py             # Service entry point
│   └── models/             # Business logic for predictions
├── public/                 # Static assets (images, icons)
└── hooks/                  # Custom React hooks (Convex + Store)
```

## 5. Data Model (Convex Schema)

The database is schema-enforced via `convex/schema.js`. Key tables include:

- **users**: Stores user profiles and stripe IDs.
- **events**: Core event data (title, date, price, total tickets).
- **registrations**: Links users to events (tickets).
- **payments**: Tracks Stripe transaction statuses.

## 6. Key Features

- **AI Event Generation**: Organizers can input a simple prompt, and Google Gemini generates a full event title and description.
- **Smart Analytics**: The Python service provides "Demand Scores" and "Revenue Forecasts" to help organizers optimize their events.
- **Dynamic Pricing**: Algorithms suggest optimal ticket prices based on market factors.
- **QR Ticketing**: Integrated QR code generation for attendees and a scanner for organizers to validate tickets at the door.
- **Real-time Search**: Instant search capabilities for finding events by location or name.

## 7. Current Work in Progress
- **Explore Page UI**: Ongoing refinements to the "Featured Events" carousel, specifically focusing on the banner/border image presentation to ensure visual consistency (`app/(public)/explore/page.jsx`).
