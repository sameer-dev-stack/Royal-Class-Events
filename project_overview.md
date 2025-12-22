# Royal Class Events - Project Overview

## 👑 Introduction
**Royal Class Events** is a premium, AI-powered event management platform designed for curating and discovering exclusive experiences. Built with a focus on luxury aesthetics and high-end user experience, it serves both organizers ("Hosts") and attendees ("Guests").

The platform combines modern web technologies with granular control for event organizers, offering features like AI-assisted event creation, ticketing, and real-time management.

## ✨ Key Features

### For Attendees (Guests)
- **Discover Exclusive Events**: Browse a curated list of premium events (Galas, Tech Meetups, VIP Parties).
- **Search & Filter**: Find events by category, date, or location.
- **Easy Booking**: Seamless registration flow for Free and Paid events.
- **Digital Tickets**: Automaticaly generated QR codes for entry.
- **User Dashboard**: Manage booked tickets and view event details.

### For Organizers (Hosts)
- **AI Event Creator**: Generate detailed event titles, descriptions, and categories from a simple prompt using **Google Gemini AI**.
- **Interactive Dashboard**: Track registrations, revenue, and attendee lists in real-time.
- **Check-in System**: Built-in QR Code scanner to verify attendee tickets at the door.
- **Customization**:
  - **Cover Images**: Upload custom images or choose from Unsplash.
  - **Theme Colors**: "Royal Gold" default, with custom colors available for Pro users.
- **Ticket Management**: Set capacities, ticket types (Free/Paid), and prices.
- **Pro Features**: Upgrade to specific plans to unlock higher limits and custom branding.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: Lucide React
- **Animations**: CSS Animations & Transitions

### Backend & Database
- **Backend-as-a-Service**: [Convex](https://www.convex.dev/) (Real-time database, Functions, Storage)
- **Authentication**: [Clerk](https://clerk.com/) (User management & Auth)
- **Payment/Pro Logic**: Custom logic via Convex (Upgrade modals, limits).

### AI & Integrations
- **Artificial Intelligence**: Google Gemini (via `/api/generate-event`) for content generation.
- **QR Codes**: `html5-qrcode` / `react-qr-code` for ticketing.
- **Dates**: `date-fns` for handling time and dates.

## 📂 Database Schema Overview

The database (Convex) is structured into three main tables:

1.  **Users**
    *   Stores Clerk ID, profile info, and "Pro" status limits (e.g., `freeEventsCreated`).
2.  **Events**
    *   Stores event details (Title, Description, Dates, Location, Price).
    *   Indexed by `organizer`, `slug`, `category`, and `startDate`.
3.  **Registrations**
    *   Links Users to Events.
    *   Stores Ticket Status (`confirmed`, `cancelled`), `qrCode` data, and `checkedIn` status.

## 🚀 Getting Started

### Prerequisites
- Node.js installed.
- Convex account.
- Clerk account.
- Google Gemini API Key.

### Installation

1.  **Clone & Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Create a `.env.local` file with the following keys:
    ```env
    # Convex
    CONVEX_DEPLOYMENT=...
    NEXT_PUBLIC_CONVEX_URL=...

    # Clerk Auth
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
    CLERK_SECRET_KEY=...

    # Google Gemini AI
    GEMINI_API_KEY=...
    ```

3.  **Run Development Servers**
    You need to run both the frontend and backend terminals:

    **Terminal 1 (Backend)**:
    ```bash
    npx convex dev
    ```

    **Terminal 2 (Frontend)**:
    ```bash
    npm run dev
    ```

4.  **Open Project**
    Visit `http://localhost:3000` to view the application.
