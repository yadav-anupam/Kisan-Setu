# Kisan Setu --- Application Flow Document

**Problem Statement:** SIH26032\
**Product:** Kisan Setu --- Intelligent Agricultural Procurement & Queue
Management Platform\
**Version:** 1.0\
**Date:** 28 August 2026

------------------------------------------------------------------------

# 1. Document Purpose

This document defines the complete end-to-end application flow of Kisan
Setu.

It explains how users move through the platform, how data moves between
modules, what happens at each procurement stage, and how the Farmer,
Staff, Centre Admin, and Administrative Admin roles interact with the
system.

The application is designed around one core journey:

> **Discover → Book → Check In → Queue → Weigh → Quality Check → Procure
> → Pay → Track → Audit**

------------------------------------------------------------------------

# 2. User Roles

Kisan Setu has four primary operational roles and supporting access
levels.

  Role                   Scope             Main Responsibility
  ---------------------- ----------------- -----------------------------------------
  Farmer                 Own records       Book appointments and track procurement
  Staff                  Assigned centre   Operate daily procurement workflow
  Centre Admin           Assigned centre   Manage centre operations and staff
  Administrative Admin   All centres       Manage the complete platform

Additional technical/support roles may include Auditor and Support
Agent.

------------------------------------------------------------------------

# 3. Complete System Flow

``` text
                         KISAN SETU
                             |
              +--------------+--------------+
              |              |              |
           Farmer          Staff       Administration
              |              |              |
              v              v              v
       Find Centre       Centre Ops      Global Control
              |              |              |
              v              v              v
        Book Slot        Check-In       Centre Management
              |              |              |
              v              v              v
          Token --------> Queue <-------- Admin Control
              |              |
              +------+-------+
                     |
                     v
                 Weighment
                     |
                     v
               Quality Check
                     |
                     v
                Procurement
                     |
                     v
                  Payment
                     |
                     v
                 Receipt
                     |
                     v
              History / Audit
```

------------------------------------------------------------------------

# 4. First-Time Visitor Flow

``` text
Landing Page
    |
    +--> About Us
    |
    +--> How It Works
    |
    +--> Features
    |
    +--> For Farmers
    |
    +--> For Centres
    |
    +--> Contact Us
    |
    +--> Login
    |
    +--> Register
```

## Landing Page

The user sees:

-   Kisan Setu introduction.
-   Main value proposition.
-   Book a procurement slot.
-   Track live queue.
-   Track procurement.
-   Track payments.
-   How the platform works.
-   Benefits for farmers.
-   Benefits for centres.
-   Contact/support information.

------------------------------------------------------------------------

# 5. Authentication Flow

## Farmer Registration

``` text
Register
   |
   v
Enter Mobile Number
   |
   v
Request OTP
   |
   v
Verify OTP
   |
   v
Enter Farmer Details
   |
   v
Validate Details
   |
   v
Create Farmer Account
   |
   v
Farmer Dashboard
```

## Existing Farmer Login

``` text
Login
  |
  v
Mobile Number
  |
  v
OTP
  |
  v
OTP Verification
  |
  v
Farmer Dashboard
```

## Staff/Admin Login

``` text
Login
  |
  v
Email/Username + Password
  |
  v
MFA (if enabled)
  |
  v
Role Verification
  |
  v
Centre/Global Scope Verification
  |
  v
Role Dashboard
```

------------------------------------------------------------------------

# 6. Farmer Complete Flow

``` text
Farmer
  |
  v
Login / Register
  |
  v
Dashboard
  |
  +--> Find Centre
  |      |
  |      v
  |   Select Centre
  |      |
  |      v
  |   View Availability
  |
  +--> Book New Slot
         |
         v
      Select Crop
         |
         v
      Enter Expected Quantity
         |
         v
      Select Date
         |
         v
      Select Available Slot
         |
         v
      Confirm Booking
         |
         v
      Appointment Created
         |
         v
      Token Generated
         |
         v
      Confirmation
```

------------------------------------------------------------------------

# 7. Farmer --- Book New Slot Flow

## Step 1: Centre Selection

``` text
Book New Slot
     |
     v
Search Centre
     |
     v
Filter by:
- State
- District
- Location
- Crop
     |
     v
Select Centre
```

The application retrieves:

-   Centre name.
-   Address.
-   Distance where location permission is available.
-   Supported crops.
-   Operating hours.
-   Available dates.
-   Available slots.
-   Current queue status.

------------------------------------------------------------------------

# 8. Farmer --- Slot Selection

``` text
Select Centre
      |
      v
Select Crop
      |
      v
Expected Quantity
      |
      v
Select Date
      |
      v
Available Slots
      |
      v
Select Slot
      |
      v
Booking Summary
```

Booking summary:

``` text
Centre: ABC Procurement Centre
Crop: Wheat
Expected Quantity: 50 kg
Date: 28 Aug 2026
Time: 10:00 AM – 11:00 AM
```

------------------------------------------------------------------------

# 9. Farmer --- Booking Validation

Before confirmation:

``` text
Check Authentication
        |
        v
Check Centre Status
        |
        v
Check Centre Operating Hours
        |
        v
Check Crop Support
        |
        v
Check Slot Capacity
        |
        v
Check Existing Booking
        |
        v
Create Appointment
```

The booking operation must be transactional.

If the final slot is taken by another user at the same time, the farmer
receives:

> "This slot is no longer available. Please select another slot."

------------------------------------------------------------------------

# 10. Farmer --- Token Generation

After successful booking:

``` text
Appointment Created
       |
       v
Token Service
       |
       v
Generate Centre-Day Token
       |
       v
Attach Token to Appointment
       |
       v
Send Confirmation
```

Example:

``` text
Appointment ID: APP-10291
Token: KS-2608280042
Centre: C001
Date: 28 Aug 2026
Slot: 10:00–11:00
```

------------------------------------------------------------------------

# 11. Farmer --- Appointment Management

From **My Appointments**:

``` text
Upcoming
    |
    +--> View
    +--> Reschedule
    +--> Cancel
    +--> View Token
    +--> View Queue
```

Rules:

-   Rescheduling depends on centre policy.
-   Cancellation must release the reserved capacity.
-   Completed appointments cannot be cancelled.
-   Every privileged override is audited.

------------------------------------------------------------------------

# 12. Farmer --- Before Arrival

The notification system sends:

``` text
Booking Confirmed
       |
       v
Reminder
       |
       v
Queue/Arrival Recommendation
       |
       v
Turn Approaching
```

Possible channels:

-   Push notification.
-   SMS.
-   In-app notification.

------------------------------------------------------------------------

# 13. Farmer --- Check-In Flow

``` text
Farmer Arrives
      |
      v
Open Appointment
      |
      v
Check-In
      |
      v
Validate:
- Appointment
- Date
- Centre
- Eligibility
      |
      v
Check-In Successful
      |
      v
Token Activated
      |
      v
Join Live Queue
```

If the farmer is not eligible:

``` text
Check-In
   |
   v
Validation Failed
   |
   v
Show Reason
   |
   v
Support / Staff Assistance
```

------------------------------------------------------------------------

# 14. Farmer --- Live Queue Flow

``` text
Live Queue
    |
    +--> Current Token
    |
    +--> My Token
    |
    +--> Farmers Ahead
    |
    +--> Estimated Waiting Time
    |
    +--> Active Counters
    |
    +--> Queue Status
```

Example:

``` text
Now Serving: KS-2608280042
Your Token: KS-2608280055
Ahead: 13
Estimated Wait: 35 minutes
Active Counters: 4
```

------------------------------------------------------------------------

# 15. AI Waiting-Time Prediction Flow

``` text
Queue State
    +
Active Counters
    +
Average Service Time
    +
Historical Centre Data
    +
Current Time
    +
Recent Throughput
    |
    v
Feature Validation
    |
    v
TEE-protected Inference
    |
    v
Prediction
    |
    v
Estimated Waiting Time
    +
Confidence
```

Example:

``` text
Estimated Wait: 32 minutes
Confidence: 91%
```

------------------------------------------------------------------------

# 16. TEE AI Flow

``` text
Backend
   |
   | Minimum required features
   v
TEE Adapter
   |
   v
Secure Enclave
   |
   +--> Validate feature payload
   |
   +--> Verify model integrity
   |
   +--> Run inference
   |
   +--> Generate result
   |
   v
Signed / Verified Result
   |
   v
Backend
   |
   v
Farmer UI
```

If TEE verification fails:

``` text
TEE Failure
   |
   v
Do not return trusted prediction
   |
   v
Fallback to safe queue-based estimate
   OR
Show prediction temporarily unavailable
```

The selected production policy should distinguish a normal operational
estimate from a TEE-verified result.

------------------------------------------------------------------------

# 17. Staff Complete Operational Flow

``` text
Staff Login
    |
    v
Staff Dashboard
    |
    +--> Live Queue
    |
    +--> Token Management
    |
    +--> Farmer Check-In
    |
    +--> Appointments
    |
    +--> Weighment
    |
    +--> Quality Check
    |
    +--> Procurement
    |
    +--> Payments
    |
    +--> Reports
```

------------------------------------------------------------------------

# 18. Staff --- Live Queue Flow

``` text
Live Queue
    |
    v
View Waiting Tokens
    |
    v
View Counters
    |
    v
Select Eligible Token
    |
    v
Call Token
    |
    v
Token Status = CALLED
    |
    v
Farmer Notification
    |
    v
Processing
```

------------------------------------------------------------------------

# 19. Token Management Flow

``` text
Token Management
      |
      +--> Issue Token
      |
      +--> Call Token
      |
      +--> Hold Token
      |
      +--> Recall Token
      |
      +--> Skip / No Show
      |
      +--> Complete Token
```

Every exceptional action must record:

``` text
Actor
Reason
Timestamp
Token
Previous State
New State
```

------------------------------------------------------------------------

# 20. Farmer Check-In --- Staff Flow

Staff can search:

``` text
Token Number
OR
Appointment ID
OR
Farmer Mobile
```

Then:

``` text
Search
  |
  v
Retrieve Appointment
  |
  v
Verify Farmer
  |
  v
Verify Appointment
  |
  v
Check In
  |
  v
Activate Token
```

------------------------------------------------------------------------

# 21. Weighment Flow

``` text
Token Called
     |
     v
Farmer at Weighment
     |
     v
Record Gross Weight
     |
     v
Record Tare Weight
     |
     v
Calculate Net Weight
     |
     v
Validate Measurement
     |
     v
Save Weighment
     |
     v
Move to Quality Check
```

Calculation:

``` text
Net Weight = Gross Weight - Tare Weight
```

The backend recalculates the value.

------------------------------------------------------------------------

# 22. Quality Check Flow

``` text
Weighment Completed
       |
       v
Quality Check
       |
       v
Select Crop/Quality Rules
       |
       v
Enter Parameters
       |
       v
Calculate/Determine Grade
       |
       +------------+
       |            |
    ACCEPTED      REJECTED
       |            |
       v            v
 Procurement     Exception
```

Quality data includes:

-   Grade.
-   Moisture/other applicable parameters.
-   Acceptance status.
-   Rejection reason.
-   Staff/operator.
-   Timestamp.

------------------------------------------------------------------------

# 23. Procurement Flow

``` text
Quality Accepted
      |
      v
Procurement Record
      |
      v
Accepted Quantity
      |
      v
Authorized Rate
      |
      v
Gross Amount
      |
      v
Deductions
      |
      v
Net Amount
      |
      v
Payment Pending
```

Example:

``` text
Quantity: 48.2 kg
Rate: ₹2,125/kg
Gross: ₹102,425
Deductions: ₹0
Net: ₹102,425
```

The frontend must never be the authority for the final amount.

------------------------------------------------------------------------

# 24. Payment Flow

``` text
Payment Pending
       |
       v
Validation
       |
       v
TEE Payment Verification
       |
       v
Payment Result
       |
       v
Centre Admin Approval
       |
       v
Payment Processing
       |
       +----------+
       |          |
    Success     Failure
       |          |
       v          v
Completed      Retry/Review
       |
       v
Receipt
       |
       v
Farmer Notification
```

------------------------------------------------------------------------

# 25. TEE Payment Flow

``` text
Weighment
    +
Quality
    +
Authorized Price
    +
Policy Rules
       |
       v
Backend Validation
       |
       v
TEE
       |
       v
Trusted Calculation
       |
       v
Rule Verification
       |
       v
Cryptographic Signature
       |
       v
Payment Service
```

TEE response:

``` text
verified = true
netAmount = ...
signature = ...
ruleVersion = ...
```

------------------------------------------------------------------------

# 26. Farmer Procurement Tracking

The farmer can see:

``` text
My Procurement
       |
       +--> Quantity
       +--> Rate
       +--> Gross Value
       +--> Deductions
       +--> Net Value
       +--> Quality Result
       +--> Payment Status
```

------------------------------------------------------------------------

# 27. Farmer Payment Tracking

``` text
Payments
   |
   +--> Pending
   |
   +--> Approved
   |
   +--> Processing
   |
   +--> Completed
   |
   +--> Failed
```

Completed payments show:

-   Amount.
-   Date.
-   Transaction reference.
-   Procurement ID.
-   Receipt.

------------------------------------------------------------------------

# 28. Farmer History Flow

``` text
History
   |
   +--> Appointments
   +--> Tokens
   +--> Procurement
   +--> Quality
   +--> Payments
   +--> Receipts
```

Filters:

-   Date.
-   Centre.
-   Crop.
-   Status.

------------------------------------------------------------------------

# 29. Farmer Notifications Flow

``` text
Business Event
      |
      v
Notification Service
      |
      +--> In-App
      +--> Push
      +--> SMS
      +--> Email
```

Examples:

``` text
BOOKING_CONFIRMED
TOKEN_GENERATED
REMINDER
TURN_APPROACHING
QUEUE_DELAY
WEIGHMENT_COMPLETED
QUALITY_COMPLETED
PROCUREMENT_COMPLETED
PAYMENT_APPROVED
PAYMENT_COMPLETED
```

------------------------------------------------------------------------

# 30. Centre Admin Flow

``` text
Centre Admin Login
        |
        v
Centre Dashboard
        |
        +--> Payments
        +--> Price Management
        +--> Appointments
        +--> Tokens
        +--> Procurement
        +--> Weighment
        +--> Quality
        +--> Reports
        +--> Farmers
        +--> Staff Management
        +--> Notifications
        +--> Audit Logs
        +--> Settings
```

------------------------------------------------------------------------

# 31. Centre Admin --- Dashboard Flow

Dashboard displays:

``` text
Today's Farmers
Tokens Issued
Total Quantity
Total Procurement Value
Payments Completed
```

Operational pipeline:

``` text
Check-In
   ↓
Weighment
   ↓
Quality
   ↓
Procurement
   ↓
Payments
```

Additional widgets:

-   Pending approvals.
-   Queue status.
-   Centre alerts.
-   Top crops.
-   Recent payments.
-   Staff activity.
-   Daily trends.

------------------------------------------------------------------------

# 32. Centre Admin --- Staff Management

``` text
Staff Management
      |
      +--> Staff List
      +--> Add Staff
      +--> Edit Staff
      +--> Activate/Deactivate
      +--> Assign Department
      +--> Assign Permission
      +--> View Activity
```

A Centre Admin cannot assign global Administrative Admin privileges.

------------------------------------------------------------------------

# 33. Centre Admin --- Price Management

``` text
Price Management
      |
      v
Select Crop
      |
      v
Enter Authorized Rate
      |
      v
Set Effective Date
      |
      v
Review
      |
      v
Confirm
      |
      v
Audit Log
```

Price changes are high-risk actions and must be audited.

------------------------------------------------------------------------

# 34. Centre Admin --- Audit Flow

``` text
Admin Action
     |
     v
Audit Service
     |
     v
Create Event
     |
     v
Hash Previous Event
     |
     v
Generate Current Event Hash
     |
     v
Optional TEE Signature
     |
     v
Store Audit Event
```

------------------------------------------------------------------------

# 35. Administrative Admin Flow

``` text
Administrative Login
        |
        v
Global Dashboard
        |
        +--> Centre Management
        +--> Centre Verification
        +--> Centre Categories
        +--> User & Role Management
        +--> Staff Management
        +--> Departments
        +--> Permission Management
        +--> System Settings
        +--> Reports & Analytics
        +--> Announcements
        +--> Notifications
        +--> Audit Logs
        +--> Help & Support
        +--> Global Settings
```

------------------------------------------------------------------------

# 36. Administrative Dashboard Flow

Global dashboard displays:

``` text
Total Centres
Active Centres
Total Farmers
Farmers Today
Total Procurement
Total Procurement Value
Completed Payments
Pending Approvals
```

Analytics:

``` text
State
  ↓
District
  ↓
Centre
  ↓
Crop
  ↓
Procurement / Payment / Queue
```

------------------------------------------------------------------------

# 37. Centre Management Flow

``` text
Centre Management
       |
       +--> View Centres
       |
       +--> Add New Centre
       |
       +--> Verification
       |
       +--> Categories
       |
       +--> Edit Centre
       |
       +--> Activate/Deactivate
```

------------------------------------------------------------------------

# 38. Add New Centre Flow

``` text
Add New Centre
      |
      v
Basic Details
      |
      v
Address
      |
      v
Location
      |
      v
Operating Hours
      |
      v
Supported Crops
      |
      v
Capacity / Counters
      |
      v
Documents
      |
      v
Submit
      |
      v
Verification Queue
```

------------------------------------------------------------------------

# 39. Centre Verification Flow

``` text
Submitted
    |
    v
Document Review
    |
    +--> Invalid → Needs Changes
    |
    v
Location / Details Validation
    |
    v
Final Review
    |
    +--> Approved
    |
    +--> Rejected
    |
    +--> Needs Changes
```

Approved centres become available to farmers.

------------------------------------------------------------------------

# 40. User & Role Management Flow

``` text
Users
  |
  v
Search / Filter
  |
  v
Select User
  |
  +--> View
  +--> Edit
  +--> Activate
  +--> Deactivate
  +--> Assign Role
  +--> Assign Centre
  +--> Assign Department
```

Role changes create an audit event.

------------------------------------------------------------------------

# 41. Permission Management Flow

``` text
Permission Management
       |
       v
Select Role
       |
       v
View Permissions
       |
       v
Modify Permissions
       |
       v
Validate Conflicts
       |
       v
Save
       |
       v
Audit Log
```

Permission evaluation:

``` text
User
 ↓
Role
 ↓
Permission
 ↓
Resource Scope
 ↓
Allow / Deny
```

------------------------------------------------------------------------

# 42. Department Management Flow

Example:

``` text
Departments
    |
    +--> Operations
    +--> Weighment
    +--> Quality
    +--> Procurement
    +--> Payments
    +--> Support
    +--> Administration
```

Staff can be assigned to one or more permitted operational areas
according to centre policy.

------------------------------------------------------------------------

# 43. System Settings Flow

``` text
System Settings
      |
      +--> General
      +--> Security
      +--> Notifications
      +--> Queue Rules
      +--> Appointment Rules
      +--> Payment Rules
      +--> Localization
      +--> Integrations
      +--> AI Configuration
      +--> TEE Configuration
```

High-risk settings require privileged access and audit logging.

------------------------------------------------------------------------

# 44. Reports & Analytics Flow

``` text
Reports
   |
   v
Select Report
   |
   v
Select Filters
   |
   v
Query Data
   |
   v
Aggregate
   |
   v
Display Charts/Table
   |
   +--> Export CSV
   +--> Export Excel
   +--> Export PDF
```

------------------------------------------------------------------------

# 45. Announcements Flow

``` text
Admin Creates Announcement
        |
        v
Select Audience
        |
        v
Select Centres/Regions
        |
        v
Set Schedule
        |
        v
Publish
        |
        v
Notification Service
        |
        v
Users Receive Announcement
```

------------------------------------------------------------------------

# 46. Support Flow

``` text
User
  |
  v
Help & Support
  |
  +--> FAQ
  |
  +--> Create Ticket
           |
           v
        Support Queue
           |
           v
        Assignment
           |
           v
        Resolution
           |
           v
        User Notification
```

------------------------------------------------------------------------

# 47. Cross-Role Procurement Flow

This is the most important business flow.

``` text
                    FARMER
                      |
                  Book Slot
                      |
                      v
                 Appointment
                      |
                      v
                 Check-In
                      |
                      v
                     TOKEN
                      |
          +-----------+-----------+
          |                       |
       STAFF                   FARMER
          |                       |
       Queue  <------------- Live Queue
          |
          v
       Weighment
          |
          v
     Quality Check
          |
          +----------+
          |          |
      Accepted    Rejected
          |          |
          v          v
     Procurement   Exception
          |
          v
    Payment Pending
          |
          v
   TEE Verification
          |
          v
  Centre Admin Approval
          |
          v
      Payment
          |
          v
      Receipt
          |
          v
       FARMER
```

------------------------------------------------------------------------

# 48. Full Token State Flow

``` text
CREATED
   |
   v
WAITING
   |
   v
CALLED
   |
   v
PROCESSING
   |
   +--> ON_HOLD
   |       |
   |       v
   |    PROCESSING
   |
   v
COMPLETED
```

Exception:

``` text
WAITING → NO_SHOW
WAITING → CANCELLED
CALLED → CANCELLED
PROCESSING → REQUIRES_REVIEW
```

------------------------------------------------------------------------

# 49. Full Appointment State Flow

``` text
DRAFT
  |
  v
CONFIRMED
  |
  v
CHECKED_IN
  |
  v
IN_QUEUE
  |
  v
PROCESSING
  |
  v
COMPLETED
```

Exceptions:

``` text
CONFIRMED → CANCELLED
CONFIRMED → RESCHEDULED
CONFIRMED → NO_SHOW
```

------------------------------------------------------------------------

# 50. Full Procurement State Flow

``` text
REGISTERED
    |
    v
WEIGHMENT_COMPLETED
    |
    v
QUALITY_CHECK
    |
    +--> REJECTED
    |
    v
PROCUREMENT_CREATED
    |
    v
PAYMENT_PENDING
    |
    v
PAYMENT_APPROVED
    |
    v
PAYMENT_PROCESSING
    |
    +--> PAYMENT_FAILED
    |        |
    |        v
    |      REVIEW/RETRY
    |
    v
PAYMENT_COMPLETED
    |
    v
COMPLETED
```

------------------------------------------------------------------------

# 51. End-to-End Data Flow

``` text
Farmer
  |
  | Appointment
  v
Appointment Service
  |
  | Token
  v
Queue Service
  |
  | Check-in
  v
Staff
  |
  | Weighment
  v
Weighment Service
  |
  | Quality
  v
Quality Service
  |
  | Procurement
  v
Procurement Service
  |
  | Payment calculation
  v
TEE
  |
  | Verified result
  v
Payment Service
  |
  | Approval
  v
Centre Admin
  |
  | Payment
  v
Farmer
```

------------------------------------------------------------------------

# 52. Real-Time Event Flow

``` text
Staff Action
    |
    v
Backend
    |
    v
Database Transaction
    |
    v
Domain Event
    |
    v
WebSocket / Notification Service
    |
    +--> Farmer
    +--> Staff
    +--> Centre Admin
    +--> Admin Dashboard
```

Example:

``` text
Staff completes A-35
       |
       v
Queue updated
       |
       v
Recalculate positions
       |
       v
AI waiting prediction
       |
       v
Publish queue.updated
       |
       +--> Farmer A-36
       +--> Farmer A-47
       +--> Staff dashboard
       +--> Centre Admin
```

------------------------------------------------------------------------

# 53. Offline / Poor Connectivity Flow

``` text
User Action
    |
    v
Network Available?
    |
   / \
 Yes  No
 |     |
 v     v
API   Local Safe Cache
 |     |
 v     v
Success  Pending Sync
          |
          v
      Network Returns
          |
          v
       Retry
          |
          v
      Idempotency
          |
          v
       Server
```

Critical financial operations should not be marked complete until server
confirmation is received.

------------------------------------------------------------------------

# 54. Error Handling Flow

``` text
Request
  |
  v
Authentication
  |
  +--> Failed → 401
  |
  v
Authorization
  |
  +--> Failed → 403
  |
  v
Validation
  |
  +--> Failed → 400
  |
  v
Business Rules
  |
  +--> Failed → Domain Error
  |
  v
Database
  |
  +--> Conflict → Retry / User Message
  |
  v
Success
```

User-facing errors should be understandable and should not expose
internal implementation details.

------------------------------------------------------------------------

# 55. Security Flow

Every protected request:

``` text
Client
  |
  v
TLS
  |
  v
API Gateway
  |
  v
Authentication
  |
  v
JWT / Session Validation
  |
  v
RBAC
  |
  v
Centre/Resource Scope
  |
  v
Business Authorization
  |
  v
Service
```

------------------------------------------------------------------------

# 56. Audit Flow

Privileged operation:

``` text
Admin/Staff Action
       |
       v
Authorization
       |
       v
Business Operation
       |
       v
Audit Event
       |
       v
Hash Chain
       |
       v
Optional TEE Signature
       |
       v
Audit Database
```

Actions to audit include:

-   Role changes.
-   Permission changes.
-   Centre verification.
-   Price changes.
-   Payment approvals.
-   Queue overrides.
-   Procurement corrections.
-   Weighment corrections.
-   System setting changes.
-   Data exports.

------------------------------------------------------------------------

# 57. AI Learning Loop

``` text
Completed Transactions
       |
       v
Historical Processing Data
       |
       v
Data Validation
       |
       v
Feature Engineering
       |
       v
Model Training
       |
       v
Model Evaluation
       |
       v
Approved Model
       |
       v
Model Registry
       |
       v
TEE Inference
       |
       v
Prediction
       |
       v
Actual Waiting Time
       |
       +--------------------+
                            |
                            v
                     Model Monitoring
```

The system should not automatically deploy a new model without
validation and approval.

------------------------------------------------------------------------

# 58. Administrative Monitoring Flow

``` text
All Centres
    |
    v
Global Dashboard
    |
    +--> Centre Performance
    +--> Queue Performance
    +--> Procurement
    +--> Payments
    +--> Quality
    +--> Staff Activity
    +--> System Health
    +--> Security Events
```

------------------------------------------------------------------------

# 59. Centre Performance Flow

``` text
Centre
  |
  +--> Farmers Served
  +--> Average Waiting Time
  +--> Average Processing Time
  +--> Procurement Quantity
  +--> Procurement Value
  +--> Payment Completion
  +--> Quality Rejection Rate
  +--> Staff Productivity
```

------------------------------------------------------------------------

# 60. Notification Priority

## Critical

-   Payment failure.
-   Security event.
-   Centre closure.
-   Appointment cancellation.

## High

-   Turn approaching.
-   Centre delay.
-   Payment approval.

## Normal

-   Booking confirmation.
-   Reminder.
-   Announcement.

## Informational

-   Reports available.
-   Profile changes.
-   General updates.

------------------------------------------------------------------------

# 61. Dashboard Navigation Model

## Farmer

``` text
Dashboard
├── My Appointments
├── Book New Slot
├── Live Queue
├── My Procurement
├── Payments
├── History
├── Notifications
├── Profile
└── Help & Support
```

## Staff

``` text
Dashboard
├── Live Queue
├── Token Management
├── Farmer Check-In
├── Procurement
├── Weighment
├── Quality Check
├── Payments
├── Appointments
├── Reports
├── Notifications
├── Centre Settings
├── Users & Roles
└── Help & Support
```

## Centre Admin

``` text
Dashboard
├── Payments
├── Price Management
├── Appointments
├── Token Management
├── Procurement
├── Weighment
├── Quality
├── Reports
├── Farmers
├── Staff Management
├── Notifications
├── Audit Logs
├── Settings
└── Help & Support
```

## Administrative Admin

``` text
Dashboard
├── Centre Management
│   ├── All Centres
│   ├── Add New Centre
│   ├── Centre Verification
│   └── Centre Categories
├── User & Role Management
├── Staff Management
│   └── Departments
├── Permission Management
├── System Settings
├── Reports & Analytics
├── Announcements
├── Notifications
├── Audit Logs
├── Help & Support
└── Global Settings
```

------------------------------------------------------------------------

# 62. Complete SIH Demonstration Flow

``` text
1. Open Kisan Setu
        ↓
2. Farmer Login
        ↓
3. Find Procurement Centre
        ↓
4. Select Crop
        ↓
5. Select Quantity
        ↓
6. Select Slot
        ↓
7. Confirm Appointment
        ↓
8. Receive Token
        ↓
9. Check In
        ↓
10. Open Live Queue
        ↓
11. AI Shows Estimated Waiting Time
        ↓
12. Staff Calls Token
        ↓
13. Farmer Goes to Counter
        ↓
14. Weighment
        ↓
15. Quality Check
        ↓
16. Procurement Created
        ↓
17. Payment Calculation
        ↓
18. TEE Verification
        ↓
19. Centre Admin Approval
        ↓
20. Payment Completed
        ↓
21. Farmer Receives Notification
        ↓
22. Receipt Generated
        ↓
23. Record Appears in History
        ↓
24. Audit Log Updated
```

------------------------------------------------------------------------

# 63. Ideal User Experience

The farmer should always know:

``` text
Where am I?
      ↓
What happens next?
      ↓
How long will it take?
      ↓
What has been completed?
      ↓
How much will I receive?
      ↓
When is payment completed?
      ↓
Where is my proof?
```

The staff member should always know:

``` text
Who is next?
      ↓
Where is the farmer in the workflow?
      ↓
What action is required?
      ↓
What exceptions need attention?
```

The Centre Admin should always know:

``` text
How busy is the centre?
      ↓
How efficiently is it operating?
      ↓
What needs approval?
      ↓
What requires intervention?
```

The Administrative Admin should always know:

``` text
How is the overall network performing?
      ↓
Which centres need attention?
      ↓
Are procurement and payments healthy?
      ↓
Are users and permissions secure?
      ↓
Are system operations auditable?
```

------------------------------------------------------------------------

# 64. Core Application Principle

Kisan Setu should make the entire procurement journey visible as one
continuous digital workflow:

``` text
FARMER
  ↓
APPOINTMENT
  ↓
TOKEN
  ↓
CHECK-IN
  ↓
LIVE QUEUE
  ↓
WEIGHMENT
  ↓
QUALITY
  ↓
PROCUREMENT
  ↓
TEE-VERIFIED CALCULATION
  ↓
PAYMENT
  ↓
RECEIPT
  ↓
HISTORY
  ↓
AUDIT
```

**The application is complete when every important step is traceable,
every role sees only what it needs, the farmer can understand their
current status, and critical computations are securely verifiable.**
