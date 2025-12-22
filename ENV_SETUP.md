# Environment Configuration Guide

## Required Environment Variables

Add these to your `.env.local` file:

### Python Intelligence Service
```env
PYTHON_SERVICE_URL=http://localhost:8000
```

This URL points to the Python microservice that provides AI predictions. Keep it as `http://localhost:8000` for local development.

### JWT Secret for QR Codes (Optional - for Phase 3)
```env
QR_JWT_SECRET=your_random_secret_minimum_32_characters_long
```

Generate a secure random string for signing QR codes.

### Stripe (Optional - for Phase 3)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Required only when implementing Stripe Connect for split payments.

## Verification

After adding `PYTHON_SERVICE_URL` to `.env.local`:

1. Restart your Next.js development server
2. Restart Convex dev server
3. The Convex actions should now be able to call the Python service
