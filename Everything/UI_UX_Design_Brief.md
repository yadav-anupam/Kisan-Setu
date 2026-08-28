# Kisan Setu --- UI/UX Design Brief

**Product:** Kisan Setu --- Intelligent Agricultural Procurement & Queue
Management Platform\
**Problem Statement:** SIH26032\
**Document:** UI/UX Design Brief\
**Version:** 1.0\
**Date:** 28 August 2026

------------------------------------------------------------------------

# 1. Purpose

This document defines the visual, interaction, information architecture,
responsive behavior, and accessibility direction for the Kisan Setu
product.

The design must support four primary roles:

1.  Farmer
2.  Staff
3.  Centre Admin
4.  Administrative Admin

The interface should make agricultural procurement operations **simple
for farmers, efficient for staff, controllable for centre
administrators, and transparent for platform administrators**.

------------------------------------------------------------------------

# 2. Design Vision

Kisan Setu should feel:

-   Trustworthy
-   Simple
-   Modern
-   Practical
-   Fast
-   Transparent
-   Accessible
-   Rural-friendly
-   Professional enough for government/institutional operations

The core UX promise is:

> **Know your turn. Know your status. Know your payment.**

The design should avoid unnecessary complexity and should prioritize the
most important action on every screen.

------------------------------------------------------------------------

# 3. Design Principles

## 3.1 Clarity First

Users should immediately understand:

-   What is happening?
-   What should I do?
-   What happens next?
-   How long will it take?

## 3.2 Progressive Disclosure

Show essential information first and advanced information only when
required.

Example:

``` text
Your Token: KS-2608280042
12 Farmers Ahead
Estimated Wait: 32 min

[View Queue Details]
```

Do not overwhelm the farmer with internal processing data.

## 3.3 Status Must Always Be Visible

Important workflows should expose clear status indicators.

Example:

``` text
✓ Booked
✓ Checked In
● Waiting
○ Weighment
○ Quality
○ Payment
```

## 3.4 One Primary Action

Each major screen should have one visually dominant CTA.

Examples:

-   Book New Slot
-   Check In
-   Call Next Token
-   Start Weighment
-   Complete Quality Check
-   Approve Payment

## 3.5 Trust Through Transparency

The interface should clearly explain:

-   Queue position
-   Waiting estimate
-   Procurement quantity
-   Quality result
-   Price/rate
-   Payment status
-   Receipt
-   Auditability where relevant

------------------------------------------------------------------------

# 4. Target Users

## 4.1 Farmer

Primary needs:

-   Find a centre
-   Book a slot
-   Get a token
-   Check in
-   Track queue
-   Know estimated wait
-   Track procurement
-   Track payment
-   Access history and receipts

UX characteristics:

-   Mobile-first
-   Low cognitive load
-   Large touch targets
-   Simple language
-   Strong status indicators
-   Minimal typing

------------------------------------------------------------------------

## 4.2 Staff

Primary needs:

-   Manage queue
-   Check in farmers
-   Call tokens
-   Process weighment
-   Perform quality checks
-   Create procurement records
-   Handle exceptions

UX characteristics:

-   Fast scanning
-   Keyboard-friendly desktop interface
-   Dense operational information
-   Clear workflow progression
-   Minimal modal interruptions

------------------------------------------------------------------------

## 4.3 Centre Admin

Primary needs:

-   Monitor centre operations
-   Manage staff
-   Manage prices
-   Monitor payments
-   View reports
-   Manage appointments
-   Review audit activity

UX characteristics:

-   Dashboard-driven
-   Data-rich
-   Approval-focused
-   Filterable
-   Strong permission indicators

------------------------------------------------------------------------

## 4.4 Administrative Admin

Primary needs:

-   Manage all centres
-   Verify centres
-   Manage users and roles
-   Configure permissions
-   Manage system settings
-   Monitor network-wide performance
-   Review audit logs
-   Publish announcements

UX characteristics:

-   Enterprise dashboard
-   Multi-level navigation
-   Advanced filters
-   Tables
-   Analytics
-   Bulk operations
-   Strong security cues

------------------------------------------------------------------------

# 5. Brand Direction

## 5.1 Visual Personality

The visual language should combine:

``` text
Agriculture
    +
Trust
    +
Technology
    +
Government-grade reliability
```

Avoid:

-   Overly decorative agricultural imagery
-   Excessive gradients
-   Gaming-style interfaces
-   Excessive animation
-   Dense technical terminology

------------------------------------------------------------------------

# 6. Color System

The design should use a restrained agricultural-inspired palette.

## Primary

**Kisan Green**

Used for:

-   Primary buttons
-   Success states
-   Active navigation
-   Important positive actions
-   Brand identity

## Secondary

**Earth / Warm Neutral**

Used for:

-   Supporting surfaces
-   Agricultural context
-   Secondary visual accents

## Background

Use:

-   White
-   Very light neutral
-   Soft surface gray

## Status Colors

  Status   Semantic
  -------- ------------------------------
  Green    Success / Completed
  Amber    Waiting / Warning
  Red      Failed / Rejected / Critical
  Blue     Informational
  Gray     Inactive / Disabled

Do not communicate status through color alone. Always combine color
with:

-   Icon
-   Text
-   Label
-   Shape where appropriate

------------------------------------------------------------------------

# 7. Typography

Recommended hierarchy:

``` text
Display
  ↓
Page Heading
  ↓
Section Heading
  ↓
Card Heading
  ↓
Body
  ↓
Secondary Text
  ↓
Caption
```

Recommended characteristics:

-   Highly readable sans-serif
-   Strong numerical legibility
-   Clear Hindi/English rendering
-   Comfortable line height
-   Large enough text for mobile users

For farmer-facing screens, prioritize readability over information
density.

------------------------------------------------------------------------

# 8. Iconography

Icons should be:

-   Simple
-   Consistent
-   Familiar
-   Accessible
-   Recognizable at small sizes

Primary icon categories:

-   Home
-   Calendar
-   Ticket
-   Queue
-   Scale
-   Quality
-   Procurement
-   Payment
-   History
-   Bell
-   Profile
-   Help
-   Settings
-   Users
-   Security
-   Reports
-   Audit

Avoid using icons without text for critical operations.

------------------------------------------------------------------------

# 9. Layout System

Use a consistent spacing system based on multiples of 4 or 8.

Example:

``` text
4
8
12
16
24
32
40
48
64
```

Cards should use:

-   Consistent internal padding
-   Moderate corner radius
-   Clear grouping
-   Subtle borders/shadows

Avoid excessive card nesting.

------------------------------------------------------------------------

# 10. Responsive Design

The product should support:

``` text
Mobile
Tablet
Desktop
Large Desktop
```

## Farmer

Primary target:

**Mobile**

## Staff

Primary target:

**Desktop / Tablet**

## Centre Admin

Primary target:

**Desktop / Tablet**

## Administrative Admin

Primary target:

**Desktop**

------------------------------------------------------------------------

# 11. Responsive Behavior

## Mobile

Use:

-   Bottom navigation where appropriate
-   Collapsible sections
-   Full-width CTAs
-   Stacked cards
-   Horizontal scrolling for data where unavoidable

## Tablet

Use:

-   Collapsible sidebar
-   Two-column dashboards
-   Larger operational tables

## Desktop

Use:

-   Persistent sidebar
-   Multi-column dashboards
-   Data tables
-   Charts
-   Side panels

------------------------------------------------------------------------

# 12. Global Application Shell

Authenticated pages should use a consistent shell.

``` text
┌────────────────────────────────────────────────────┐
│ Logo     Page Title                Notifications   │
├──────────────┬─────────────────────────────────────┤
│              │                                     │
│ Sidebar      │ Main Content                        │
│              │                                     │
│ Dashboard    │                                     │
│ Appointments │                                     │
│ Queue        │                                     │
│ Procurement  │                                     │
│ Payments     │                                     │
│ History      │                                     │
│ Reports      │                                     │
│ Settings     │                                     │
│              │                                     │
└──────────────┴─────────────────────────────────────┘
```

The exact navigation varies by role.

------------------------------------------------------------------------

# 13. Public Website

Public pages:

``` text
Home
About Us
How It Works
Features
For Farmers
For Centres
Contact Us
Login
Register
```

------------------------------------------------------------------------

# 14. Home Page UX

Hero section:

``` text
Smarter Procurement.
Less Waiting.
Transparent Payments.

[Book a Slot]
[Track Your Queue]
```

Supporting content:

-   How it works
-   Benefits
-   Live operational concept
-   Farmer journey
-   Centre journey
-   Trust/security
-   CTA

The page should quickly explain the product to a first-time visitor.

------------------------------------------------------------------------

# 15. About Us Page

Content hierarchy:

``` text
Mission
   ↓
Problem
   ↓
Our Solution
   ↓
How Kisan Setu Helps
   ↓
Trust & Transparency
   ↓
CTA
```

Use simple illustrations and concise sections.

------------------------------------------------------------------------

# 16. How It Works Page

Use a visual step-by-step journey:

``` text
1. Book
   ↓
2. Get Token
   ↓
3. Check In
   ↓
4. Track Queue
   ↓
5. Weighment
   ↓
6. Quality Check
   ↓
7. Procurement
   ↓
8. Payment
```

This page should be understandable without technical knowledge.

------------------------------------------------------------------------

# 17. Features Page

Feature groups:

-   Smart appointment booking
-   Live queue
-   AI waiting-time prediction
-   Digital weighment
-   Quality tracking
-   Procurement tracking
-   Transparent payments
-   Notifications
-   Analytics
-   Secure audit trail

Each feature should have:

-   Icon/illustration
-   Short title
-   One-sentence explanation
-   Optional detailed action

------------------------------------------------------------------------

# 18. For Farmers Page

Focus on benefits:

``` text
Book Before You Arrive
Know Your Turn
Spend Less Time Waiting
Track Procurement
Know Your Payment
Access Your History
```

Primary CTA:

**Book a Slot**

------------------------------------------------------------------------

# 19. For Centres Page

Focus on operational benefits:

-   Queue optimization
-   Staff workflow
-   Procurement management
-   Weighment
-   Quality control
-   Payment management
-   Analytics
-   Auditability

Primary CTA:

**Manage Your Centre**

------------------------------------------------------------------------

# 20. Contact Us Page

Required sections:

-   Contact information
-   Support options
-   FAQ link
-   Contact form
-   Centre support
-   Technical support

Form:

``` text
Name
Mobile / Email
Category
Message
[Submit]
```

------------------------------------------------------------------------

# 21. Farmer Dashboard

The dashboard should answer three questions immediately:

``` text
Do I have an appointment?
Where is my token?
What is my procurement/payment status?
```

Recommended structure:

``` text
Good Morning, Farmer

Upcoming Appointment
┌───────────────────────────────────────┐
│ Centre                       │        │   
│ Date / Time                  │        │
│ Token KS-2608280042          │        │
│ [View Appointment]           │        │
└───────────────────────────────────────┘

Live Queue
┌──────────────────────────────────────┐
│ Your Token: KS-2608280042    │       │
│ Ahead: 12                    │       │
│ Wait: ~32 min                │       │
│ [View Live Queue]            │       │
└──────────────────────────────────────┘

Quick Actions
[Book Slot] [Check Queue]

Procurement
Payment
Notifications
```

------------------------------------------------------------------------

# 22. Farmer --- Book New Slot

Design as a guided flow.

``` text
Step 1 — Centre
Step 2 — Crop
Step 3 — Quantity
Step 4 — Date
Step 5 — Time
Step 6 — Confirm
```

Use a progress indicator.

The confirmation screen should clearly summarize everything before
booking.

------------------------------------------------------------------------

# 23. Farmer --- Live Queue

This is one of the most important screens.

Hero information:

``` text
YOUR TOKEN
KS-2608280042

NOW SERVING
KS-2608280006

36 PEOPLE AHEAD

ESTIMATED WAIT
320 MIN
```

Secondary:

-   Active counters
-   Queue progress
-   Last updated
-   Delay indicator

Primary CTA:

**Keep Tracking**

------------------------------------------------------------------------

# 24. Farmer --- My Procurement

Use a timeline:

``` text
Appointment
    ✓
Check-In
    ✓
Weighment
    ✓
Quality
    ✓
Procurement
    ●
Payment
    ○
```

Show key financial information separately.

------------------------------------------------------------------------

# 25. Farmer --- Payments

Payment cards:

``` text
₹XX,XXX
Payment Completed
28 Aug 2026

Procurement ID
Transaction ID
[View Receipt]
```

Pending payment:

``` text
Payment Pending
Awaiting approval
```

------------------------------------------------------------------------

# 26. Farmer --- History

Provide:

-   Search
-   Date filter
-   Centre filter
-   Crop filter
-   Status filter

Each history item should provide a compact summary and drill-down.

------------------------------------------------------------------------

# 27. Farmer --- Notifications

Group notifications by:

-   Today
-   Earlier

Notification examples:

``` text
Your turn is approaching
Payment completed
Appointment confirmed
Queue delayed
Centre announcement
```

Allow:

-   Mark as read
-   Mark all as read

------------------------------------------------------------------------

# 28. Farmer --- Profile

Sections:

``` text
Personal Information
Contact Information
Farmer Details
Preferences
Language
Notification Preferences
Security
Logout
```

Do not expose sensitive information unnecessarily.

------------------------------------------------------------------------

# 29. Farmer --- Help & Support

Use a search-first design:

``` text
How can we help?

[Search help]

Popular topics
- Booking
- Token
- Queue
- Procurement
- Payment

[Create Support Ticket]
```

------------------------------------------------------------------------

# 30. Staff Dashboard

The staff dashboard is an operational command centre.

Top metrics:

``` text
Waiting
Called
Processing
Completed
```

Primary panel:

``` text
LIVE QUEUE
KS-2608280042  Called
KS-2608280043  Waiting
KS-2608280044  Waiting
KS-2608280045  Waiting
```

Quick actions:

``` text
[Call Next]
[Check In Farmer]
[Start Weighment]
[Quality Check]
```

------------------------------------------------------------------------

# 31. Staff --- Live Queue

Prioritize speed.

Table columns:

``` text
Token
Farmer
Appointment
Status
Wait
Action
```

Actions:

-   Call
-   Recall
-   Hold
-   Skip
-   Complete

Avoid confirmation modals for routine actions where accidental execution
risk is low; use undo where appropriate.

------------------------------------------------------------------------

# 32. Staff --- Token Management

Provide:

-   Token search
-   Queue filters
-   Token state
-   Counter assignment
-   Exception actions

High-risk actions should require confirmation and a reason.

------------------------------------------------------------------------

# 33. Staff --- Farmer Check-In

Use a simple search/action workflow:

``` text
Search Farmer / Token / Appointment

Result
┌────────────────────────────┐
│ Farmer Name                │
│ Appointment                │
│ Crop                       │
│ Slot                       │
│                            │
│ [Check In]                 │
└────────────────────────────┘
```

------------------------------------------------------------------------

# 34. Staff --- Weighment

This screen should be extremely clear.

``` text
Farmer
Token
Crop

Gross Weight
[  000.00 kg ]

Tare Weight
[  000.00 kg ]

Net Weight
[  000.00 kg ]

[Save Weighment]
```

The net weight should be visually prominent.

------------------------------------------------------------------------

# 35. Staff --- Quality Check

Use structured forms rather than long free-text fields.

``` text
Crop
Quality Parameters

Parameter 1
[Value]

Parameter 2
[Value]

Grade
[Select]

Result
[Accepted / Rejected]

Reason if rejected

[Complete Quality Check]
```

------------------------------------------------------------------------

# 36. Staff --- Procurement

Show a calculation summary:

``` text
Accepted Quantity
Rate
Gross Amount
Deductions
Net Amount
```

Use read-only calculated values wherever possible.

Primary action:

**Create Procurement**

------------------------------------------------------------------------

# 37. Staff --- Payments

Use payment status workflow:

``` text
Pending
   ↓
Verified
   ↓
Approved
   ↓
Processing
   ↓
Completed
```

Clearly distinguish:

-   System verification
-   Staff action
-   Centre Admin approval
-   Payment gateway result

------------------------------------------------------------------------

# 38. Staff --- Appointments

Use calendar + list views.

Filters:

-   Today
-   Upcoming
-   Checked In
-   Completed
-   Cancelled
-   No Show

------------------------------------------------------------------------

# 39. Staff --- Reports & Analytics

Focus on operational insights:

-   Throughput
-   Average waiting time
-   Processing time
-   Queue size
-   Completed procurements
-   Rejection rate
-   Payment status

Use charts only when they improve understanding.

------------------------------------------------------------------------

# 40. Centre Admin Dashboard

The Centre Admin dashboard should emphasize centre health.

Recommended KPIs:

``` text
Farmers Today
Tokens
Procurement Quantity
Procurement Value
Payments
Average Wait
```

Operational alerts:

-   Queue overload
-   Staff shortage
-   Pending payment approvals
-   Quality rejection spike
-   Centre capacity issues

------------------------------------------------------------------------

# 41. Centre Admin --- Staff Management

Use table + drawer/modal pattern.

Table:

``` text
Name
Department
Role
Status
Last Active
Actions
```

Actions:

-   View
-   Edit
-   Assign department
-   Permissions
-   Activate/Deactivate

------------------------------------------------------------------------

# 42. Centre Admin --- Price Management

Use effective-date aware UI.

``` text
Crop
Current Rate
New Rate
Effective From
Status
```

Before saving:

``` text
Current Rate → New Rate
Effective Date
Impact
[Confirm Change]
```

Price changes should visibly indicate that the action is audited.

------------------------------------------------------------------------

# 43. Centre Admin --- Audit Logs

Provide:

-   Date/time
-   Actor
-   Action
-   Resource
-   Result
-   Severity

Filters:

-   User
-   Action
-   Date
-   Resource
-   Severity

Audit records should be read-only.

------------------------------------------------------------------------

# 44. Administrative Admin Dashboard

The global dashboard should provide a network-level overview.

KPIs:

``` text
Total Centres
Active Centres
Total Farmers
Today's Farmers
Total Procurement
Procurement Value
Completed Payments
Pending Actions
```

Global health:

``` text
Centre Health
Queue Health
Payment Health
System Health
Security Events
```

------------------------------------------------------------------------

# 45. Administrative Admin --- Centre Management

Use:

``` text
Search
Filter
Status
Region
Category
```

Centre table:

``` text
Centre
Location
Status
Capacity
Today's Volume
Verification
Actions
```

------------------------------------------------------------------------

# 46. Add New Centre

Use a multi-step wizard:

``` text
Basic Information
      ↓
Location
      ↓
Operating Hours
      ↓
Supported Crops
      ↓
Capacity
      ↓
Documents
      ↓
Review
      ↓
Submit
```

------------------------------------------------------------------------

# 47. Centre Verification

Verification screen should present:

``` text
Centre Details
Documents
Location
Operating Information
Submitted By
Submission Date
```

Primary decisions:

``` text
[Approve]
[Request Changes]
[Reject]
```

Approval/rejection should require appropriate confirmation and reason
where applicable.

------------------------------------------------------------------------

# 48. User & Role Management

Use a powerful but understandable admin table.

``` text
User
Role
Centre
Department
Status
Last Login
Actions
```

Role assignment should show:

``` text
Role
Permissions
Scope
Impact
```

------------------------------------------------------------------------

# 49. Permission Management

Recommended interface:

``` text
Role
   ↓
Modules
   ↓
Actions
   ↓
Scope
```

Example:

``` text
Procurement
☑ View
☑ Create
☐ Edit
☐ Delete
```

Dangerous permissions should have additional visual warnings.

------------------------------------------------------------------------

# 50. System Settings

Use categorized settings rather than one long page.

``` text
General
Security
Queue
Appointments
Payments
Notifications
AI
TEE
Integrations
Localization
```

Settings with major operational impact should show:

-   Current value
-   Proposed value
-   Effective time
-   Impact warning
-   Audit notice

------------------------------------------------------------------------

# 51. Reports & Analytics

Global analytics should support drill-down:

``` text
National / Global
     ↓
Region
     ↓
District
     ↓
Centre
     ↓
Crop
     ↓
Transaction
```

Charts:

-   Procurement trend
-   Queue trend
-   Payment trend
-   Quality trend
-   Centre comparison

------------------------------------------------------------------------

# 52. Announcements

Admin flow:

``` text
Create
   ↓
Audience
   ↓
Preview
   ↓
Schedule
   ↓
Publish
```

Preview should show exactly how the announcement appears to users.

------------------------------------------------------------------------

# 53. Notifications

Notification centre should support:

-   System notifications
-   Payment alerts
-   Queue alerts
-   Security alerts
-   Announcements

Administrative notification management should include:

-   Audience
-   Channel
-   Delivery status
-   Timestamp
-   Read status where applicable

------------------------------------------------------------------------

# 54. Help & Support

Admin support should include:

``` text
Search
FAQ
Tickets
Escalations
System Status
Contact Support
```

Support tickets:

``` text
Open
Assigned
In Progress
Waiting for User
Resolved
Closed
```

------------------------------------------------------------------------

# 55. Empty States

Every list page must have a meaningful empty state.

Bad:

> No data.

Good:

``` text
No appointments yet

Appointments booked by farmers
will appear here.

[View Available Slots]
```

Empty states should provide a useful next action when possible.

------------------------------------------------------------------------

# 56. Loading States

Use skeleton loading for:

-   Dashboards
-   Tables
-   Cards
-   Queue data
-   Reports

Avoid blank white screens.

For important actions:

``` text
Processing...
```

The user should understand that the action is still in progress.

------------------------------------------------------------------------

# 57. Error States

Errors must be:

-   Specific
-   Actionable
-   Non-technical
-   Recoverable where possible

Example:

Bad:

> HTTP 409

Better:

> This slot was just booked by another farmer. Please choose another
> slot.

------------------------------------------------------------------------

# 58. Success States

Use clear confirmation:

``` text
✓ Appointment Confirmed

Token: KS-2608280042
Date: 28 Aug
Time: 10:00 AM

[View Queue]
```

Success messages should explain what happened and what the user can do
next.

------------------------------------------------------------------------

# 59. Confirmation Patterns

Use confirmation for:

-   Deleting data
-   Rejecting a centre
-   Rejecting quality
-   Approving payment
-   Changing permissions
-   Changing critical settings
-   Cancelling an appointment where consequences are significant

Avoid excessive confirmation dialogs for low-risk actions.

------------------------------------------------------------------------

# 60. Forms

Form design principles:

-   One clear label per field
-   Helpful examples
-   Inline validation
-   Required fields clearly marked
-   Preserve entered values after recoverable errors
-   Avoid unnecessary fields
-   Use appropriate input types

------------------------------------------------------------------------

# 61. Data Tables

Admin tables should support:

-   Sorting
-   Filtering
-   Search
-   Pagination
-   Column visibility where useful
-   Export where authorized
-   Row actions

Mobile behavior:

-   Convert rows into cards where practical
-   Avoid forcing users to read huge tables horizontally

------------------------------------------------------------------------

# 62. Charts

Charts should have:

-   Clear titles
-   Units
-   Time range
-   Legends
-   Accessible labels
-   Empty/error states

Do not use charts purely for decoration.

------------------------------------------------------------------------

# 63. Queue Visualization

Recommended visual model:

``` text
NOW SERVING
KS-2608280042

KS-2608280043
KS-2608280044
KS-2608280045
...
KS-2608280055 ← YOU
...
```

For farmers, the queue should focus on position and estimated waiting
time.

For staff, it should focus on actionable queue state.

------------------------------------------------------------------------

# 64. Procurement Timeline

Every procurement record should have a visual timeline:

``` text
Booking
  ✓
Check-In
  ✓
Weighment
  ✓
Quality
  ✓
Procurement
  ✓
Payment
  ●
Receipt
  ○
```

This becomes the single source of visual truth for the farmer.

------------------------------------------------------------------------

# 65. AI Prediction UX

AI predictions must not appear as guaranteed facts.

Use:

``` text
Estimated wait
~320 min

Confidence
High
```

Optional supporting message:

> Based on current queue and recent centre processing activity.

If prediction is unavailable:

> Waiting time estimate is temporarily unavailable. You can still view
> your live queue position.

------------------------------------------------------------------------

# 66. TEE / Security UX

TEE should increase trust without creating unnecessary technical
complexity for normal users.

Farmer-facing:

``` text
✓ Verified Calculation
```

Optional expandable detail:

``` text
Secure calculation
Verified by Kisan Setu's trusted execution environment.
```

Admin-facing:

``` text
TEE Status
Model Integrity
Attestation Status
Last Verification
```

Do not expose cryptographic implementation details in the primary farmer
workflow.

------------------------------------------------------------------------

# 67. Accessibility

Target WCAG 2.2 AA principles where practical.

Requirements:

-   Keyboard navigation
-   Visible focus states
-   Sufficient contrast
-   Screen-reader labels
-   Semantic HTML
-   Accessible forms
-   Large touch targets
-   No color-only status
-   Reduced-motion support
-   Descriptive error messages

------------------------------------------------------------------------

# 68. Language & Localization

The design should support multilingual expansion.

Recommended architecture:

``` text
English
Hindi
Regional Languages
```

Do not hardcode text into UI components.

Text should accommodate longer translations without breaking layouts.

------------------------------------------------------------------------

# 69. Farmer-Friendly Language

Prefer:

> Your turn is coming soon.

Instead of:

> Queue position threshold reached.

Prefer:

> Payment completed.

Instead of:

> Transaction state = SUCCESS.

Prefer:

> Your crop was accepted.

Instead of:

> Quality validation passed.

------------------------------------------------------------------------

# 70. Mobile Interaction Guidelines

Farmer mobile UI should prioritize:

-   Thumb-friendly actions
-   Large CTAs
-   Minimal scrolling
-   Short forms
-   Sticky primary actions where useful
-   Clear network state
-   Offline-aware feedback

Example:

``` text
[ Book New Slot ]
```

should be easy to reach with one hand.

------------------------------------------------------------------------

# 71. Notification UX

Notifications should be actionable.

Example:

``` text
Your turn is approaching

Token KS-26082800458
13 farmers ahead
Estimated wait: 31 min

[View Queue]
```

Avoid notifications that only repeat information without an action or
useful update.

------------------------------------------------------------------------

# 72. Design System Components

Create reusable components for:

### Navigation

-   Sidebar
-   Top bar
-   Bottom navigation
-   Breadcrumbs
-   Tabs

### Content

-   Cards
-   Stat cards
-   Tables
-   Timeline
-   Empty states
-   Alerts

### Forms

-   Input
-   Select
-   Date picker
-   Time picker
-   Search
-   Checkbox
-   Radio
-   Toggle
-   File upload

### Feedback

-   Toast
-   Modal
-   Drawer
-   Confirmation
-   Progress indicator
-   Skeleton

### Status

-   Badge
-   Chip
-   Step indicator
-   Queue position
-   Payment status

------------------------------------------------------------------------

# 73. Design Tokens

Maintain centralized tokens for:

``` text
Colors
Typography
Spacing
Radius
Shadows
Borders
Breakpoints
Motion
Z-index
```

Example naming:

``` text
color.primary
color.surface
color.text
color.success
color.warning
color.error

space.1
space.2
space.3

radius.sm
radius.md
radius.lg
```

------------------------------------------------------------------------

# 74. Motion Design

Motion should communicate state, not decorate the interface.

Use animation for:

-   Queue updates
-   Status transitions
-   Loading
-   Confirmation
-   Navigation transitions

Avoid:

-   Excessive bouncing
-   Long animations
-   Distracting effects

Respect reduced-motion preferences.

------------------------------------------------------------------------

# 75. Important Microinteractions

## Queue Updated

``` text
Queue position changes
       ↓
Subtle update indicator
       ↓
New estimated wait
```

## Payment Completed

``` text
Payment status changes
       ↓
Success animation
       ↓
Receipt available
```

## Appointment Confirmed

``` text
Booking completed
       ↓
Confirmation state
       ↓
Token revealed
```

------------------------------------------------------------------------

# 76. Trust & Transparency Patterns

Use visible trust indicators:

``` text
Verified
Secure
Audited
Completed
```

Where technically meaningful.

Avoid fake badges or decorative security claims.

------------------------------------------------------------------------

# 77. Information Architecture

## Public

``` text
Home
├── About
├── How It Works
├── Features
├── For Farmers
├── For Centres
└── Contact
```

## Farmer

``` text
Dashboard
├── Appointments
├── Book Slot
├── Live Queue
├── Procurement
├── Payments
├── History
├── Notifications
├── Profile
└── Help
```

## Staff

``` text
Dashboard
├── Live Queue
├── Tokens
├── Check-In
├── Weighment
├── Quality
├── Procurement
├── Payments
├── Appointments
├── Reports
├── Notifications
├── Centre Settings
├── Users & Roles
└── Help
```

## Centre Admin

``` text
Dashboard
├── Payments
├── Price Management
├── Appointments
├── Tokens
├── Procurement
├── Weighment
├── Quality
├── Reports
├── Farmers
├── Staff Management
├── Notifications
├── Audit Logs
├── Settings
└── Help
```

## Administrative Admin

``` text
Dashboard
├── Centre Management
│   ├── Centres
│   ├── Add Centre
│   ├── Verification
│   └── Categories
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

# 78. Critical User Journeys to Prototype First

The design team should prototype these flows before secondary screens:

## Journey 1 --- Farmer Booking

``` text
Login
→ Dashboard
→ Book Slot
→ Select Centre
→ Select Crop
→ Select Slot
→ Confirm
→ Token
```

## Journey 2 --- Farmer Queue

``` text
Appointment
→ Check-In
→ Live Queue
→ AI Estimate
→ Turn Approaching
→ Counter
```

## Journey 3 --- Staff Processing

``` text
Queue
→ Call Token
→ Check-In
→ Weighment
→ Quality
→ Procurement
```

## Journey 4 --- Payment

``` text
Procurement
→ Calculation
→ TEE Verification
→ Approval
→ Payment
→ Receipt
```

## Journey 5 --- Admin Control

``` text
Admin Dashboard
→ Centre Management
→ Verification
→ Staff/Role Management
→ Reports
→ Audit
```

------------------------------------------------------------------------

# 79. Design Deliverables

The UI/UX team should produce:

### Discovery

-   User personas
-   User journeys
-   Journey pain points
-   Information architecture

### Wireframes

-   Mobile farmer flow
-   Tablet staff flow
-   Desktop centre admin
-   Desktop administrative admin

### High-Fidelity Designs

-   Public website
-   Farmer dashboard
-   Staff dashboard
-   Centre Admin dashboard
-   Administrative dashboard
-   All major operational screens

### Design System

-   Tokens
-   Components
-   Patterns
-   States
-   Accessibility guidance

### Prototype

Interactive prototype for:

-   Booking
-   Queue
-   Procurement
-   Payment
-   Admin management

------------------------------------------------------------------------

# 80. Design Acceptance Criteria

The UI/UX design is considered ready when:

-   Every primary role has a complete navigation model.
-   Farmer booking can be completed without unnecessary steps.
-   Live queue is understandable within seconds.
-   Staff can process a farmer without navigating through unrelated
    screens.
-   Procurement status is visually traceable.
-   Payment status is unambiguous.
-   Admins can locate critical management functions quickly.
-   Error and empty states are designed.
-   Responsive behavior is specified.
-   Accessibility requirements are considered.
-   Components are reusable.
-   Critical actions have appropriate confirmation.
-   AI predictions are clearly labeled as estimates.
-   TEE verification is communicated without unnecessary technical
    complexity.

------------------------------------------------------------------------

# 81. Final Design Philosophy

Kisan Setu should not feel like a collection of dashboards.

It should feel like **one connected procurement journey**.

The design language should continuously reinforce:

``` text
BOOK
  ↓
KNOW YOUR TOKEN
  ↓
KNOW YOUR TURN
  ↓
PROCESS TRANSPARENTLY
  ↓
KNOW YOUR QUALITY
  ↓
KNOW YOUR VALUE
  ↓
GET PAID
  ↓
KEEP THE RECORD
```

The ultimate UX goal is:

> **Less uncertainty for farmers, less operational friction for staff,
> better control for centre administrators, and complete visibility for
> the platform administration.**
