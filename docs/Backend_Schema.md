# Kisan Setu — Backend Database Schema

**Backend Stack:** NestJS + PostgreSQL + Redis/Upstash  
**Problem Statement:** SIH26032  
**Version:** 1.0  
**Date:** 28 August 2026

---

# 1. Purpose

This document defines the recommended backend data model for Kisan Setu.

The schema is designed around:

- PostgreSQL as the source of truth.
- Redis/Upstash for caching, rate limiting, sessions/temporary state, queue acceleration, and real-time coordination.
- NestJS as the backend application framework.
- Strong role-based access control.
- Centre-scoped operations.
- Complete procurement traceability.
- Payment traceability.
- Auditability.
- AI prediction support.
- TEE verification metadata.

---

# 2. Backend Architecture

```text
Frontend
   |
   v
NestJS API
   |
   +-------------------+
   |                   |
   v                   v
PostgreSQL          Redis / Upstash
Source of Truth     Cache / Queue / Realtime
   |
   +-------------------+
   |
   v
TEE / AI Services
```

## Responsibility Split

| Component | Responsibility |
|---|---|
| NestJS | API, business logic, auth, RBAC, workflows |
| PostgreSQL | Permanent transactional data |
| Redis/Upstash | Cache, short-lived state, rate limits, queue acceleration |
| TEE | Trusted sensitive computation/verification |
| Object Storage | Documents, receipts, centre verification files |
| Notification Service | SMS, email, push notifications |

---

# 3. Database Principles

1. PostgreSQL is the authoritative source of business data.
2. Redis must never be the only source of truth for financial records.
3. Critical workflow transitions must be transactional.
4. All important records should contain `created_at` and `updated_at`.
5. Financial and audit records should be append-oriented.
6. IDs should be UUIDs.
7. Foreign keys should enforce relational integrity.
8. Sensitive fields should be protected at the application/database layer.
9. Soft deletion should be preferred for important business records.
10. Audit records must not be editable through normal APIs.

---

# 4. Naming Convention

PostgreSQL:

- Tables: `snake_case`, plural.
- Columns: `snake_case`.
- Primary key: `id`.
- Foreign key: `<entity>_id`.
- Timestamps: `created_at`, `updated_at`.
- Boolean: `is_*` or `has_*`.

NestJS entities/models may use TypeScript `camelCase` while database columns remain `snake_case`.

---

# 5. PostgreSQL Extensions

Recommended:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Optional for location search:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Optional full-text/search extensions should be evaluated only if PostgreSQL search is insufficient.

---

# 6. Core Entity Relationship Model

```text
users
  |
  +---- user_roles ---- roles
  |                       |
  |                       +---- role_permissions ---- permissions
  |
  +---- farmer_profiles
  |
  +---- staff_profiles
  |
  +---- user_centre_assignments ---- centres
                                  |
                                  +---- departments
                                  |
                                  +---- appointments
                                  |
                                  +---- tokens
                                  |
                                  +---- weighments
                                  |
                                  +---- quality_checks
                                  |
                                  +---- procurements
                                  |
                                  +---- payments
```

Supporting entities:

```text
centres
  |
  +---- centre_categories
  +---- centre_documents
  +---- centre_verifications
  +---- operating_hours
  +---- counters
  +---- price_rules
  +---- appointments
  +---- tokens
  +---- audit_logs
```

---

# 7. Users

Table: `users`

Purpose: Stores all authenticated platform users.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| mobile | VARCHAR(20) | UNIQUE, nullable |
| email | VARCHAR(255) | UNIQUE, nullable |
| password_hash | TEXT | nullable |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | nullable |
| status | ENUM | NOT NULL |
| preferred_language | VARCHAR(20) | DEFAULT `en` |
| last_login_at | TIMESTAMPTZ | nullable |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | nullable |

Status:

```text
ACTIVE
INACTIVE
SUSPENDED
PENDING
```

---

# 8. Farmer Profiles

Table: `farmer_profiles`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users.id, UNIQUE |
| farmer_code | VARCHAR(50) | UNIQUE |
| address_line | TEXT | nullable |
| village | VARCHAR(150) | nullable |
| district | VARCHAR(150) | nullable |
| state | VARCHAR(150) | nullable |
| pincode | VARCHAR(10) | nullable |
| identity_reference | TEXT | nullable/encrypted |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

Sensitive identity information should not be stored in plaintext unless required.

---

# 9. Staff Profiles

Table: `staff_profiles`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK users.id, UNIQUE |
| employee_code | VARCHAR(50) | UNIQUE |
| designation | VARCHAR(100) | nullable |
| department_id | UUID | FK departments.id |
| joining_date | DATE | nullable |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |

---

# 10. Roles

Table: `roles`

| Column | Type |
|---|---|
| id | UUID PK |
| name | VARCHAR(50) UNIQUE |
| description | TEXT |
| is_system_role | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Recommended system roles:

```text
FARMER
STAFF
CENTRE_ADMIN
ADMIN
AUDITOR
SUPPORT
```

---

# 11. User Roles

Table: `user_roles`

| Column | Type |
|---|---|
| id | UUID PK |
| user_id | UUID FK |
| role_id | UUID FK |
| assigned_by | UUID FK users.id |
| created_at | TIMESTAMPTZ |

Unique:

```text
(user_id, role_id)
```

---

# 12. Permissions

Table: `permissions`

| Column | Type |
|---|---|
| id | UUID PK |
| resource | VARCHAR(100) |
| action | VARCHAR(50) |
| description | TEXT |
| created_at | TIMESTAMPTZ |

Examples:

```text
centre.read
centre.create
centre.verify
appointment.read
appointment.create
appointment.cancel
queue.read
queue.manage
weighment.create
quality.create
procurement.create
payment.read
payment.approve
user.manage
role.manage
audit.read
settings.manage
```

Unique:

```text
(resource, action)
```

---

# 13. Role Permissions

Table: `role_permissions`

| Column | Type |
|---|---|
| id | UUID PK |
| role_id | UUID FK |
| permission_id | UUID FK |
| created_at | TIMESTAMPTZ |

Unique:

```text
(role_id, permission_id)
```

---

# 14. Centres

Table: `centres`

| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK |
| centre_code | VARCHAR(50) | UNIQUE |
| name | VARCHAR(255) | NOT NULL |
| description | TEXT | nullable |
| phone | VARCHAR(20) | nullable |
| email | VARCHAR(255) | nullable |
| address_line | TEXT | NOT NULL |
| village | VARCHAR(150) | nullable |
| district | VARCHAR(150) | NOT NULL |
| state | VARCHAR(150) | NOT NULL |
| pincode | VARCHAR(10) | nullable |
| latitude | DECIMAL(10,7) | nullable |
| longitude | DECIMAL(10,7) | nullable |
| status | ENUM | NOT NULL |
| verification_status | ENUM | NOT NULL |
| capacity_per_slot | INTEGER | NOT NULL |
| timezone | VARCHAR(50) | DEFAULT `Asia/Kolkata` |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | NOT NULL |
| deleted_at | TIMESTAMPTZ | nullable |

Centre status:

```text
DRAFT
PENDING_VERIFICATION
ACTIVE
SUSPENDED
INACTIVE
REJECTED
```

---

# 15. Centre Categories

Table: `centre_categories`

| Column | Type |
|---|---|
| id | UUID PK |
| name | VARCHAR(100) UNIQUE |
| description | TEXT |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Join table:

`centre_category_mappings`

| Column | Type |
|---|---|
| centre_id | UUID FK |
| category_id | UUID FK |

Primary key:

```text
(centre_id, category_id)
```

---

# 16. Centre Documents

Table: `centre_documents`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| document_type | VARCHAR(100) |
| storage_key | TEXT |
| file_name | TEXT |
| mime_type | VARCHAR(100) |
| verification_status | ENUM |
| uploaded_by | UUID FK users.id |
| created_at | TIMESTAMPTZ |
| verified_at | TIMESTAMPTZ nullable |
| verified_by | UUID FK users.id nullable |

Do not store large binary files directly in PostgreSQL unless there is a strong requirement.

---

# 17. Centre Verification

Table: `centre_verifications`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| submitted_by | UUID FK |
| reviewer_id | UUID FK nullable |
| status | ENUM |
| comments | TEXT |
| reviewed_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
PENDING
APPROVED
REJECTED
NEEDS_CHANGES
```

---

# 18. Departments

Table: `departments`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK nullable |
| name | VARCHAR(100) |
| description | TEXT |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Examples:

```text
Operations
Weighment
Quality
Procurement
Payments
Support
Administration
```

---

# 19. User Centre Assignments

Table: `user_centre_assignments`

| Column | Type |
|---|---|
| id | UUID PK |
| user_id | UUID FK |
| centre_id | UUID FK |
| assigned_by | UUID FK |
| is_primary | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Unique constraint:

```text
(user_id, centre_id)
```

This table is important for centre-scoped RBAC.

---

# 20. Operating Hours

Table: `centre_operating_hours`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| day_of_week | SMALLINT |
| opens_at | TIME |
| closes_at | TIME |
| is_closed | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

# 21. Counters

Table: `counters`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| counter_code | VARCHAR(50) |
| name | VARCHAR(100) |
| department_id | UUID FK nullable |
| status | ENUM |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
ACTIVE
INACTIVE
MAINTENANCE
```

---

# 22. Crops

Table: `crops`

| Column | Type |
|---|---|
| id | UUID PK |
| name | VARCHAR(100) |
| local_name | VARCHAR(150) |
| code | VARCHAR(50) UNIQUE |
| category | VARCHAR(100) |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

# 23. Centre Supported Crops

Table: `centre_crops`

| Column | Type |
|---|---|
| centre_id | UUID FK |
| crop_id | UUID FK |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |

Primary key:

```text
(centre_id, crop_id)
```

---

# 24. Price Rules

Table: `price_rules`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| crop_id | UUID FK |
| rate | NUMERIC(14,2) |
| unit | VARCHAR(20) |
| effective_from | TIMESTAMPTZ |
| effective_to | TIMESTAMPTZ nullable |
| status | ENUM |
| created_by | UUID FK |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Never overwrite historical rates.

Use new records for rate changes.

---

# 25. Appointment Slots

Table: `appointment_slots`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| slot_date | DATE |
| start_time | TIME |
| end_time | TIME |
| capacity | INTEGER |
| booked_count | INTEGER |
| status | ENUM |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
OPEN
FULL
CLOSED
CANCELLED
```

---

# 26. Appointments

Table: `appointments`

| Column | Type |
|---|---|
| id | UUID PK |
| appointment_number | VARCHAR(50) UNIQUE |
| farmer_id | UUID FK farmer_profiles.id |
| centre_id | UUID FK |
| slot_id | UUID FK |
| crop_id | UUID FK |
| expected_quantity | NUMERIC(14,3) |
| status | ENUM |
| booked_at | TIMESTAMPTZ |
| checked_in_at | TIMESTAMPTZ nullable |
| completed_at | TIMESTAMPTZ nullable |
| cancelled_at | TIMESTAMPTZ nullable |
| cancellation_reason | TEXT nullable |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
CONFIRMED
CHECKED_IN
IN_QUEUE
PROCESSING
COMPLETED
CANCELLED
RESCHEDULED
NO_SHOW
```

---

# 27. Tokens

Table: `tokens`

| Column | Type |
|---|---|
| id | UUID PK |
| appointment_id | UUID FK UNIQUE |
| centre_id | UUID FK |
| token_number | VARCHAR(30) |
| token_sequence | INTEGER |
| token_date | DATE |
| status | ENUM |
| counter_id | UUID FK nullable |
| called_at | TIMESTAMPTZ nullable |
| processing_started_at | TIMESTAMPTZ nullable |
| completed_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Unique:

```text
(centre_id, token_date, token_sequence)
```

---

# 28. Queue Events

Table: `queue_events`

| Column | Type |
|---|---|
| id | UUID PK |
| token_id | UUID FK |
| event_type | VARCHAR(50) |
| previous_status | VARCHAR(50) |
| new_status | VARCHAR(50) |
| actor_id | UUID FK |
| counter_id | UUID FK nullable |
| reason | TEXT nullable |
| created_at | TIMESTAMPTZ |

Examples:

```text
CREATED
CALLED
RECALLED
HELD
RESUMED
SKIPPED
NO_SHOW
PROCESSING_STARTED
COMPLETED
```

---

# 29. Check-Ins

Table: `check_ins`

| Column | Type |
|---|---|
| id | UUID PK |
| appointment_id | UUID FK |
| farmer_id | UUID FK |
| centre_id | UUID FK |
| checked_in_by | UUID FK |
| method | ENUM |
| device_reference | TEXT nullable |
| checked_in_at | TIMESTAMPTZ |

Methods:

```text
FARMER_SELF
STAFF_ASSISTED
QR
OTP
```

---

# 30. Weighments

Table: `weighments`

| Column | Type |
|---|---|
| id | UUID PK |
| appointment_id | UUID FK |
| token_id | UUID FK |
| gross_weight | NUMERIC(14,3) |
| tare_weight | NUMERIC(14,3) |
| net_weight | NUMERIC(14,3) |
| unit | VARCHAR(20) |
| device_reference | TEXT nullable |
| recorded_by | UUID FK |
| verified_by | UUID FK nullable |
| recorded_at | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Backend must verify:

```text
net_weight = gross_weight - tare_weight
```

---

# 31. Quality Rules

Table: `quality_rules`

| Column | Type |
|---|---|
| id | UUID PK |
| crop_id | UUID FK |
| name | VARCHAR(150) |
| version | VARCHAR(50) |
| parameters_schema | JSONB |
| active_from | TIMESTAMPTZ |
| active_to | TIMESTAMPTZ nullable |
| is_active | BOOLEAN |
| created_at | TIMESTAMPTZ |

---

# 32. Quality Checks

Table: `quality_checks`

| Column | Type |
|---|---|
| id | UUID PK |
| appointment_id | UUID FK |
| procurement_id | UUID FK nullable |
| crop_id | UUID FK |
| rule_id | UUID FK nullable |
| parameters | JSONB |
| grade | VARCHAR(50) |
| result | ENUM |
| rejection_reason | TEXT nullable |
| checked_by | UUID FK |
| checked_at | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Result:

```text
PENDING
ACCEPTED
REJECTED
REQUIRES_REVIEW
```

---

# 33. Procurements

Table: `procurements`

| Column | Type |
|---|---|
| id | UUID PK |
| procurement_number | VARCHAR(50) UNIQUE |
| appointment_id | UUID FK UNIQUE |
| farmer_id | UUID FK |
| centre_id | UUID FK |
| crop_id | UUID FK |
| accepted_quantity | NUMERIC(14,3) |
| unit | VARCHAR(20) |
| rate | NUMERIC(14,2) |
| gross_amount | NUMERIC(16,2) |
| total_deductions | NUMERIC(16,2) |
| net_amount | NUMERIC(16,2) |
| price_rule_id | UUID FK |
| status | ENUM |
| created_by | UUID FK |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
CREATED
PAYMENT_PENDING
PAYMENT_APPROVED
PAYMENT_PROCESSING
COMPLETED
CANCELLED
REQUIRES_REVIEW
```

---

# 34. Procurement Adjustments

Table: `procurement_adjustments`

| Column | Type |
|---|---|
| id | UUID PK |
| procurement_id | UUID FK |
| adjustment_type | VARCHAR(50) |
| amount | NUMERIC(16,2) |
| reason | TEXT |
| created_by | UUID FK |
| approved_by | UUID FK nullable |
| created_at | TIMESTAMPTZ |

Adjustments must never silently modify historical financial values.

---

# 35. Payment Records

Table: `payments`

| Column | Type |
|---|---|
| id | UUID PK |
| payment_number | VARCHAR(50) UNIQUE |
| procurement_id | UUID FK UNIQUE |
| farmer_id | UUID FK |
| centre_id | UUID FK |
| amount | NUMERIC(16,2) |
| currency | CHAR(3) DEFAULT `INR` |
| status | ENUM |
| method | VARCHAR(50) |
| gateway_reference | VARCHAR(255) nullable |
| approved_by | UUID FK nullable |
| approved_at | TIMESTAMPTZ nullable |
| processed_at | TIMESTAMPTZ nullable |
| completed_at | TIMESTAMPTZ nullable |
| failure_reason | TEXT nullable |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
PENDING
VERIFIED
APPROVED
PROCESSING
COMPLETED
FAILED
REVERSED
REQUIRES_REVIEW
```

---

# 36. Payment Verification

Table: `payment_verifications`

| Column | Type |
|---|---|
| id | UUID PK |
| payment_id | UUID FK |
| verification_type | VARCHAR(50) |
| verified | BOOLEAN |
| calculation_hash | TEXT |
| attestation_reference | TEXT nullable |
| model_version | VARCHAR(100) nullable |
| rule_version | VARCHAR(100) nullable |
| verified_at | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |

This stores evidence that the sensitive calculation/verification was performed.

---

# 37. Receipts

Table: `receipts`

| Column | Type |
|---|---|
| id | UUID PK |
| receipt_number | VARCHAR(50) UNIQUE |
| procurement_id | UUID FK |
| payment_id | UUID FK |
| storage_key | TEXT |
| generated_at | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |

---

# 38. AI Prediction Records

Table: `queue_predictions`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| token_id | UUID FK nullable |
| predicted_wait_seconds | INTEGER |
| confidence_score | NUMERIC(5,4) nullable |
| model_version | VARCHAR(100) |
| feature_version | VARCHAR(100) |
| inference_mode | VARCHAR(50) |
| generated_at | TIMESTAMPTZ |

Inference modes:

```text
TEE
STANDARD
FALLBACK
```

---

# 39. AI Training Runs

Table: `ai_training_runs`

| Column | Type |
|---|---|
| id | UUID PK |
| model_name | VARCHAR(150) |
| model_version | VARCHAR(100) |
| dataset_reference | TEXT |
| metrics | JSONB |
| status | ENUM |
| approved_by | UUID FK nullable |
| started_at | TIMESTAMPTZ |
| completed_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |

Status:

```text
RUNNING
COMPLETED
FAILED
APPROVED
REJECTED
```

Do not store unnecessary personally identifiable data in model training datasets.

---

# 40. Notifications

Table: `notifications`

| Column | Type |
|---|---|
| id | UUID PK |
| user_id | UUID FK |
| type | VARCHAR(100) |
| title | VARCHAR(255) |
| message | TEXT |
| data | JSONB |
| priority | ENUM |
| read_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |

Priority:

```text
CRITICAL
HIGH
NORMAL
LOW
```

---

# 41. Notification Deliveries

Table: `notification_deliveries`

| Column | Type |
|---|---|
| id | UUID PK |
| notification_id | UUID FK |
| channel | ENUM |
| status | ENUM |
| provider_reference | TEXT nullable |
| sent_at | TIMESTAMPTZ nullable |
| delivered_at | TIMESTAMPTZ nullable |
| failed_at | TIMESTAMPTZ nullable |
| failure_reason | TEXT nullable |
| created_at | TIMESTAMPTZ |

Channels:

```text
IN_APP
PUSH
SMS
EMAIL
```

---

# 42. Announcements

Table: `announcements`

| Column | Type |
|---|---|
| id | UUID PK |
| title | VARCHAR(255) |
| body | TEXT |
| audience_type | VARCHAR(50) |
| status | ENUM |
| scheduled_at | TIMESTAMPTZ nullable |
| published_at | TIMESTAMPTZ nullable |
| expires_at | TIMESTAMPTZ nullable |
| created_by | UUID FK |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

---

# 43. Announcement Audiences

Table: `announcement_audiences`

| Column | Type |
|---|---|
| id | UUID PK |
| announcement_id | UUID FK |
| centre_id | UUID FK nullable |
| role_id | UUID FK nullable |
| state | VARCHAR(150) nullable |
| district | VARCHAR(150) nullable |

---

# 44. Audit Logs

Table: `audit_logs`

| Column | Type |
|---|---|
| id | UUID PK |
| event_id | VARCHAR(100) UNIQUE |
| actor_id | UUID FK nullable |
| centre_id | UUID FK nullable |
| action | VARCHAR(100) |
| resource_type | VARCHAR(100) |
| resource_id | UUID nullable |
| old_values | JSONB nullable |
| new_values | JSONB nullable |
| metadata | JSONB nullable |
| ip_address | INET nullable |
| user_agent | TEXT nullable |
| previous_hash | TEXT nullable |
| event_hash | TEXT |
| tee_signature | TEXT nullable |
| created_at | TIMESTAMPTZ |

Audit records should be append-only.

---

# 45. Support Tickets

Table: `support_tickets`

| Column | Type |
|---|---|
| id | UUID PK |
| ticket_number | VARCHAR(50) UNIQUE |
| created_by | UUID FK |
| assigned_to | UUID FK nullable |
| category | VARCHAR(100) |
| subject | VARCHAR(255) |
| description | TEXT |
| priority | ENUM |
| status | ENUM |
| resolved_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Status:

```text
OPEN
ASSIGNED
IN_PROGRESS
WAITING_FOR_USER
RESOLVED
CLOSED
```

---

# 46. Support Ticket Messages

Table: `support_ticket_messages`

| Column | Type |
|---|---|
| id | UUID PK |
| ticket_id | UUID FK |
| sender_id | UUID FK |
| message | TEXT |
| attachment_reference | TEXT nullable |
| created_at | TIMESTAMPTZ |

---

# 47. System Settings

Table: `system_settings`

| Column | Type |
|---|---|
| id | UUID PK |
| setting_key | VARCHAR(150) UNIQUE |
| setting_value | JSONB |
| category | VARCHAR(100) |
| is_sensitive | BOOLEAN |
| updated_by | UUID FK |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Sensitive secrets should NOT be stored directly in this table. Use a secrets manager.

---

# 48. Centre Settings

Table: `centre_settings`

| Column | Type |
|---|---|
| id | UUID PK |
| centre_id | UUID FK |
| setting_key | VARCHAR(150) |
| setting_value | JSONB |
| updated_by | UUID FK |
| created_at | TIMESTAMPTZ |
| updated_at | TIMESTAMPTZ |

Unique:

```text
(centre_id, setting_key)
```

---

# 49. Sessions / Refresh Tokens

Table: `refresh_tokens`

| Column | Type |
|---|---|
| id | UUID PK |
| user_id | UUID FK |
| token_hash | TEXT UNIQUE |
| device_reference | TEXT nullable |
| expires_at | TIMESTAMPTZ |
| revoked_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |

Raw refresh tokens must never be stored.

---

# 50. OTP Records

Table: `otp_requests`

| Column | Type |
|---|---|
| id | UUID PK |
| destination_hash | TEXT |
| purpose | VARCHAR(50) |
| otp_hash | TEXT |
| attempts | INTEGER |
| expires_at | TIMESTAMPTZ |
| verified_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |

OTP values should preferably be stored in Redis for short-lived verification.

PostgreSQL may retain only the required audit/reference information.

---

# 51. Redis / Upstash Architecture

Redis should handle ephemeral and high-frequency data.

Recommended key structure:

```text
ks:
  auth:
  otp:
  session:
  rate_limit:
  queue:
  appointment:
  prediction:
  notification:
  lock:
  cache:
```

---

# 52. Redis Key Examples

## OTP

```text
ks:otp:{purpose}:{destinationHash}
```

TTL:

```text
300 seconds
```

## Rate Limit

```text
ks:rate_limit:{route}:{identifier}
```

## Queue State

```text
ks:queue:{centreId}:{date}
```

## Token Lock

```text
ks:lock:token:{tokenId}
```

## Slot Lock

```text
ks:lock:slot:{slotId}
```

---

# 53. Redis Queue Representation

Redis can maintain a fast operational queue while PostgreSQL remains authoritative.

Example:

```text
ZSET
key = ks:queue:{centreId}:{date}
score = priority/sequence
member = tokenId
```

PostgreSQL stores the permanent token and state.

Redis is rebuilt from PostgreSQL if cache state is lost.

---

# 54. Queue Consistency

Important rule:

> Redis is an acceleration layer, not the permanent source of truth.

Flow:

```text
Staff Action
   |
   v
NestJS Transaction
   |
   v
PostgreSQL
   |
   v
Domain Event
   |
   v
Redis Update
   |
   v
WebSocket/Socke.io
```

If Redis is unavailable:

```text
PostgreSQL remains available
        |
        v
Queue operations continue
        |
        v
Redis rebuild/recovery
```

---

# 55. Distributed Locks

Use Redis/Upstash locks for short-lived coordination.

Examples:

```text
Slot booking
Token generation
Calling next token
Payment processing
Duplicate event handling
```

Lock pattern:

```text
Acquire Lock
    |
    v
Perform Transaction
    |
    v
Commit
    |
    v
Release Lock
```

Locks must have short TTLs and safe ownership tokens.

---

# 56. Appointment Booking Consistency

Recommended flow:

```text
POST /appointments
      |
      v
Validate request
      |
      v
Acquire slot lock
      |
      v
Begin PostgreSQL transaction
      |
      v
SELECT slot FOR UPDATE
      |
      v
Check capacity
      |
      v
Create appointment
      |
      v
Increment booked_count
      |
      v
Create token
      |
      v
Commit
      |
      v
Release lock
```

Database transaction is the final authority.

---

# 57. Token Generation

Token numbers should be unique per centre/day.

Recommended:

```text
centre_id + token_date + token_sequence
```

Example:

```text
C001
28-08-2026
A-047
```

Generation must be concurrency-safe.

Recommended database mechanism:

- Transaction
- Row lock
- Sequence/counter record
- Unique constraint

---

# 58. Queue Realtime Flow

```text
Staff updates token
       |
       v
PostgreSQL transaction
       |
       v
Outbox event
       |
       v
Event processor
       |
       +--> Redis
       |
       +--> WebSocket Gateway
       |
       +--> Notification Service
```

---

# 59. Outbox Pattern

Recommended table:

`outbox_events`

| Column | Type |
|---|---|
| id | UUID PK |
| event_type | VARCHAR(100) |
| aggregate_type | VARCHAR(100) |
| aggregate_id | UUID |
| payload | JSONB |
| status | ENUM |
| attempts | INTEGER |
| processed_at | TIMESTAMPTZ nullable |
| created_at | TIMESTAMPTZ |

Status:

```text
PENDING
PROCESSING
PROCESSED
FAILED
```

This prevents database changes from being committed while corresponding events are lost.

---

# 60. NestJS Module Structure

Recommended:

```text
src/
├── auth/
├── users/
├── roles/
├── permissions/
├── farmers/
├── staff/
├── centres/
├── departments/
├── appointments/
├── queue/
├── check-in/
├── weighment/
├── quality/
├── procurement/
├── payments/
├── receipts/
├── ai/
├── tee/
├── notifications/
├── announcements/
├── reports/
├── audit/
├── support/
├── settings/
├── realtime/
├── common/
└── database/
```

---

# 61. NestJS Layering

Each major module should follow:

```text
Controller
   ↓
DTO
   ↓
Service
   ↓
Domain / Business Logic
   ↓
Repository / ORM
   ↓
PostgreSQL
```

Infrastructure adapters:

```text
Redis Adapter
Notification Adapter
Payment Adapter
TEE Adapter
Object Storage Adapter
```

Business logic should not directly depend on a specific vendor.

---

# 62. API Versioning

Use:

```text
/api/v1/
```

Examples:

```text
GET    /api/v1/centres
POST   /api/v1/appointments
GET    /api/v1/appointments/:id
POST   /api/v1/appointments/:id/check-in
GET    /api/v1/queue/:centreId
POST   /api/v1/tokens/:id/call
POST   /api/v1/weighments
POST   /api/v1/quality-checks
POST   /api/v1/procurements
POST   /api/v1/payments/:id/approve
```

---

# 63. Authentication API

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/send-otp
POST /api/v1/auth/verify-otp
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/mfa/verify
```

---

# 64. Farmer APIs

```text
GET  /api/v1/farmer/dashboard
GET  /api/v1/farmer/appointments
POST /api/v1/farmer/appointments
GET  /api/v1/farmer/appointments/:id
PATCH /api/v1/farmer/appointments/:id
POST /api/v1/farmer/appointments/:id/cancel

GET  /api/v1/farmer/queue
GET  /api/v1/farmer/procurements
GET  /api/v1/farmer/payments
GET  /api/v1/farmer/history
GET  /api/v1/farmer/notifications
GET  /api/v1/farmer/profile
PATCH /api/v1/farmer/profile
```

---

# 65. Staff APIs

```text
GET  /api/v1/staff/dashboard
GET  /api/v1/staff/queue
POST /api/v1/staff/tokens/:id/call
POST /api/v1/staff/tokens/:id/hold
POST /api/v1/staff/tokens/:id/recall
POST /api/v1/staff/tokens/:id/skip

POST /api/v1/staff/check-ins
POST /api/v1/staff/weighments
POST /api/v1/staff/quality-checks
POST /api/v1/staff/procurements

GET  /api/v1/staff/appointments
GET  /api/v1/staff/payments
GET  /api/v1/staff/reports
```

---

# 66. Centre Admin APIs

```text
GET   /api/v1/centre-admin/dashboard
GET   /api/v1/centre-admin/staff
POST  /api/v1/centre-admin/staff
PATCH /api/v1/centre-admin/staff/:id

GET   /api/v1/centre-admin/prices
POST  /api/v1/centre-admin/prices

GET   /api/v1/centre-admin/payments
POST  /api/v1/centre-admin/payments/:id/approve

GET   /api/v1/centre-admin/audit-logs
GET   /api/v1/centre-admin/settings
PATCH /api/v1/centre-admin/settings
```

---

# 67. Administrative Admin APIs

```text
GET   /api/v1/admin/dashboard

GET   /api/v1/admin/centres
POST  /api/v1/admin/centres
GET   /api/v1/admin/centres/:id
PATCH /api/v1/admin/centres/:id

GET   /api/v1/admin/centre-verifications
POST  /api/v1/admin/centres/:id/approve
POST  /api/v1/admin/centres/:id/reject

GET   /api/v1/admin/users
PATCH /api/v1/admin/users/:id

GET   /api/v1/admin/roles
PATCH /api/v1/admin/roles/:id/permissions

GET   /api/v1/admin/reports
GET   /api/v1/admin/audit-logs

GET   /api/v1/admin/settings
PATCH /api/v1/admin/settings
```

---

# 68. WebSocket Events

Namespace:

```text
/ws
```

Recommended events:

```text
queue.updated
queue.token_called
queue.token_completed
appointment.updated
procurement.updated
payment.updated
notification.created
centre.status_changed
```

Client subscriptions:

```text
centre:{centreId}
appointment:{appointmentId}
token:{tokenId}
user:{userId}
```

Authorization must be applied before subscription.

---

# 69. Database Indexes

Recommended indexes:

```text
users(mobile)
users(email)

appointments(centre_id, slot_id)
appointments(farmer_id, created_at)
appointments(centre_id, status, created_at)

tokens(centre_id, token_date, token_sequence)
tokens(centre_id, token_date, status)

queue_events(token_id, created_at)

weighments(appointment_id)
quality_checks(appointment_id)

procurements(farmer_id, created_at)
procurements(centre_id, created_at)

payments(farmer_id, created_at)
payments(centre_id, status, created_at)

notifications(user_id, read_at, created_at)

audit_logs(actor_id, created_at)
audit_logs(resource_type, resource_id, created_at)
audit_logs(centre_id, created_at)
```

Use partial indexes where they materially improve active-record queries.

---

# 70. Transaction Boundaries

The following operations should be transactional:

### Appointment Booking

```text
Check capacity
+
Create appointment
+
Reserve slot
+
Create token
```

### Weighment

```text
Validate appointment
+
Create weighment
+
Update workflow state
+
Emit event
```

### Quality

```text
Validate weighment
+
Create quality check
+
Update procurement eligibility
+
Emit event
```

### Procurement

```text
Validate quality
+
Resolve price rule
+
Calculate amount
+
Create procurement
+
Create payment pending record
```

### Payment Approval

```text
Verify procurement
+
Verify payment
+
TEE evidence check
+
Approve
+
Audit
```

---

# 71. Financial Calculation Rules

Backend calculation:

```text
gross_amount =
accepted_quantity × authorized_rate

net_amount =
gross_amount - total_deductions
```

The server must:

- Resolve the correct historical price rule.
- Validate quantity.
- Validate deductions.
- Use decimal/numeric types.
- Never use floating-point arithmetic for money.
- Recalculate the amount server-side.
- Record calculation version.

---

# 72. TEE Metadata

For TEE-backed operations, store:

```text
calculation_hash
attestation_reference
model_version
rule_version
verification_timestamp
tee_signature
```

Do not store unnecessary confidential inputs in ordinary logs.

---

# 73. Audit Requirements

Audit at minimum:

```text
Login/security events
Role changes
Permission changes
Centre approval
Centre rejection
Price changes
Appointment overrides
Queue overrides
Weighment corrections
Quality overrides
Procurement adjustments
Payment approvals
Payment reversals
System setting changes
Exports
```

Audit records must include:

```text
Who
What
When
Where/scope
Before
After
Reason
Correlation/Event ID
```

---

# 74. Soft Delete Policy

Soft deletion is recommended for:

- Users
- Centres
- Staff
- Departments
- Crops
- Settings where historical state matters

Avoid deleting:

- Payments
- Procurements
- Weighments
- Quality checks
- Audit logs
- Receipts

Use reversal/correction workflows instead.

---

# 75. Data Retention

Retention should follow applicable organizational/legal requirements.

Suggested categories:

```text
Operational cache
→ short TTL

Sessions/OTP
→ minutes/days

Notifications
→ configurable

Appointments
→ long-term

Procurement
→ long-term

Payments
→ long-term

Audit logs
→ long-term / immutable policy
```

Actual retention periods must be finalized with the governing organization.

---

# 76. API Security

NestJS should implement:

- Helmet/security headers.
- CORS allowlist.
- ValidationPipe.
- DTO validation.
- JWT validation.
- RBAC guards.
- Resource-scope guards.
- Rate limiting.
- Request size limits.
- Secure cookies where used.
- CSRF protection where cookie authentication is used.
- Structured logging.
- Correlation IDs.

---

# 77. Redis Security

For Upstash:

- TLS connections.
- Authentication credentials stored in secrets manager.
- Never expose Redis credentials to frontend.
- Use short TTLs for ephemeral data.
- Avoid storing sensitive personal data unless necessary.
- Namespace keys by environment.

Example:

```text
dev:ks:queue:...
staging:ks:queue:...
prod:ks:queue:...
```

---

# 78. Environment Separation

Use:

```text
development
staging
production
```

Separate:

- PostgreSQL database.
- Redis/Upstash database.
- API secrets.
- JWT keys.
- Payment credentials.
- TEE credentials/configuration.
- Object storage buckets.

---

# 79. Migration Strategy

Use a migration tool supported by the selected NestJS ORM.

Recommended workflow:

```text
Entity/schema change
      |
      v
Generate migration
      |
      v
Review SQL
      |
      v
Test on staging
      |
      v
Backup/rollback plan
      |
      v
Production migration
```

Never modify production schema manually without a migration record.

---

# 80. Seed Data

Development/staging seed data should include:

```text
Roles
Permissions
Admin user
Centre Admin user
Staff users
Farmer users
Departments
Centres
Crops
Centre categories
Sample price rules
Sample slots
Sample appointments
Sample queue
```

Production should use controlled provisioning.

---

# 81. Recommended Database Schema Groups

For maintainability, organize entities conceptually:

```text
Identity
├── users
├── roles
├── permissions
└── assignments

Centre
├── centres
├── categories
├── departments
├── counters
├── documents
└── settings

Farmer
├── farmer_profiles
└── farmer preferences

Appointments
├── appointment_slots
├── appointments
├── tokens
├── queue_events
└── check_ins

Procurement
├── weighments
├── quality_rules
├── quality_checks
├── price_rules
├── procurements
└── adjustments

Payments
├── payments
├── payment_verifications
└── receipts

AI
├── queue_predictions
└── ai_training_runs

Communication
├── notifications
├── notification_deliveries
└── announcements

Administration
├── audit_logs
├── system_settings
└── support_tickets
```

---

# 82. Recommended PostgreSQL Enums

Prefer database enums only for stable, tightly controlled states.

Examples:

```text
user_status
centre_status
verification_status
appointment_status
token_status
payment_status
quality_result
notification_priority
notification_channel
```

For rapidly changing configuration values, use lookup tables or strings with application validation.

---

# 83. API Response Standard

Recommended response structure:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "SLOT_UNAVAILABLE",
    "message": "This slot is no longer available."
  },
  "meta": {
    "requestId": "..."
  }
}
```

Do not expose database stack traces.

---

# 84. Pagination

For standard lists:

```text
?page=1&limit=20
```

Response:

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

For very large/high-frequency event lists, cursor pagination should be preferred.

---

# 85. Idempotency

Idempotency keys should be supported for critical POST operations.

Recommended:

```text
POST /appointments
POST /payments
POST /procurements
```

Header:

```text
Idempotency-Key: <uuid>
```

Store request/result mapping for an appropriate period.

---

# 86. Concurrency Controls

Protect against:

- Double booking.
- Double token generation.
- Duplicate payment.
- Double approval.
- Duplicate procurement.
- Simultaneous queue actions.

Use:

```text
PostgreSQL constraints
+
Transactions
+
Row locks
+
Redis short-lived locks
+
Idempotency keys
```

---

# 87. Observability

Backend should emit:

### Metrics

```text
API latency
API error rate
DB connection pool
Redis latency
Queue size
Average wait
Prediction latency
Payment success rate
Notification delivery rate
```

### Logs

Use structured JSON logs with:

```text
timestamp
level
requestId
userId
centreId
action
duration
errorCode
```

Never log:

- Passwords
- OTP values
- Access tokens
- Payment secrets
- Sensitive identity data

---

# 88. Health Endpoints

Recommended:

```text
GET /health
GET /health/live
GET /health/ready
```

Readiness checks:

```text
PostgreSQL
Redis
Critical dependencies
```

Do not expose sensitive dependency details publicly.

---

# 89. Backup & Recovery

PostgreSQL:

- Automated backups.
- Point-in-time recovery where available.
- Periodic restore tests.

Redis:

- Treat as recoverable cache/coordination state.
- Do not rely on Redis for permanent financial records.

Important principle:

> Loss of Redis must not mean loss of procurement or payment history.

---

# 90. Final Backend Flow

```text
                    CLIENT
                       |
                       v
                 NestJS API
                       |
          +------------+-------------+
          |            |             |
          v            v             v
       Auth/RBAC    Business      WebSocket
                    Services
                       |
              +--------+--------+
              |                 |
              v                 v
        PostgreSQL         Redis/Upstash
        Source of Truth     Fast State
              |
       +------+------+
       |      |      |
       v      v      v
    Audit   AI/TEE  Reports
```

---

# 91. Core Principle

The backend must preserve a clear separation:

```text
POSTGRESQL
= Permanent truth

REDIS / UPSTASH
= Fast temporary state

NESTJS
= Business rules + orchestration

TEE
= Trusted sensitive computation

AUDIT
= Immutable accountability
```

The architecture should remain correct even if Redis, WebSocket connections, or external notification services temporarily fail.

---

# 92. Backend Implementation Priority

## Phase 1 — Foundation

```text
NestJS
PostgreSQL
Redis/Upstash
Authentication
RBAC
Users
Centres
```

## Phase 2 — Core Operations

```text
Appointments
Slots
Tokens
Queue
Check-In
```

## Phase 3 — Procurement

```text
Weighment
Quality
Price Rules
Procurement
```

## Phase 4 — Payments

```text
Payment Records
Verification
TEE Integration
Receipts
```

## Phase 5 — Intelligence

```text
Queue Prediction
AI Model Registry
Analytics
```

## Phase 6 — Administration

```text
Centre Management
Staff
Permissions
Reports
Announcements
Audit
Settings
```

---

# 93. Final Schema Goal

The backend schema should make it possible to answer, for any procurement transaction:

```text
Who was the farmer?
        ↓
Which centre?
        ↓
Which appointment?
        ↓
Which token?
        ↓
When did check-in happen?
        ↓
What was weighed?
        ↓
What was the quality result?
        ↓
Which price rule was used?
        ↓
What procurement was created?
        ↓
How was the amount calculated?
        ↓
Was it TEE verified?
        ↓
Who approved the payment?
        ↓
Was payment completed?
        ↓
Which receipt was generated?
        ↓
What audit events occurred?
```

This traceability chain is the central database design principle of Kisan Setu.
