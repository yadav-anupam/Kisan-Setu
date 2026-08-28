# Kisan Setu --- Product Requirements Document (PRD)

**Problem Statement:** SIH26032\
**Organization:** Ministry of Consumer Affairs, Food & Public
Distribution\
**Department:** Department of Consumer Affairs (DoCA)\
**Category:** Software\
**Theme:** Smart Automation\
**Version:** 1.0\
**Date:** 28 August 2026

## 1. Product Overview

Kisan Setu is an intelligent agricultural procurement and
queue-management platform connecting farmers, procurement-centre staff,
Centre Admins, and Administrative Admins.

It addresses long waiting times, lack of procurement schedules,
congestion, uncertain queue positions, fragmented procurement records,
and payment-status uncertainty.

### Vision

Make procurement **predictable for farmers, manageable for staff,
transparent for administrators, and trustworthy for everyone**.

## 2. Problem

Farmers commonly face: - Long and unpredictable waiting times. - Lack of
reliable slot/schedule information. - Difficulty booking or changing
appointments. - No real-time queue visibility. - Limited visibility into
weighment, quality, procurement, and payment. - Delayed payment
confirmation.

Centres commonly face: - Manual token and queue management. - Uneven
counter workloads. - Fragmented operational records. - Difficulty
forecasting rush periods. - Manual reporting and audit work.

## 3. Goals

1.  Digital farmer registration.
2.  Centre discovery.
3.  Appointment and slot booking.
4.  Digital token generation.
5.  Real-time queue management.
6.  AI-based waiting-time prediction.
7.  Digital check-in.
8.  Weighment and quality-check records.
9.  Procurement tracking.
10. Payment tracking and approval.
11. SMS/app notifications.
12. Centre operational dashboards.
13. Multi-level administration.
14. Secure and tamper-evident audit trails.
15. Selective Trusted Execution Environment (TEE) protection.

## 4. Users and Roles

### Farmer

Register, find centres, book slots, receive tokens, check in, view live
queue, track procurement/payment, receive notifications, download
receipts, and access support.

### Staff / Centre Operator

Manage queues, tokens, check-ins, weighment, quality checks,
procurement, operational payments, appointments, announcements, and
reports.

### Centre Admin

Manage a specific centre, staff, counters, prices, appointments,
payments, procurement records, reports, settings, notifications,
announcements, and audit logs.

### Administrative Admin

Manage all centres, centre verification, categories, users, roles,
departments, permissions, system settings, global reports,
announcements, notifications, audit logs, and support.

## 5. Farmer Journey

**Landing Page → Registration/Login → Document Verification via Digilocker/Aadhar → Find Centre → Select Crop/Quantity
→ Book Slot → Receive Appointment/Token → Reminder → Centre Check-In →
Live Queue → Weighment → Quality Check → Procurement → Payment Approval
→ Payment Completed → Receipt/History**

### Booking

The farmer selects centre, crop, expected quantity, date, and available
slot. The system validates centre capacity, slot capacity, operating
hours, crop support, and booking conflicts.

### Live Queue

Display: - Current token. - Farmer's token. - Farmers ahead. - Estimated
waiting time. - Active counters. - Queue progress. - Last update.

### Procurement

Record accepted quantity, applicable rate, gross value, deductions, and
net payable value.

### Payment

Payment moves through pending, approval, processing, and completed
states. The farmer receives status updates and a digital receipt.

## 6. Farmer UI Pages

1.  Home
2.  About Us
3.  How It Works
4.  Features
5.  For Farmers
6.  For Centres
7.  Contact Us
8.  Login
9.  Registration
10. Farmer Dashboard
11. My Appointments
12. Book New Slot
13. Live Queue
14. My Procurement
15. Payments
16. History
17. Notifications
18. Profile
19. Help & Support

## 7. Staff Platform

### Dashboard

KPIs: - Farmers today. - Tokens issued. - Currently in queue. - Served
today. - Payments completed.

Operational modules: - Live Queue. - Counter Overview. - Today's
Appointments. - Centre Performance. - Recent Notifications. - Quick
Actions.

### Staff Pages

1.  Dashboard
2.  Live Queue
3.  Token Management
4.  Farmer Check-In
5.  Procurement
6.  Weighment
7.  Quality Check
8.  Payments
9.  Appointments
10. Reports & Analytics
11. Notifications
12. Centre Settings
13. Users & Roles
14. Help & Support

## 8. Centre Admin Platform

Dashboard KPIs: - Farmers today. - Tokens issued. - Total quantity. -
Total value. - Payments completed.

Dashboard modules: - Today's Overview: Check-In → Weighment → Quality
Check → Procurement → Payments. - Pending Payment Approvals. - Quick
Actions. - Quantity & Collection Overview. - Top Crops. - Alerts &
Announcements. - Recent Payments. - Staff Activity.

### Centre Admin Pages

1.  Dashboard
2.  Payments (Admin)
3.  Price Management
4.  Appointments
5.  Token Management
6.  Procurement Overview
7.  Weighment Records
8.  Quality Check Records
9.  Reports & Analytics
10. Farmers
11. Staff Management
12. Notifications
13. Audit Logs
14. Settings
15. Help & Support

## 9. Administrative Platform

### Centre Management

Manage: - Centre creation. - Centre verification. - Centre categories. -
Address and geo-location. - Operating hours. - Supported crops. -
Capacity. - Counters. - Documents. - Status.

Verification lifecycle:

**Submitted → Document Review → Location/Field Validation → Approved /
Rejected / Needs Changes**

### User & Role Management

Support: - User creation/editing. - Activation/deactivation. - Role
assignment. - Centre assignment. - Department assignment. - Access
review.

Suggested roles: - SUPER_ADMIN - CENTRE_ADMIN - STAFF - FARMER -
AUDITOR - SUPPORT

### Departments

-   Operations.
-   Weighment.
-   Quality.
-   Procurement.
-   Payments.
-   Support.
-   Administration.

### Permission Management

Example permissions: - QUEUE_VIEW - QUEUE_MANAGE - TOKEN_ISSUE -
FARMER_CHECKIN - WEIGHMENT_CREATE - QUALITY_CREATE -
PROCUREMENT_CREATE - PAYMENT_VIEW - PAYMENT_APPROVE - PRICE_MANAGE -
REPORT_VIEW - REPORT_EXPORT - STAFF_MANAGE - CENTRE_MANAGE -
AUDIT_VIEW - SYSTEM_SETTINGS

## 10. Administrative Dashboard

Global KPIs: - Total centres. - Active centres. - Total farmers. -
Farmers today. - Total procurement quantity. - Total procurement
value. - Payments completed. - Pending approvals.

Global analytics: - Procurement by state/district. - Centre
performance. - Queue performance. - Payment trends. - Crop trends. -
Quality/rejection trends. - System usage.

## 11. Reports & Analytics

Reports: 1. Daily procurement. 2. Centre performance. 3. Farmer service.
4. Queue/waiting-time. 5. Payments. 6. Crop-wise procurement. 7.
Quality/rejection. 8. Staff productivity. 9. Appointment utilization.
10. System activity.

Support filtering by date, state, district, centre, crop, staff, status,
and procurement stage.

Export: CSV, Excel, PDF.

## 12. AI Waiting-Time Prediction

### Objective

Predict how long a farmer is likely to wait before service.

### Features

-   Farmers ahead.
-   Active counters.
-   Average serving time.
-   Current queue length.
-   Historical centre load.
-   Current hour.
-   Day of week.
-   Crop.
-   Estimated quantity.
-   Staff availability.
-   Recent throughput.
-   Appointment slot.
-   Historical processing durations.

### Output

`Estimated waiting time: 32 minutes`\
`Confidence: 91%`

### Model Strategy

Start with a queue-based baseline and compare it with Random Forest,
Gradient Boosting, or XGBoost. Continuously improve using validated
historical records.

## 13. Trusted Execution Environment (TEE)

TEE is a selective security layer, not the whole backend.

Recommended cloud approach:

**AWS Nitro Enclaves + AWS KMS + attestation**

TEE candidates: - AI inference on sensitive features. - Payment
calculation and validation. - Queue integrity rules. - Sensitive audit
signing. - Controlled access to cryptographic secrets.

### TEE AI Flow

**Real-time/historical features → Encrypted payload → TEE → AI inference
→ Estimated wait + confidence → Backend → Farmer**

### TEE Payment Flow

**Validated weighment + quality result + authorized crop rate → TEE →
Payment calculation → Validation → Signed result → Admin
approval/payment service**

The application must not silently bypass TEE for security-critical
operations if the trusted service is unavailable.

## 14. Security

### Authentication

-   Farmer OTP.
-   Strong staff/admin authentication.
-   MFA for privileged administrators.
-   Session expiry.

### Authorization

RBAC and least privilege.

### Data

-   TLS in transit.
-   Encryption at rest.
-   Field-level encryption for highly sensitive fields.
-   Secure secret management.
-   No secrets in frontend/source code.

### Audit

Log all privileged actions including role changes, price changes,
payment approvals, queue overrides, centre verification, exports, and
settings changes.

## 15. Real-Time System

Use WebSocket/Socket.IO for: - Queue updates. - Token calls. - Counter
status. - Appointment changes. - Payment status. - Announcements.

Example:

**Staff completes A-35 → backend event → WebSocket → Farmer + Staff +
Admin clients**

## 16. Core Data Model

### Farmer

`farmer_id, name, mobile, address, village, district, state, preferred_language, created_at, updated_at`

### Centre

`centre_id, centre_code, name, address, state, district, location, operating_hours, capacity, status, verification_status`

### Appointment

`appointment_id, farmer_id, centre_id, crop_id, quantity, date, slot_start, slot_end, status, token_id, created_at`

### Token

`token_id, token_number, appointment_id, centre_id, queue_position, status, counter_id, issued_at, called_at, completed_at`

### Weighment

`weighment_id, token_id, gross_weight, tare_weight, net_weight, scale_id, operator_id, recorded_at`

### Quality Check

`quality_check_id, token_id, grade, parameters, status, rejection_reason, operator_id, checked_at`

### Procurement

`procurement_id, token_id, crop_id, accepted_quantity, rate, gross_value, deductions, net_value, status, created_at`

### Payment

`payment_id, procurement_id, farmer_id, amount, payment_mode, transaction_reference, status, approved_by, approved_at, paid_at`

### Audit Log

`audit_id, actor_id, role, action, entity, entity_id, metadata, timestamp, signature`

## 17. Procurement State Machine

**REGISTERED → APPOINTMENT_BOOKED → CHECKED_IN → TOKEN_ISSUED → WAITING
→ CALLED → WEIGHMENT → QUALITY_CHECK → PROCUREMENT → PAYMENT_PENDING →
PAYMENT_APPROVED → PAYMENT_COMPLETED → COMPLETED**

Exception states: - CANCELLED - NO_SHOW - REJECTED - PAYMENT_FAILED -
REQUIRES_REVIEW

## 18. Queue Rules

Queue decisions should consider: - Valid appointment. - Check-in
status. - Token issue time. - Slot. - Centre rules. - Authorized
priority rules. - Active counters. - Current processing state.

Unauthorized queue jumps must be blocked. Authorized overrides require
permission, reason, actor, timestamp, and audit record.

## 19. Notifications

Farmer: - Slot confirmation. - Reminder. - Turn approaching. - Queue
update. - Centre delay. - Weighment completed. - Quality result. -
Procurement completed. - Payment credited.

Staff/Admin: - New appointment. - High rush. - Counter maintenance. -
Payment event. - Pending approval. - Centre verification. -
Security/system alerts.

## 20. Help & Support

Provide: - FAQ search. - Common issues. - Contact support. - Ticket
creation. - Ticket status. - Centre contact information.

Ticket fields:
`category, subject, description, attachment, priority, status, assigned_agent`

## 21. Non-Functional Requirements

### Performance

-   Target dashboard load under 3 seconds on normal broadband.
-   Standard read APIs target under 500 ms where feasible.
-   Near-real-time queue updates.

### Availability

Target 99.5%+ for pilot/production services excluding planned
maintenance.

### Scalability

Support multiple states, districts, and large numbers of centres and
concurrent users.

### Accessibility

-   Mobile-first farmer UI.
-   Large touch targets.
-   Clear statuses.
-   High contrast.
-   Simple language.
-   Local-language support.

### Localization

Initial languages: - English. - Hindi.

Architecture should support additional Indian languages.

## 22. Poor Connectivity / Offline Strategy

-   Cache essential queue information.
-   Retry failed submissions.
-   Preserve unsent form data where safe.
-   Show sync state.
-   Use idempotency keys to prevent duplicates.
-   Fail safely when TEE is unavailable.

## 23. Recommended Technology Stack

### Frontend

-   Next.js
-   Tailwind CSS
-   shadcn/ui
-   Recharts
-   PWA capabilities

### Backend

-   NestJS
-   WebSocket/Socket.IO
-   JWT
-   RBAC

### Data

-   PostgreSQL
-   Redis/Upstash
-   Object storage

### AI/ML

-   Python
-   FastAPI
-   Pandas
-   scikit-learn
-   MLflow

### TEE/Security

-   AWS Nitro Enclaves
-   Nitro Enclaves SDK
-   AWS KMS
-   Cryptographic attestation
-   VSock

### Infrastructure

-   AWS
-   Docker
-   API Gateway
-   CloudWatch
-   GitHub Actions

### Integrations

-   SMS gateway.
-   Push notifications.
-   Email.
-   Payment/banking APIs as permitted.

## 24. MVP

### Must Have

-   Registration/login.
-   Centre discovery.
-   Slot booking.
-   Token generation.
-   Live queue.
-   Check-in.
-   Weighment.
-   Quality check.
-   Procurement.
-   Payment status.
-   Farmer dashboard.
-   Staff dashboard.
-   Centre Admin dashboard.
-   Administrative dashboard.
-   Notifications.
-   Reports.
-   RBAC.
-   Audit logs.
-   AI wait-time prediction.

### Differentiators

-   TEE-secured payment validation.
-   TEE-secured AI inference.
-   Tamper-evident audit records.
-   Predictive rush alerts.
-   Intelligent counter allocation.

### Future

-   Voice assistant.
-   Advanced forecasting.
-   Predictive equipment maintenance.
-   Automated anomaly detection.
-   Government ecosystem integrations.
-   Advanced geospatial analytics.
-   Federated/privacy-preserving ML.

## 25. SIH Demonstration Scenario

1.  Farmer registers/logs in.
2.  Farmer selects XYZ Procurement Centre.
3.  Farmer books 10:00--11:00 AM.
4.  System generates token A-47.
5.  Farmer checks in.
6.  Live queue shows A-35 being served, 12 farmers ahead, estimated wait
    32 minutes.
7.  AI produces the waiting-time prediction.
8.  Trusted execution layer validates the security-critical computation.
9.  Farmer receives turn-approaching notification.
10. Staff records weighment.
11. Staff completes quality check.
12. Procurement value is calculated.
13. TEE validates the payment calculation.
14. Centre Admin approves payment.
15. Farmer receives payment confirmation.
16. Receipt and audit record are generated.

## 26. Acceptance Criteria

The MVP must allow: - Farmer registration and login. - Centre
discovery. - Slot booking. - Token generation. - Staff check-in. -
Correct queue updates. - Waiting-time prediction. - Weighment
recording. - Quality recording. - Procurement calculation. - Payment
approval/status tracking. - Receipt generation. - Notifications. -
Centre/user/role management. - Privileged audit logging. - Responsive
mobile and desktop operation. - Secure routing of defined
security-critical operations through TEE.

## 27. Product Principle

**Book → Arrive → Check In → Know Your Position → Get Served → Track
Procurement → Get Paid → Receive Proof**

Kisan Setu should turn a traditionally uncertain procurement visit into
a predictable, transparent, digitally traceable journey.

## 28. Token Issue Format

Store the generated token as a unique field:

token_number = 1
token_code   = KS-2608280001
token_date   = 2026-08-28

The generation logic is:

YY     = year % 100
MM     = month
DD     = day
NUMBER = daily_booking_count

TOKEN = KS-YYMMDD + zero-padded NUMBER

For example:

2026-08-28
      ↓
26 + 08 + 28
      ↓
260828
      ↓
Booking #42 → 0042
      ↓
KS-2608280042