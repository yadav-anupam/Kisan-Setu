# Kisan Setu — Implementation Plan

**Backend:** NestJS + PostgreSQL + Redis/Upstash  
**Architecture:** Modular, role-based, event-driven, AI-assisted  
**Version:** 1.0  
**Date:** 28 August 2026

---

# 1. Purpose

This document converts the Kisan Setu PRD, TRD, application flow, UI/UX brief, and backend schema into an executable development roadmap.

The implementation is divided into controlled phases so that the team can first establish a reliable transactional core and then add real-time queue management, procurement, payments, AI prediction, TEE verification, analytics, and administration.

---

# 2. Implementation Objectives

The implementation must deliver:

1. A responsive public website.
2. Secure farmer registration/login.
3. Farmer appointment booking.
4. Real-time queue and token management.
5. Staff workflow from check-in to procurement.
6. Weighment and quality-check workflows.
7. Transparent procurement calculations.
8. Payment processing and verification.
9. Centre administration.
10. Platform-level administrative management.
11. AI-based waiting-time prediction.
12. TEE-backed sensitive computation where required.
13. Complete auditability.
14. Notifications and support.
15. Production-ready security, monitoring, backup, and recovery.

---

# 3. Technology Stack

## Frontend

Recommended:

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui or equivalent component system
TanStack Query
React Hook Form
Zod
WebSocket client
```

## Backend

```text
NestJS
TypeScript
PostgreSQL
Prisma or TypeORM
Redis / Upstash
WebSocket Gateway
JWT
RBAC
Swagger/OpenAPI
```

## AI

```text
Python
FastAPI
scikit-learn
Pandas
NumPy
MLflow or equivalent model registry
```

## TEE

Use a TEE-compatible execution environment according to the selected deployment platform.

TEE integration should be isolated behind a backend adapter.

## Infrastructure

```text
Docker
CI/CD
Managed PostgreSQL
Upstash Redis
Object Storage
Secrets Manager
Monitoring
Centralized Logs
```

---

# 4. Team Structure

A small implementation team can use:

| Role | Responsibility |
|---|---|
| Product/Project Lead | Scope, priorities, acceptance |
| UI/UX Designer | Design system and flows |
| Frontend Developer | Web application |
| Backend Developer | NestJS APIs and workflows |
| Database Engineer | PostgreSQL schema, indexes, migrations |
| AI/ML Engineer | Prediction pipeline |
| Security/TEE Engineer | TEE and security architecture |
| QA Engineer | Functional, integration, performance testing |
| DevOps Engineer | Deployment, CI/CD, monitoring |

For a student/SIH team, several roles can be combined.

---

# 5. Development Strategy

Use an incremental vertical-slice approach.

Instead of building every frontend page first and every backend module later:

```text
Feature
  ↓
UI
  ↓
API
  ↓
Database
  ↓
Validation
  ↓
Testing
  ↓
Integration
```

Example:

```text
Appointment Booking
→ Farmer UI
→ API
→ Slot DB
→ Redis lock
→ Appointment creation
→ Token creation
→ Notification
→ Testing
```

This ensures every completed feature actually works end-to-end.

---

# 6. Phase 0 — Project Setup

## Tasks

- Create Git repository.
- Define branch strategy.
- Initialize frontend.
- Initialize NestJS backend.
- Configure TypeScript.
- Configure linting and formatting.
- Configure environment variables.
- Create Docker development environment.
- Create PostgreSQL development database.
- Create Upstash/Redis development instance.
- Configure API documentation.
- Create CI pipeline.

## Repository

Recommended monorepo:

```text
kisan-setu/
├── apps/
│   ├── web/
│   └── api/
├── services/
│   └── ai/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── config/
│   └── validation/
├── infrastructure/
├── docs/
└── README.md
```

---

# 7. Environment Configuration

Create:

```text
.env.development
.env.test
.env.staging
.env.production
```

Backend variables:

```text
DATABASE_URL
REDIS_URL
JWT_SECRET
JWT_REFRESH_SECRET
API_URL
FRONTEND_URL
OBJECT_STORAGE_BUCKET
OBJECT_STORAGE_ENDPOINT
SMS_PROVIDER_KEY
EMAIL_PROVIDER_KEY
PAYMENT_PROVIDER_KEY
TEE_ENDPOINT
TEE_PUBLIC_KEY
```

Secrets must never be committed to Git.

---

# 8. Phase 1 — Database Foundation

## Tasks

Implement migrations for:

```text
users
roles
permissions
user_roles
role_permissions
farmer_profiles
staff_profiles
centres
departments
user_centre_assignments
```

Then add:

```text
centre_categories
centre_category_mappings
centre_documents
centre_verifications
counters
centre_operating_hours
crops
centre_crops
```

## Deliverables

- PostgreSQL schema.
- Migration scripts.
- Seed data.
- Development fixtures.
- Database health check.

---

# 9. Phase 2 — Authentication & Authorization

## Authentication

Implement:

```text
Registration
Login
OTP
Refresh token
Logout
Password reset if required
Session management
```

## Authorization

Implement:

```text
JWT Guard
Roles Guard
Permissions Guard
Centre Scope Guard
```

Roles:

```text
FARMER
STAFF
CENTRE_ADMIN
ADMIN
AUDITOR
SUPPORT
```

## Security

Implement:

- Password hashing.
- Token rotation.
- Refresh-token hashing.
- OTP hashing.
- Rate limiting.
- Login attempt protection.
- Account suspension.
- Secure error responses.

---

# 10. Phase 3 — Public Website

Build:

```text
Home
About Us
How It Works
Features
For Farmers
For Centres
Contact Us
```

## Requirements

- Mobile-first responsive layout.
- Clear CTA for farmer registration.
- Centre discovery.
- Explain appointment/token workflow.
- Explain AI prediction.
- Explain security/TEE concept in simple language.
- Accessibility support.
- Loading/error states.

---

# 11. Phase 4 — Farmer Module

Implement farmer dashboard.

Core pages:

```text
Dashboard
Book New Slot
Live Queue
My Procurement
Payments
History
Notifications
Profile
Help & Support
```

## Dashboard

Show:

```text
Upcoming appointment
Token
Queue position
Estimated waiting time
Procurement summary
Payment summary
Important notifications
```

---

# 12. Phase 5 — Appointment Booking

## Backend

Create:

```text
appointment_slots
appointments
tokens
```

## Booking Flow

```text
Farmer selects centre
       ↓
Selects crop
       ↓
Selects date
       ↓
Selects slot
       ↓
Enters expected quantity
       ↓
Backend validates
       ↓
Slot lock acquired
       ↓
PostgreSQL transaction
       ↓
Appointment created
       ↓
Token generated
       ↓
Notification created
       ↓
Redis queue updated
```

## Concurrency

Use:

```text
Redis lock
+
PostgreSQL transaction
+
row-level locking
+
unique constraints
```

---

# 13. Phase 6 — Live Queue

Implement:

```text
Queue state
Token status
Queue events
Counter assignment
Call next token
Hold
Resume
Recall
Skip
Complete
```

## Real-Time Architecture

```text
Staff Action
     ↓
NestJS
     ↓
PostgreSQL
     ↓
Outbox Event
     ↓
Redis
     ↓
WebSocket
     ↓
Farmer + Staff UI
```

## Failure Rule

If WebSocket or Redis fails:

```text
Core transaction remains correct
```

Clients can refetch current state.

---

# 14. Phase 7 — Staff Workflow

Implement Staff Dashboard:

```text
Live Queue
Token Management
Farmer Check-in
Procurement
Weighment
Quality Check
Payments
Appointments
Reports & Analytics
Notifications
Centre Settings
Help & Support
```

---

# 15. Phase 8 — Farmer Check-In

Flow:

```text
Appointment
    ↓
Farmer arrives
    ↓
QR/OTP/manual verification
    ↓
Staff confirms identity
    ↓
Check-in record
    ↓
Appointment → CHECKED_IN
    ↓
Token → IN_QUEUE
    ↓
Queue updated
```

Prevent duplicate check-ins.

---

# 16. Phase 9 — Weighment

## Workflow

```text
Token called
    ↓
Weight captured
    ↓
Gross weight
    ↓
Tare weight
    ↓
Net weight calculated
    ↓
Staff verifies
    ↓
Weighment saved
```

Server calculation:

```text
net = gross - tare
```

Do not trust a client-provided net amount.

---

# 17. Phase 10 — Quality Check

Implement:

```text
quality_rules
quality_checks
```

Quality screen should show:

- Crop.
- Weight.
- Applicable quality criteria.
- Input fields.
- Grade.
- Accept/reject decision.
- Reason.
- Reviewer information.

Backend validates quality rules independently.

---

# 18. Phase 11 — Procurement

## Flow

```text
Check-in
  ↓
Weighment
  ↓
Quality accepted
  ↓
Resolve price rule
  ↓
Calculate gross amount
  ↓
Apply authorized deductions
  ↓
Calculate net amount
  ↓
Create procurement
  ↓
Create payment record
```

Calculation:

```text
Gross Amount =
Accepted Quantity × Historical Applicable Rate

Net Amount =
Gross Amount − Authorized Deductions
```

Use PostgreSQL `NUMERIC` for money.

---

# 19. Phase 12 — Payments

Implement:

```text
Payment record
Payment verification
Approval
Processing
Completion
Failure
Reversal
Receipt
```

## Security

The frontend must never be trusted for:

```text
payment amount
price
deductions
procurement status
approval authority
```

The backend recalculates and verifies everything.

---

# 20. Phase 13 — TEE Integration

TEE should be introduced after the core transactional flow works.

## Recommended Initial Use

Sensitive calculation/verification:

```text
Procurement amount verification
Payment calculation verification
AI inference involving protected data
```

## Integration

Create:

```text
TEEService
TEEAdapter
TEEVerificationService
```

Flow:

```text
NestJS
   ↓
Prepare minimal input
   ↓
TEE
   ↓
Calculation / inference
   ↓
Attestation
   ↓
Hash + verification metadata
   ↓
PostgreSQL
```

Store:

```text
calculation_hash
attestation_reference
model_version
rule_version
tee_signature
```

Do not put TEE-specific logic throughout the application.

---

# 21. Phase 14 — AI Waiting-Time Prediction

## Data Sources

Use historical operational data:

```text
centre
day
time
number of active tokens
queue length
average processing time
department load
appointment density
crop/category
historical delays
no-show rate
```

Avoid unnecessary personal attributes.

## Training Pipeline

```text
PostgreSQL
   ↓
Feature extraction
   ↓
Dataset validation
   ↓
Training
   ↓
Evaluation
   ↓
Model registry
   ↓
Approved model
   ↓
Prediction API
```

---

# 22. Prediction API

Example:

```text
POST /api/v1/ai/queue/predict
```

Input:

```json
{
  "centreId": "...",
  "tokenId": "...",
  "queueLength": 12
}
```

Output:

```json
{
  "predictedWaitSeconds": 1850,
  "confidenceScore": 0.87,
  "modelVersion": "queue-v1.3"
}
```

Store every important prediction in:

```text
queue_predictions
```

---

# 23. AI Fallback Strategy

If the AI service is unavailable:

```text
TEE/AI Prediction
      ↓ failure
Historical average
      ↓ failure
Rule-based estimate
```

The UI should continue functioning.

Never block queue operations because AI is unavailable.

---

# 24. Phase 15 — Centre Admin

Implement:

```text
Dashboard
Staff Management
Departments
Notifications
Audit Logs
Settings
Price Rules
Payments
Reports
Centre Configuration
```

## Staff Management

Features:

```text
Add staff
Edit staff
Assign department
Assign role
Activate/deactivate
View activity
```

## Centre Settings

Features:

```text
Operating hours
Capacity
Counters
Supported crops
Quality configuration
Notification preferences
Queue configuration
```

---

# 25. Phase 16 — Administrative Admin

Implement platform-level dashboard.

Pages:

```text
Dashboard
Centre Management
Add New Centre
Centre Verification
Centre Categories
User & Role Management
Staff Management
Departments
Permission Management
System Settings
Audit Logs
Reports & Analytics
Announcements
Notifications
Help & Support
```

---

# 26. Centre Management

Implement:

```text
Centre list
Centre details
Add centre
Edit centre
Verification
Approve
Reject
Suspend
Activate
Category assignment
Document management
```

Centre lifecycle:

```text
DRAFT
  ↓
PENDING_VERIFICATION
  ↓
APPROVED
  ↓
ACTIVE
```

Alternative:

```text
PENDING_VERIFICATION
  ↓
REJECTED
  ↓
NEEDS_CHANGES
  ↓
PENDING_VERIFICATION
```

---

# 27. Role & Permission Management

Implement granular permissions:

```text
resource.action
```

Example:

```text
payment.read
payment.approve
centre.verify
staff.manage
audit.read
settings.manage
```

Permissions should be checked server-side.

UI visibility is not security.

---

# 28. Phase 17 — Notifications

Implement notification engine.

Events:

```text
Appointment confirmed
Appointment cancelled
Slot reminder
Queue position changed
Token called
Token delayed
Procurement completed
Payment approved
Payment completed
Centre announcement
Security alert
```

Channels:

```text
In-app
Push
SMS
Email
```

Use Redis queues for asynchronous delivery.

---

# 29. Phase 18 — Reports & Analytics

## Farmer

```text
Procurement history
Payment history
Quantity trends
```

## Staff

```text
Daily throughput
Average processing time
Queue load
Quality outcomes
```

## Centre Admin

```text
Daily procurement
Revenue/payment summary
Queue performance
Staff performance
```

## Administrative Admin

```text
Centre comparison
Total procurement
Total farmers served
Payment statistics
System usage
Centre health
Operational bottlenecks
```

---

# 30. Phase 19 — Audit Logging

Every sensitive action should produce an audit event.

Implement:

```text
AuditInterceptor
AuditService
AuditRepository
```

Important events:

```text
Authentication
Role change
Permission change
Centre verification
Price modification
Queue override
Weight correction
Quality override
Procurement adjustment
Payment approval
Payment reversal
Settings changes
Data export
```

Use append-only storage.

---

# 31. Phase 20 — Help & Support

Implement:

```text
Support tickets
Ticket categories
Priority
Assignment
Conversation/messages
Resolution
Notifications
```

Flow:

```text
User
 ↓
Create ticket
 ↓
Support queue
 ↓
Assign
 ↓
Resolve
 ↓
Close
```

---

# 32. Phase 21 — Frontend Integration

Connect every UI screen to real APIs.

Replace mock data systematically:

```text
Mock Dashboard
      ↓
GET /dashboard
      ↓
Real PostgreSQL data
```

Every screen must include:

```text
Loading
Empty
Success
Error
Retry
Unauthorized
Forbidden
```

---

# 33. Phase 22 — Redis Integration

Use Redis/Upstash for:

### Cache

```text
Centre list
Centre details
Supported crops
Price lookup
Dashboard summaries
```

### Temporary State

```text
OTP
Session-related state
Short-lived verification state
```

### Queue

```text
Active queue
Realtime state
```

### Locks

```text
Slot booking
Token operations
Payment idempotency
```

### Rate Limits

```text
Login
OTP
Public APIs
Sensitive endpoints
```

---

# 34. Cache Invalidation

Do not allow stale critical information.

Invalidate cache after:

```text
Centre update
Price change
Slot change
Queue state change
Settings update
Role/permission update
```

Financial records should normally be fetched from PostgreSQL or carefully cached with explicit invalidation.

---

# 35. Phase 23 — API Documentation

Use Swagger/OpenAPI.

Document:

```text
Authentication
Request DTOs
Response schemas
Errors
Permissions
Pagination
Rate limits
WebSocket events
```

Every endpoint must specify:

```text
Authorization
Input
Output
Errors
Example
```

---

# 36. Phase 24 — Testing Strategy

## Unit Tests

Test:

```text
Services
Calculations
Validators
Permission rules
Prediction fallback
Queue state transitions
```

## Integration Tests

Test:

```text
API + PostgreSQL
API + Redis
Appointment booking
Queue transitions
Procurement
Payment
Audit
```

## E2E Tests

Critical flows:

```text
Farmer registration
→ Booking
→ Check-in
→ Queue
→ Weighment
→ Quality
→ Procurement
→ Payment
```

---

# 37. Concurrency Testing

Specifically test:

```text
Two farmers booking last slot
Two staff calling next token
Two payment approvals
Duplicate payment request
Duplicate procurement request
Multiple WebSocket updates
Redis failure during booking
Database transaction rollback
```

Expected result:

```text
No duplicate booking
No duplicate token
No duplicate payment
No inconsistent financial record
```

---

# 38. Security Testing

Perform:

```text
Authentication testing
Authorization testing
IDOR testing
SQL injection testing
XSS testing
CSRF testing where applicable
Rate-limit testing
JWT testing
Session testing
File upload testing
Privilege escalation testing
```

Important:

```text
Farmer A must never access Farmer B's data.
Staff from Centre A must not access Centre B's operational data.
Centre Admin must not perform platform-admin operations.
```

---

# 39. Performance Targets

Initial targets:

| Metric | Target |
|---|---:|
| Normal API response | < 500 ms |
| Cached read | < 150 ms |
| Queue update | < 1–2 sec end-to-end |
| Database transaction | < 500 ms typical |
| Prediction response | < 2 sec |
| Error rate | < 1% |
| Core availability | 99.5%+ target |

Targets should be validated using realistic load tests.

---

# 40. Load Testing

Simulate:

```text
100 concurrent farmers
500 concurrent farmers
1000 concurrent users
Multiple active centres
High appointment booking burst
Queue peak
Notification burst
Payment burst
```

Measure:

```text
CPU
Memory
DB connections
Redis latency
API latency
WebSocket connections
Error rate
Throughput
```

---

# 41. Failure Testing

Test failure of:

```text
Redis
PostgreSQL connection
AI service
TEE service
Notification provider
Payment provider
WebSocket
Object storage
```

Expected behavior:

```text
Graceful degradation
No financial corruption
No lost critical transaction
Retry where safe
Clear user messaging
Audit failure events
```

---

# 42. CI/CD Pipeline

Recommended:

```text
Push
 ↓
Lint
 ↓
Type Check
 ↓
Unit Tests
 ↓
Build
 ↓
Integration Tests
 ↓
Security Scan
 ↓
Docker Build
 ↓
Deploy Staging
 ↓
E2E Tests
 ↓
Manual Approval
 ↓
Production
```

---

# 43. Deployment Strategy

Use:

```text
Development
      ↓
Staging
      ↓
Production
```

Production deployment should support:

- Health checks.
- Rolling/blue-green deployment where feasible.
- Database migration checks.
- Automatic rollback strategy.
- Environment-specific secrets.

---

# 44. Database Migration Deployment

Before production migration:

```text
Backup
 ↓
Test migration on staging
 ↓
Check compatibility
 ↓
Apply migration
 ↓
Verify schema
 ↓
Deploy application
 ↓
Health check
```

Avoid destructive migrations in the same release as application changes unless carefully planned.

---

# 45. Monitoring

Monitor:

```text
API latency
5xx errors
4xx spikes
DB latency
DB connection pool
Redis latency
Queue length
Payment failures
Notification failures
AI failures
TEE failures
WebSocket connections
```

Create alerts for:

```text
High error rate
Database unavailable
Redis unavailable
Payment failure spike
Queue update failure
Suspicious authorization failures
```

---

# 46. Logging

Use structured logs.

Example:

```json
{
  "requestId": "...",
  "userId": "...",
  "centreId": "...",
  "action": "PAYMENT_APPROVED",
  "resourceId": "...",
  "durationMs": 183,
  "status": "SUCCESS"
}
```

Never log:

```text
Passwords
OTP
JWT secrets
Payment secrets
Sensitive identity information
```

---

# 47. Data Backup

PostgreSQL:

```text
Automated backup
Point-in-time recovery
Restore testing
```

Critical records:

```text
Appointments
Procurements
Payments
Audit logs
Quality checks
Weighments
```

Redis should be treated as rebuildable operational state.

---

# 48. Documentation Deliverables

Maintain:

```text
README.md
PRD.md
TRD.md
App_Flow.md
UI_UX_Design_Brief.md
Backend_Schema.md
Implementation_Plan.md
API_Documentation.md
Deployment.md
Security.md
```

---

# 49. Suggested Sprint Plan

## Sprint 1

```text
Project setup
Repository
CI/CD
PostgreSQL
Redis
NestJS foundation
Frontend foundation
```

## Sprint 2

```text
Auth
Users
Roles
Permissions
Farmer profile
Staff profile
Centre foundation
```

## Sprint 3

```text
Public pages
Farmer dashboard
Centre discovery
Appointment slots
```

## Sprint 4

```text
Appointment booking
Token generation
Queue
Realtime updates
```

## Sprint 5

```text
Staff dashboard
Check-in
Token management
```

## Sprint 6

```text
Weighment
Quality check
Procurement
```

## Sprint 7

```text
Payments
Receipts
Notifications
```

## Sprint 8

```text
Centre Admin
Staff management
Centre settings
Reports
Audit logs
```

## Sprint 9

```text
Administrative Admin
Centre management
Verification
Roles
Permissions
System settings
Announcements
```

## Sprint 10

```text
AI prediction
Analytics
Model versioning
```

## Sprint 11

```text
TEE integration
Sensitive calculation verification
Attestation metadata
```

## Sprint 12

```text
Security hardening
Performance testing
Failure testing
Bug fixing
Production deployment
```

---

# 50. MVP Scope

If implementation time is limited, the MVP should include:

```text
Authentication
        +
Farmer profile
        +
Centre discovery
        +
Appointment booking
        +
Token generation
        +
Live queue
        +
Staff check-in
        +
Weighment
        +
Quality check
        +
Procurement
        +
Payment record
        +
Notifications
        +
Basic Centre Admin
        +
Basic Platform Admin
```

AI and TEE can initially operate as controlled modules behind stable interfaces.

---

# 51. Post-MVP Features

After MVP:

```text
Advanced AI prediction
TEE production integration
Advanced analytics
Predictive centre staffing
Smart slot recommendations
Automated anomaly detection
Advanced notification preferences
Multi-language expansion
Mobile/PWA optimization
Advanced reporting/export
```

---

# 52. Definition of Done

A feature is complete only when:

- UI is implemented.
- Responsive states are implemented.
- API is implemented.
- DTO validation exists.
- Authorization is implemented.
- Database migration exists.
- Unit tests exist.
- Integration tests exist where applicable.
- Loading/error/empty states exist.
- Audit requirements are satisfied.
- API documentation is updated.
- Security checks pass.
- No critical console/runtime errors remain.

---

# 53. Critical Acceptance Tests

## Farmer Booking

```text
Farmer logs in
→ Selects centre
→ Selects slot
→ Books
→ Receives token
→ Sees queue
```

## Staff Processing

```text
Staff logs in
→ Sees queue
→ Calls token
→ Checks farmer in
→ Records weight
→ Performs quality check
→ Completes procurement
```

## Payment

```text
Procurement created
→ Payment pending
→ Verification
→ Approval
→ Processing
→ Completed
→ Receipt
```

## Admin

```text
Admin creates centre
→ Centre submits verification
→ Admin verifies
→ Centre becomes active
→ Centre staff assigned
```

---

# 54. End-to-End Production Flow

```text
                    FARMER
                       |
                       v
                 Registration
                       |
                       v
                 Find Centre
                       |
                       v
                Book Appointment
                       |
                       v
                  Get Token
                       |
                       v
                 Live Queue
                       |
                       v
                    Check-in
                       |
                       v
                 Staff Processing
                       |
             +---------+---------+
             |                   |
             v                   v
         Weighment          Quality Check
             |                   |
             +---------+---------+
                       |
                       v
                  Procurement
                       |
                       v
              Amount Calculation
                       |
                       v
                 TEE Verify
                       |
                       v
                  Payment
                       |
                       v
                   Receipt
                       |
                       v
                  History
```

---

# 55. Final Implementation Architecture

```text
                        KISAN SETU
                            |
            +---------------+---------------+
            |                               |
            v                               v
       Web Frontend                     API Layer
       React/Next.js                    NestJS
                                            |
                         +------------------+------------------+
                         |                  |                  |
                         v                  v                  v
                    PostgreSQL        Redis/Upstash       WebSocket
                    Source Truth      Cache/Queue         Realtime
                         |
          +--------------+---------------+
          |              |               |
          v              v               v
      Operations       Finance          Audit
          |              |               |
          v              v               v
      Queue/AI        Payments        Compliance
                         |
                         v
                       TEE
                         |
                         v
                 Trusted Verification
```

---

# 56. Implementation Priority

The team should follow this dependency order:

```text
1. Infrastructure
2. Database
3. Authentication
4. RBAC
5. Centre/User foundations
6. Appointment system
7. Queue system
8. Staff workflow
9. Weighment
10. Quality
11. Procurement
12. Payments
13. Notifications
14. Centre Admin
15. Platform Admin
16. Analytics
17. AI
18. TEE
19. Security hardening
20. Production optimization
```

Do not build AI prediction before sufficient historical operational data exists.

Do not make TEE integration a hard dependency for the initial queue/procurement workflow.

---

# 57. Final Engineering Principle

Kisan Setu should be implemented as a **transaction-first, event-driven, role-aware platform**.

The critical rule is:

```text
Correctness first
      ↓
Security second
      ↓
Real-time experience
      ↓
AI intelligence
      ↓
Optimization
```

The platform must remain operational if AI, Redis, WebSocket, notification, or other non-core services temporarily fail.

PostgreSQL remains the authoritative source for permanent business transactions, while NestJS orchestrates business workflows and Redis/Upstash accelerates real-time operations.
