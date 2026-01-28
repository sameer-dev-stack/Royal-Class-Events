# SwitchboardOS Integration: E2E Test Plan

## 1. Payment Intent Creation
- [ ] **Action**: Trigger checkout on `/checkout`.
- [ ] **Expectation**: POST request to `/api/payment/switchboard/init` succeeds.
- [ ] **Expectation**: `ticket_payments` table has a new record with `status: pending`.
- [ ] **Expectation**: User is redirected to the `checkoutUrl` provided by SBOS.

## 2. Webhook: Payment Success
- [ ] **Action**: Mock a POST to `/api/webhooks/switchboard` with `type: payment.success`.
- [ ] **Expectation**: `ticket_payments` record updates to `status: success`.
- [ ] **Expectation**: `registrations` record updates to `status: confirmed`.
- [ ] **Expectation**: `processed_webhooks` has a record for the `event_id`.

## 3. Webhook: Idempotency
- [ ] **Action**: Re-send the same `payment.success` webhook.
- [ ] **Expectation**: HTTP 200 returned immediately.
- [ ] **Expectation**: No duplicate processing or DB errors.

## 4. Webhook: Payment Failure
- [ ] **Action**: Mock a POST to `/api/webhooks/switchboard` with `type: payment.failed`.
- [ ] **Expectation**: `ticket_payments` record updates to `status: failed`.
- [ ] **Expectation**: `registrations` record updates to `status: cancelled`.

## 5. Webhook: Refund
- [ ] **Action**: Mock a POST to `/api/webhooks/switchboard` with `type: payment.refunded`.
- [ ] **Expectation**: `ticket_payments` record updates to `status: refunded`.
- [ ] **Expectation**: `registrations` record updates to `status: refunded`.

## 6. Security & Signature
- [ ] **Action**: Send webhook with invalid `x-switchboard-signature`.
- [ ] **Expectation**: HTTP 401 Unauthorized.
