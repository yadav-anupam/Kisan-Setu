# Kisan Setu --- Technical Requirements Document (TRD)

**Problem Statement:** SIH26032\
**Product:** Kisan Setu --- Intelligent Agricultural Procurement & Queue
Management Platform\
**Document Version:** 1.0\
**Date:** 28 August 2026\
**Status:** Proposed Technical Architecture

------------------------------------------------------------------------

# 1. Purpose

This Technical Requirements Document defines the technical architecture,
components, APIs, database design, security model, AI/ML pipeline,
Trusted Execution Environment (TEE) integration, deployment strategy,
observability, testing, and operational requirements for Kisan Setu.

The TRD translates the product requirements into an implementable
engineering design.

------------------------------------------------------------------------

# 2. Technical Objectives

The system must:

1.  Support four major user groups:

    -   Farmer
    -   Staff
    -   Centre Admin
    -   Administrative Admin

2.  Provide secure authentication and role-based authorization.

3.  Support appointment and slot management.

4.  Provide real-time token and queue updates.

5.  Record the complete procurement lifecycle.

6.  Predict farmer waiting time using real-time and historical data.

7.  Protect security-critical computations using a TEE.

8.  Maintain tamper-evident audit records.

9.  Support mobile-first and desktop interfaces.

10. Scale from an SIH prototype to a multi-centre production deployment.

------------------------------------------------------------------------

# 3. High-Level Architecture

``` text
                         INTERNET
                            |
                    HTTPS / TLS 1.3
                            |
                    +-------v-------+
                    | Load Balancer |
                    +-------+-------+
                            |
                    +-------v-------+
                    | API Gateway   |
                    +-------+-------+
                            |
             +--------------+--------------+
             |                             |
      +------v------+               +------v------+
      | Next.js Web |               | WebSocket   |
      | Application |               | Gateway     |
      +-------------+               +------+------+
                                           |
                                  +--------v---------+
                                  | Backend Services |
                                  | NestJS |
                                  +--------+---------+
                                           |
             +-----------------------------+--------------------------+
             |              |              |             |             |
        +----v----+    +----v----+    +----v----+   +----v----+   +----v----+
        | Auth    |    | Queue   |    | Procure |   | Payment |   | Admin   |
        | Service |    | Service |    | Service |   | Service |   | Service |
        +---------+    +---------+    +---------+   +---------+   +---------+
             |              |              |             |
             +--------------+--------------+-------------+
                            |
                 +----------+----------+
                 |                     |
          +------v------+       +----------v----------+
          | PostgreSQL  |       | Redis/Upstash       |
          | Primary DB  |       |     Cache/Queue     |
          +-------------+       +---------------------+
                            |
                     +------v------+
                     | TEE Service  |
                     | Nitro       |
                     | Enclave     |
                     +------+------+
                            |
                     +------v------+
                     | AWS KMS      |
                     | Attestation  |
                     +-------------+

External integrations:
SMS / Push / Email / Payment APIs / Government APIs
```

------------------------------------------------------------------------

# 4. Architecture Style

## 4.1 Recommended Approach

Use a **modular monolith initially**, with clearly separated domain
modules.

Recommended backend modules:

``` text
auth
users
farmers
centres
appointments
tokens
queue
weighment
quality
procurement
payments
notifications
reports
audit
support
settings
ai
tee
```

This is preferable for the SIH prototype because it reduces deployment
complexity while preserving boundaries for later extraction into
microservices.

## 4.2 Production Evolution

If load requires it, independently scale:

-   Queue service.
-   Notification service.
-   AI inference service.
-   Reporting service.
-   Payment service.
-   TEE service.

------------------------------------------------------------------------

# 5. Frontend Architecture

## 5.1 Technology

-   Next.js
-   Tailwind CSS
-   shadcn/ui
-   Recharts
-   WebSocket client
-   PWA capabilities

## 5.2 Route Structure

``` text
/
├── about
├── how-it-works
├── features
├── for-farmers
├── for-centres
├── contact
├── login
├── register
│
├── farmer
│   ├── dashboard
│   ├── appointments
│   ├── book-slot
│   ├── queue
│   ├── procurement
│   ├── payments
│   ├── history
│   ├── notifications
│   ├── profile
│   └── support
│
├── staff
│   ├── dashboard
│   ├── queue
│   ├── tokens
│   ├── checkin
│   ├── procurement
│   ├── weighment
│   ├── quality
│   ├── payments
│   ├── appointments
│   ├── reports
│   ├── notifications
│   ├── centre-settings
│   ├── users-roles
│   └── support
│
├── centre-admin
│   ├── dashboard
│   ├── payments
│   ├── prices
│   ├── appointments
│   ├── tokens
│   ├── procurement
│   ├── weighment
│   ├── quality
│   ├── reports
│   ├── farmers
│   ├── staff
│   ├── notifications
│   ├── audit-logs
│   └── settings
│
└── admin
    ├── dashboard
    ├── centres
    ├── centre-verification
    ├── centre-categories
    ├── users-roles
    ├── staff
    ├── departments
    ├── permissions
    ├── system-settings
    ├── reports
    ├── announcements
    ├── notifications
    ├── audit-logs
    ├── support
    └── settings
```

------------------------------------------------------------------------

# 6. Authentication

## 6.1 Farmer Authentication

Primary method:

``` text
Mobile Number
      |
      v
OTP Request
      |
      v
OTP Verification
      |
      v
Access Token
```

## 6.2 Staff/Admin Authentication

Recommended:

-   Username/email + password.
-   MFA/OTP for privileged roles.
-   Session/device management.

## 6.3 Token Strategy

Use:

-   Short-lived access token.
-   Refresh token with rotation.
-   Secure HTTP-only cookie where appropriate.

Never store sensitive authentication secrets in localStorage.

------------------------------------------------------------------------

# 7. Authorization

Use RBAC plus resource-level authorization.

## Example

``` text
ROLE: STAFF

QUEUE_VIEW       ✓
QUEUE_MANAGE     ✓
TOKEN_ISSUE      ✓
WEIGHMENT_CREATE ✓
QUALITY_CREATE   ✓
PAYMENT_APPROVE  ✗
STAFF_MANAGE     ✗
SYSTEM_SETTINGS  ✗
```

Centre Admin is restricted to assigned centre(s).

Administrative Admin has global scope.

------------------------------------------------------------------------

# 8. Backend Architecture

## 8.1 Recommended Framework

**NestJS + Typescript**

Reasons:

-   Strong module architecture.
-   Dependency injection.
-   Guards and interceptors.
-   Validation support.
-   Good fit for RBAC.
-   WebSocket support.
-   Easy API documentation.

## 8.2 Module Structure

``` text
src/
├── auth/
├── users/
├── farmers/
├── centres/
├── appointments/
├── tokens/
├── queue/
├── weighment/
├── quality/
├── procurement/
├── payments/
├── notifications/
├── reports/
├── audit/
├── support/
├── settings/
├── ai/
├── tee/
├── common/
└── main.ts
```

------------------------------------------------------------------------

# 9. API Design

Base URL:

``` text
/api/v1
```

## Authentication

``` http
POST /auth/otp/request
POST /auth/otp/verify
POST /auth/login
POST /auth/refresh
POST /auth/logout
GET  /auth/me
```

## Farmer

``` http
GET    /farmers/me
PATCH  /farmers/me
GET    /farmers/me/history
GET    /farmers/me/procurements
GET    /farmers/me/payments
```

## Centres

``` http
GET /centres
GET /centres/:centreId
GET /centres/:centreId/availability
GET /centres/:centreId/queue
```

## Appointments

``` http
POST   /appointments
GET    /appointments
GET    /appointments/:id
PATCH  /appointments/:id
DELETE /appointments/:id
POST   /appointments/:id/check-in
```

## Tokens

``` http
POST  /tokens
GET   /tokens/:id
PATCH /tokens/:id/status
POST  /tokens/:id/call
POST  /tokens/:id/complete
```

## Weighment

``` http
POST /weighments
GET  /weighments/:id
PATCH /weighments/:id
```

## Quality

``` http
POST /quality-checks
GET  /quality-checks/:id
PATCH /quality-checks/:id
```

## Procurement

``` http
POST /procurements
GET  /procurements/:id
GET  /procurements
```

## Payments

``` http
POST /payments
GET  /payments/:id
POST /payments/:id/approve
POST /payments/:id/retry
GET  /payments
```

## Reports

``` http
GET /reports/procurement
GET /reports/queue
GET /reports/payments
GET /reports/quality
GET /reports/staff
GET /reports/appointments
```

## Notifications

``` http
GET   /notifications
PATCH /notifications/:id/read
POST  /notifications/mark-all-read
```

## Administration

``` http
GET    /admin/users
POST   /admin/users
PATCH  /admin/users/:id
GET    /admin/roles
POST   /admin/roles
GET    /admin/permissions

GET    /admin/centres
POST   /admin/centres
PATCH  /admin/centres/:id
POST   /admin/centres/:id/verify
```

------------------------------------------------------------------------

# 10. API Standards

All APIs should:

-   Use JSON.
-   Use HTTP status codes consistently.
-   Validate request payloads.
-   Return structured errors.
-   Include request/correlation ID.
-   Support pagination.
-   Support filtering and sorting.
-   Use idempotency for critical write operations.

## Standard Response

``` json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "req_123"
  }
}
```

## Standard Error

``` json
{
  "success": false,
  "error": {
    "code": "SLOT_FULL",
    "message": "Selected slot is no longer available."
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

------------------------------------------------------------------------

# 11. Database Architecture

Use PostgreSQL as the system of record.

Recommended schema groups:

``` text
identity
farmer
centre
appointment
queue
procurement
payment
notification
audit
support
analytics
```

## Main Tables

``` text
users
roles
permissions
user_roles
role_permissions

farmers
centres
centre_categories
departments
staff
counters

crops
crop_prices
appointments
slots
tokens

checkins
weighments
quality_checks
procurements
payments

notifications
announcements
support_tickets
audit_logs
```

------------------------------------------------------------------------

# 12. Database Relationships

``` text
User
 ├── Farmer
 └── Staff/Admin

Centre
 ├── Staff
 ├── Counters
 ├── Slots
 └── Appointments

Farmer
 └── Appointments

Appointment
 └── Token

Token
 ├── CheckIn
 ├── Weighment
 ├── QualityCheck
 └── Procurement

Procurement
 └── Payment
```

------------------------------------------------------------------------

# 13. Important Database Constraints

## Appointment

Prevent:

-   Double booking.
-   Booking outside operating hours.
-   Booking after slot capacity is reached.

## Token

Require:

-   Unique token per centre/date.
-   Valid appointment/check-in relationship.

## Procurement

Require:

-   Valid completed weighment.
-   Valid quality result.
-   Authorized rate.

## Payment

Require:

-   Valid procurement.
-   Unique transaction reference.
-   Valid approval permissions.

------------------------------------------------------------------------

# 14. Queue Engine

## 14.1 Queue State

Maintain:

``` text
WAITING
CALLED
PROCESSING
COMPLETED
NO_SHOW
CANCELLED
ON_HOLD
```

## 14.2 Queue Algorithm

Initial algorithm:

``` text
1. Validate appointment/check-in.
2. Retrieve eligible waiting tokens.
3. Apply authorized priority rules.
4. Sort by queue policy.
5. Assign next token to available counter.
6. Publish queue event.
7. Update position estimates.
```

## 14.3 Queue Integrity

The queue service must reject:

-   Duplicate token calls.
-   Unauthorized priority changes.
-   Calling a cancelled token.
-   Calling a token that is not eligible.
-   Cross-centre access.

------------------------------------------------------------------------

# 15. Real-Time Architecture

Use WebSocket/Socket.IO.

## Events

``` text
queue.updated
token.called
token.completed
counter.updated
appointment.updated
payment.updated
centre.announcement
notification.created
```

## Example

``` json
{
  "event": "queue.updated",
  "centreId": "C001",
  "currentToken": "A-35",
  "waitingCount": 12,
  "estimatedWaitMinutes": 32
}
```

------------------------------------------------------------------------

# 16. Redis/Upstash

Use Redis/Upstash for:

-   Queue state cache.
-   Session/rate-limit support.
-   Distributed locks.
-   Temporary OTP state.
-   WebSocket/Socket.IO scaling.
-   Short-lived AI features.

Do not treat Redis as the permanent system of record.

------------------------------------------------------------------------

# 17. Appointment Engine

Each centre defines:

``` text
operating_hours
slot_duration
slot_capacity
breaks
holidays
supported_crops
```

Availability:

``` text
capacity
- confirmed bookings
- reserved capacity
= remaining capacity
```

Use a database transaction when creating bookings to avoid
race-condition overbooking.

------------------------------------------------------------------------

# 18. Procurement Workflow

``` text
CHECKED_IN
   ↓
WEIGHMENT_COMPLETED
   ↓
QUALITY_ACCEPTED
   ↓
PROCUREMENT_CREATED
   ↓
AMOUNT_CALCULATED
   ↓
PAYMENT_PENDING
   ↓
PAYMENT_APPROVED
   ↓
PAYMENT_COMPLETED
```

Rejected quality results should create an exception state rather than
silently generating a normal payment.

------------------------------------------------------------------------

# 19. Weighment Module

Record:

-   Gross weight.
-   Tare weight.
-   Net weight.
-   Scale ID.
-   Operator.
-   Timestamp.
-   Optional measurement reference.

Calculation:

``` text
net_weight = gross_weight - tare_weight
```

The server must recalculate and validate the net weight rather than
trusting frontend calculations.

------------------------------------------------------------------------

# 20. Quality Module

Store:

-   Crop.
-   Grade.
-   Quality parameters.
-   Acceptance status.
-   Rejection reason.
-   Operator.
-   Timestamp.

Quality rules should be configurable by crop/season/authority policy.

------------------------------------------------------------------------

# 21. Payment Engine

Payment calculation input:

``` text
accepted_quantity
authorized_rate
quality_adjustment
deductions
other_policy_rules
```

Output:

``` text
gross_amount
deductions
net_amount
calculation_reference
verification_status
```

Critical calculation should be performed or verified inside the TEE.

------------------------------------------------------------------------

# 22. AI/ML Architecture

## 22.1 Training Pipeline

``` text
PostgreSQL
    ↓
Validated historical data
    ↓
Feature engineering
    ↓
Training dataset
    ↓
Model training
    ↓
Validation
    ↓
Model registry
    ↓
Approved model
```

## 22.2 Inference Pipeline

``` text
Current queue
Current counters
Historical features
Centre context
       ↓
Feature validation
       ↓
TEE
       ↓
ML inference
       ↓
Prediction + confidence
```

## 22.3 Initial Model

Start with:

-   Baseline queue formula.
-   Random Forest / Gradient Boosting / XGBoost.

Choose the model based on validation metrics rather than complexity.

## 22.4 Target Metrics

Measure:

-   MAE.
-   RMSE.
-   Median absolute error.
-   Prediction coverage.
-   Error by centre.
-   Error by time period.

------------------------------------------------------------------------

# 23. AI Feature Definition

Example feature vector:

``` json
{
  "farmersAhead": 12,
  "activeCounters": 4,
  "avgServiceMinutes": 7.2,
  "currentQueueLength": 18,
  "hour": 10,
  "dayOfWeek": 5,
  "estimatedQuantity": 48.2,
  "recentThroughput": 5.1,
  "staffAvailable": 8
}
```

Output:

``` json
{
  "estimatedWaitMinutes": 32,
  "confidence": 0.91,
  "modelVersion": "wait-v1.3"
}
```

------------------------------------------------------------------------

# 24. TEE Architecture

## 24.1 Recommended Platform

**AWS Nitro Enclaves**

Use a dedicated enclave for:

``` text
TEE Service
├── Payment verification
├── AI inference
├── Queue integrity validation
└── Audit signing
```

## 24.2 Parent/Enclave Model

``` text
EC2 Host
   |
   | VSock
   v
Nitro Enclave
```

The enclave must not be directly exposed to the public internet.

## 24.3 TEE Request Flow

``` text
Backend
   ↓
Validate request
   ↓
Encrypt/minimize payload
   ↓
VSock
   ↓
TEE
   ↓
Trusted computation
   ↓
Signed result
   ↓
Backend
```

------------------------------------------------------------------------

# 25. TEE AI Inference

The backend sends only the minimum features required for inference.

``` text
Backend
   ↓
Feature validation
   ↓
Encrypted payload
   ↓
TEE
   ↓
Approved model
   ↓
Prediction
   ↓
Attestation-aware result
   ↓
Backend
```

The model artifact should be versioned and integrity-checked.

------------------------------------------------------------------------

# 26. TEE Payment Verification

``` text
Weighment
    +
Quality
    +
Authorized price
    ↓
Backend validation
    ↓
TEE
    ↓
Calculation
    ↓
Rule validation
    ↓
Signed result
    ↓
Payment service
```

The frontend must never be trusted for payment amounts.

------------------------------------------------------------------------

# 27. TEE Attestation and KMS

Use remote attestation to establish that the expected enclave workload
is running.

Conceptually:

``` text
Enclave
   ↓
Attestation document
   ↓
Trusted verification
   ↓
AWS KMS policy evaluation
   ↓
Secret/key access
```

Cryptographic keys should not be embedded in application source code or
Docker images.

Only the enclave should receive secrets necessary for protected
operations.

------------------------------------------------------------------------

# 28. Audit Integrity

Every privileged event should include:

``` text
event_id
actor_id
role
centre_id
action
entity_type
entity_id
timestamp
request_id
metadata
previous_event_hash
event_hash
signature
```

Conceptual chain:

``` text
Event 1 → hash1
            ↓
Event 2 → hash(hash1 + event2)
            ↓
Event 3 → hash(hash2 + event3)
```

This creates a tamper-evident event chain.

------------------------------------------------------------------------

# 29. Security Architecture

## 29.1 Network

-   TLS 1.3 where supported.
-   Private subnets for backend/database.
-   Security groups/firewall rules.
-   No public database endpoint.
-   Restricted administrative access.

## 29.2 Secrets

Use:

-   AWS Secrets Manager.
-   AWS KMS.
-   Environment variables only for non-sensitive configuration.

## 29.3 Passwords

Use:

-   Argon2id or bcrypt.
-   Strong password policy.
-   Login throttling.

## 29.4 OTP

-   Short expiration.
-   Attempt limit.
-   Rate limit.
-   One-time use.
-   Never log OTP values.

------------------------------------------------------------------------

# 30. API Security

Implement:

-   Request validation.
-   Rate limiting.
-   Authentication guards.
-   Authorization guards.
-   CSRF protection where cookie authentication is used.
-   CORS allowlist.
-   Payload size limits.
-   SQL injection protection through ORM/parameterized queries.
-   Security headers.
-   Request IDs.

------------------------------------------------------------------------

# 31. Data Privacy

Minimize collection of personal data.

Sensitive fields should be encrypted where appropriate.

Access should be based on:

``` text
Role
+
Centre Scope
+
Resource Ownership
+
Permission
```

Example:

A Staff user at Centre A must not retrieve private records belonging to
Centre B.

------------------------------------------------------------------------

# 32. Notification Architecture

Use asynchronous jobs.

``` text
Business Event
      ↓
Notification Queue
      ↓
Notification Worker
      ├── SMS
      ├── Push
      └── Email
```

Store:

``` text
notification_id
recipient
channel
template
payload
status
sent_at
failure_reason
```

Retry transient failures.

------------------------------------------------------------------------

# 33. Reporting Architecture

For the MVP, reports can use PostgreSQL read queries/views.

For larger deployments:

``` text
PostgreSQL
    ↓
ETL / CDC
    ↓
Analytics Store
    ↓
Dashboards
```

Heavy analytics should not degrade transactional workloads.

------------------------------------------------------------------------

# 34. File Storage

Use object storage for:

-   Centre verification documents.
-   Receipts.
-   Support attachments.
-   Generated reports.

Recommended:

**Amazon S3**

Use private buckets and signed URLs.

------------------------------------------------------------------------

# 35. Search

Initial search:

-   PostgreSQL indexed search.

Search fields:

-   Centre name.
-   Centre code.
-   District.
-   Village.
-   PIN.
-   Crop.

For large-scale fuzzy search, introduce OpenSearch later.

------------------------------------------------------------------------

# 36. Caching Strategy

Cache:

-   Centre list.
-   Centre metadata.
-   Crop configuration.
-   Non-sensitive dashboard aggregates.
-   Static settings.

Do not cache sensitive payment results without strict controls.

Invalidate cache after configuration changes.

------------------------------------------------------------------------

# 37. Idempotency

Critical POST operations should support an idempotency key:

``` http
Idempotency-Key: 8f4a...
```

Required for:

-   Appointment creation.
-   Token generation.
-   Weighment submission.
-   Procurement creation.
-   Payment initiation.

A repeated request should return the original result instead of creating
duplicates.

------------------------------------------------------------------------

# 38. Transaction Management

Use database transactions for:

-   Slot booking.
-   Token creation.
-   Procurement creation.
-   Payment approval.
-   Role/permission changes.

Example:

``` text
BEGIN
  validate capacity
  reserve slot
  create appointment
  create token
COMMIT
```

If any step fails:

``` text
ROLLBACK
```

------------------------------------------------------------------------

# 39. Concurrency Control

Use:

-   PostgreSQL transactions.
-   Row-level locking.
-   Unique constraints.
-   Redis distributed locks only where appropriate.

Important concurrency cases:

-   Two farmers booking the last slot.
-   Two staff calling the same token.
-   Two admins approving the same payment.
-   Two operators submitting the same weighment.

------------------------------------------------------------------------

# 40. Observability

## Logs

Structured JSON logs:

``` json
{
  "timestamp": "...",
  "level": "INFO",
  "service": "queue",
  "requestId": "req_123",
  "event": "TOKEN_CALLED",
  "centreId": "C001"
}
```

Never log:

-   Passwords.
-   OTPs.
-   Payment secrets.
-   Private keys.
-   Sensitive personal information unnecessarily.

## Metrics

Track:

-   API latency.
-   Error rate.
-   Queue length.
-   Average waiting time.
-   Prediction error.
-   Payment failures.
-   Notification failures.
-   WebSocket connections.
-   TEE request latency.
-   TEE failure rate.

## Monitoring

Use:

-   CloudWatch.
-   Application Performance Monitoring.
-   Alerts for critical errors.

------------------------------------------------------------------------

# 41. Health Checks

Endpoints:

``` http
GET /health
GET /health/live
GET /health/ready
```

Readiness should verify required dependencies.

Do not expose sensitive dependency information publicly.

------------------------------------------------------------------------

# 42. Deployment Architecture

## Prototype

``` text
Developer
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Docker
   ↓
AWS
   ├── App
   ├── PostgreSQL
   ├── Redis
   └── TEE
```

## Production

``` text
Route 53
   ↓
CloudFront / Load Balancer
   ↓
API Gateway / ALB
   ↓
Application Runtime
   ├── Frontend
   ├── Backend
   ├── Workers
   └── WebSocket
        ↓
   Private Data Layer
   ├── PostgreSQL
   ├── Redis
   └── S3
        ↓
   Security Layer
   ├── KMS
   └── Nitro Enclave
```

------------------------------------------------------------------------

# 43. Containerization

Services should be containerized.

Example:

``` text
frontend
backend
worker
ml-service
tee-client
```

The actual Nitro enclave image should be built from a controlled and
versioned artifact.

------------------------------------------------------------------------

# 44. CI/CD

Pipeline:

``` text
Git Push
   ↓
Lint
   ↓
Unit Tests
   ↓
Security Scan
   ↓
Build
   ↓
Integration Tests
   ↓
Container Scan
   ↓
Deploy Staging
   ↓
Smoke Tests
   ↓
Approval
   ↓
Production
```

Use GitHub Actions.

------------------------------------------------------------------------

# 45. Environment Strategy

``` text
development
staging
production
```

Each environment should have separate:

-   Database.
-   Secrets.
-   API keys.
-   Storage.
-   TEE configuration.
-   Monitoring.

Never use production credentials in development.

------------------------------------------------------------------------

# 46. Testing Strategy

## Unit Tests

Test:

-   Queue rules.
-   Payment calculations.
-   Appointment capacity.
-   Permission checks.
-   Validation.
-   AI feature transformation.

## Integration Tests

Test:

-   API + database.
-   Appointment + token.
-   Procurement + payment.
-   Notification worker.
-   Redis/WebSocket.

## End-to-End Tests

Scenario:

``` text
Register
→ Book
→ Check-in
→ Queue
→ Weighment
→ Quality
→ Procurement
→ Payment
→ Receipt
```

## Security Tests

-   Authentication bypass.
-   IDOR/resource access.
-   RBAC bypass.
-   Rate-limit tests.
-   Input injection.
-   Session attacks.
-   Privilege escalation.

------------------------------------------------------------------------

# 47. Performance Requirements

Targets:

-   Standard API p95 under 500 ms where feasible.
-   Dashboard initial load under 3 seconds on normal broadband.
-   Queue event propagation within a few seconds.
-   Appointment booking must remain transactionally consistent under
    concurrent requests.
-   System must support horizontal application scaling.

------------------------------------------------------------------------

# 48. Reliability Requirements

Critical operations must be durable.

For failures:

``` text
Client
  ↓
Request
  ↓
Backend
  ↓
DB transaction
  ↓
Commit
  ↓
Event
```

Events should be retried safely.

Use an outbox/event pattern for important asynchronous events if
required.

------------------------------------------------------------------------

# 49. Offline / Poor Connectivity

Staff UI should:

-   Cache safe read-only information.
-   Retry failed requests.
-   Preserve unsent forms where safe.
-   Show synchronization status.

Critical financial operations should not be considered complete until
server-side confirmation is received.

TEE-dependent operations must fail closed.

------------------------------------------------------------------------

# 50. Disaster Recovery

Recommended targets for production planning:

-   Automated database backups.
-   Point-in-time recovery.
-   Cross-region backup strategy for critical deployments.
-   S3 versioning for important documents.
-   Recovery runbooks.

Initial target:

**RPO: ≤ 15 minutes**\
**RTO: ≤ 1 hour**

Exact values should be finalized based on operational requirements and
infrastructure budget.

------------------------------------------------------------------------

# 51. Data Retention

Retention policies should be configurable according to applicable
government/legal requirements.

Separate retention policies for:

-   Operational records.
-   Financial records.
-   Audit logs.
-   Notifications.
-   Support tickets.
-   Verification documents.
-   Model training data.

Deletion/anonymization must never break mandatory financial or audit
retention obligations.

------------------------------------------------------------------------

# 52. Accessibility

Frontend must provide:

-   Responsive layouts.
-   Keyboard navigation.
-   Semantic HTML.
-   Screen-reader-friendly labels.
-   High contrast.
-   Large touch targets.
-   Clear errors.
-   Accessible forms.

Farmer workflows should minimize typing.

------------------------------------------------------------------------

# 53. Localization

Implement i18n from the beginning.

Initial:

``` text
en-IN
hi-IN
```

Future languages should be added without changing business logic.

All user-facing strings should come from translation resources.

------------------------------------------------------------------------

# 54. API Documentation

Use OpenAPI/Swagger.

Every API should document:

-   Endpoint.
-   Authentication.
-   Request schema.
-   Response schema.
-   Error codes.
-   Authorization requirements.
-   Example payloads.

------------------------------------------------------------------------

# 55. Recommended Repository Structure

``` text
kisan-setu/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   └── ml/
│
├── tee/
│   ├── payment-engine/
│   ├── inference-engine/
│   ├── audit-signer/
│   └── enclave-config/
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   └── config/
│
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── schema/
│
├── infra/
│   ├── docker/
│   ├── terraform/
│   └── deployment/
│
├── docs/
└── README.md
```

------------------------------------------------------------------------

# 56. Recommended Engineering Sequence

## Phase 1 --- Foundation

-   Repository.
-   CI/CD.
-   Database.
-   Authentication.
-   RBAC.
-   UI shell.
-   Design system.

## Phase 2 --- Farmer

-   Registration.
-   Centre discovery.
-   Slot booking.
-   Dashboard.
-   Notifications.

## Phase 3 --- Centre Operations

-   Check-in.
-   Token.
-   Live queue.
-   Staff dashboard.
-   Weighment.
-   Quality.
-   Procurement.

## Phase 4 --- Payments

-   Payment calculation.
-   Approval.
-   Payment status.
-   Receipts.
-   Audit.

## Phase 5 --- AI

-   Historical data pipeline.
-   Waiting-time baseline.
-   ML model.
-   Inference API.
-   Evaluation.

## Phase 6 --- TEE

-   TEE client.
-   Enclave service.
-   Secure communication.
-   Attestation.
-   KMS integration.
-   TEE payment verification.
-   TEE AI inference.

## Phase 7 --- Administrative Layer

-   Centre management.
-   Verification.
-   User/role management.
-   Staff/departments.
-   Permissions.
-   System settings.
-   Reports.
-   Audit logs.

## Phase 8 --- Hardening

-   Security testing.
-   Load testing.
-   Failure testing.
-   Observability.
-   Backup/recovery.
-   Accessibility.
-   Localization.

------------------------------------------------------------------------

# 57. SIH Prototype Architecture

For a hackathon demonstration, keep the architecture manageable:

``` text
Next.js
   ↓
NestJS
   ↓
PostgreSQL + Redis/Upstash
   ↓
Python ML Service
   ↓
TEE Adapter
   ↓
Nitro Enclave (demo/cloud)
```

The TEE adapter should expose a stable internal interface:

``` text
tee.verifyPayment(...)
tee.predictWait(...)
tee.signAudit(...)
```

During local development, the same interface can be backed by a secure
simulation service. Production/demo cloud deployment can replace that
implementation with the actual enclave without changing the rest of the
application.

------------------------------------------------------------------------

# 58. Example Internal TEE Interface

``` typescript
interface TeeService {
  predictWait(input: WaitPredictionInput): Promise<WaitPredictionResult>;

  verifyPayment(input: PaymentVerificationInput):
    Promise<PaymentVerificationResult>;

  signAudit(input: AuditPayload):
    Promise<SignedAuditResult>;
}
```

The business logic should depend on this interface, not on
Nitro-specific implementation details.

------------------------------------------------------------------------

# 59. Example Payment Validation Contract

``` json
{
  "procurementId": "PROC-10291",
  "quantity": 48.2,
  "rate": 2125,
  "deductions": 0,
  "qualityStatus": "ACCEPTED"
}
```

TEE response:

``` json
{
  "procurementId": "PROC-10291",
  "grossAmount": 102425,
  "deductions": 0,
  "netAmount": 102425,
  "verified": true,
  "modelOrRuleVersion": "payment-rules-v1",
  "signature": "..."
}
```

The backend independently validates basic constraints and accepts the
TEE result only when verification succeeds.

------------------------------------------------------------------------

# 60. Example Audit Event

``` json
{
  "eventId": "AUD-98123",
  "actorId": "USR-001",
  "role": "CENTRE_ADMIN",
  "centreId": "C001",
  "action": "PAYMENT_APPROVED",
  "entityType": "PAYMENT",
  "entityId": "PAY-101",
  "timestamp": "2026-08-28T10:20:00Z",
  "teeVerified": true
}
```

------------------------------------------------------------------------

# 61. Key Technical Risks

## Risk 1 --- TEE complexity

**Mitigation:** Keep TEE isolated behind an adapter and introduce it
after the core platform works.

## Risk 2 --- Insufficient historical data for AI

**Mitigation:** Use a deterministic queue baseline and
synthetic/bootstrap data for initial model development; improve using
real validated data.

## Risk 3 --- Peak concurrency

**Mitigation:** PostgreSQL transactions, Redis, horizontal backend
scaling, WebSocket scaling, and load testing.

## Risk 4 --- Payment inconsistencies

**Mitigation:** Server-side calculation, idempotency, database
transactions, TEE verification, and audit records.

## Risk 5 --- Poor connectivity

**Mitigation:** Retry queues, safe local caching, idempotency, and clear
synchronization state.

## Risk 6 --- Unauthorized access

**Mitigation:** RBAC, resource-level authorization, MFA, audit logs, and
security testing.

------------------------------------------------------------------------

# 62. Technical Acceptance Criteria

The technical implementation is acceptable when:

1.  All role-specific routes are protected.
2.  Centre-level users cannot access unauthorized centres.
3.  Appointment capacity cannot be exceeded under concurrent requests.
4.  Duplicate payment/procurement requests are prevented.
5.  Queue state remains consistent under concurrent staff actions.
6.  Farmer queue status updates in near real time.
7.  Server recalculates financial values.
8.  AI inference returns a versioned prediction.
9.  TEE-critical operations fail closed when the trusted service is
    unavailable.
10. Privileged actions create tamper-evident audit events.
11. Sensitive secrets are managed outside source code.
12. Database backups and recovery procedures are available.
13. APIs are documented with OpenAPI.
14. Automated tests cover critical workflows.
15. Application logs and metrics support operational debugging.
16. Frontend is responsive and accessible.
17. Production deployment separates public and private infrastructure.

------------------------------------------------------------------------

# 63. Final Technical Architecture

``` text
                         KISAN SETU
                              |
                    +---------v---------+
                    | Next.js / PWA     |
                    +---------+---------+
                              |
                           HTTPS
                              |
                    +---------v---------+
                    | API Gateway / ALB |
                    +---------+---------+
                              |
                    +---------v---------+
                    | NestJS Application|
                    | Modular Backend   |
                    +---------+---------+
                              |
      +-----------+-----------+-----------+-----------+
      |           |           |           |           |
     Auth       Queue      Procurement  Payment      Admin
      |           |           |           |           |
      +-----------+-----------+-----------+-----------+
                              |
                    +---------+---------+
                    | PostgreSQL       |
                    | System of Record |
                    +---------+---------+
                              |
                    +---------v---------+
                    | Redis             |
                    | Cache / Locks     |
                    +-------------------+

                              |
                    Security-Critical Path
                              |
                    +---------v---------+
                    | TEE Adapter       |
                    +---------+---------+
                              |
                    +---------v---------+
                    | AWS Nitro Enclave |
                    |                   |
                    | AI Inference       |
                    | Payment Validation |
                    | Queue Integrity    |
                    | Audit Signing      |
                    +---------+---------+
                              |
                    +---------v---------+
                    | AWS KMS +         |
                    | Attestation       |
                    +-------------------+

External:
SMS / Push / Email / Payment / Government APIs
```

------------------------------------------------------------------------

# 64. Engineering Principle

The system should follow:

**Secure by design → Server authoritative → Event-driven where useful →
Real-time where valuable → AI-assisted → TEE-protected for critical
computation → Auditable end-to-end**

The core implementation priority is:

**Reliability first, security second, usability third, intelligence
fourth, and optimization continuously.**
