# Kisan Setu — Data Flow Diagram (DFD) Architecture Documentation

**Product:** Kisan Setu — Intelligent Agricultural Procurement, Dynamic Queue Management & DBT Platform  
**Problem Statement:** SIH26032 (Smart India Hackathon 2026)  
**Standard Notation:** Gane-Sarson / Yourdon & Coad Diagrammatic Notation  
**Document Version:** 1.0.0  
**Status:** Approved Architectural Specification  

---

## Table of Contents

1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [DFD Conventions, Symbols & Notations](#2-dfd-conventions-symbols--notations)
3. [External Entities & Boundary Interfacing Matrix](#3-external-entities--boundary-interfacing-matrix)
4. [DFD Level 0 — Context Diagram](#4-dfd-level-0--context-diagram)
5. [DFD Level 1 — Major Subsystem Decomposition](#5-dfd-level-1--major-subsystem-decomposition)
6. [DFD Level 2 — Detailed Sub-Process Flow Diagrams](#6-dfd-level-2--detailed-sub-process-flow-diagrams)
   - [6.1 Sub-Process 1.0: Farmer & Staff Authentication, Registration & KYC](#61-sub-process-10-farmer--staff-authentication-registration--kyc)
   - [6.2 Sub-Process 2.0: Centre Capacity, Slot Allocation & MSP Management](#62-sub-process-20-centre-capacity-slot-allocation--msp-management)
   - [6.3 Sub-Process 3.0: Slot Reservation & Digital Gate Pass Issuance](#63-sub-process-30-slot-reservation--digital-gate-pass-issuance)
   - [6.4 Sub-Process 4.0: Gate Pass QR Verification & Live Queue Orchestration](#64-sub-process-40-gate-pass-qr-verification--live-queue-orchestration)
   - [6.5 Sub-Process 5.0: Electronic Weighbridge & Tare/Gross Capture](#65-sub-process-50-electronic-weighbridge--taregross-capture)
   - [6.6 Sub-Process 6.0: Laboratory Quality Assessment & Grade Certification](#66-sub-process-60-laboratory-quality-assessment--grade-certification)
   - [6.7 Sub-Process 7.0: Procurement Finalization, Digital J-Form & DBT Payment](#67-sub-process-70-procurement-finalization-digital-j-form--dbt-payment)
   - [6.8 Sub-Process 8.0: AI/ML Queue Simulation & Wait-Time Prediction Engine](#68-sub-process-80-aiml-queue-simulation--wait-time-prediction-engine)
   - [6.9 Sub-Process 9.0: Grievance Redressal, Multi-Language & Notifications](#69-sub-process-90-grievance-redressal-multi-language--notifications)
   - [6.10 Sub-Process 10.0: Statewide Oversight, Cryptographic Audit & TEE Attestation](#610-sub-process-100-statewide-oversight-cryptographic-audit--tee-attestation)
7. [Data Store Directory (Schema Mapping)](#7-data-store-directory-schema-mapping)
8. [Data Dictionary & Payload Specifications](#8-data-dictionary--payload-specifications)
9. [Data Flow Security, Concurrency & Integrity Matrix](#9-data-flow-security-concurrency--integrity-matrix)

---

## 1. Executive Summary & Purpose

The **Kisan Setu** platform replaces archaic, opaque, and congestion-heavy traditional Mandi procurement procedures with an automated, cryptographically verifiable, and intelligent digital pipeline.

This **Data Flow Diagram (DFD)** document models the logical and physical movement of data throughout the Kisan Setu ecosystem. It defines:
- The data sources and destinations (**External Entities**).
- The business transformations and validations (**Processes**).
- The permanent and transient repositories (**Data Stores**).
- The directed conduits of information packets (**Data Flows**).

```text
+--------------------------------------------------------------------------------------------------+
|                                    CORE DATA VALUE PIPELINE                                      |
|                                                                                                  |
| [Farmer / Crop] ---> [Slot Booking] ---> [QR Gate Pass] ---> [Gate Check-In] ---> [Live Queue]   |
|                                                                                         |        |
| [DBT Direct Bank] <--- [J-Form Cert] <--- [MSP Procurement] <--- [Quality/Moisture] <--- [Scale] |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. DFD Conventions, Symbols & Notations

In accordance with Gane-Sarson and Yourdon & Coad diagrammatic standards:

| Symbol / Element | Description | Visual Representation (Mermaid) |
| :--- | :--- | :--- |
| **External Entity** | An external person, system, or organization that sends or receives data. | `[Square Rectangles / Node]` |
| **Process** | A transformation, algorithm, calculation, or validation of data. | `(Rounded Rectangle / Process)` |
| **Data Store** | A persistent storage table, cache bucket, or transactional ledger. | `[(Cylinder Database Node / Table)]` |
| **Data Flow** | Directed arrow showing the name and direction of data transmission. | `-->|Data Flow Name|` |

---

## 3. External Entities & Boundary Interfacing Matrix

| Entity Code | Entity Name | Primary Responsibilities / Data Exchanged | Interfaces Used |
| :--- | :--- | :--- | :--- |
| **E1** | **Farmer** | Books slots, presents QR gate pass, monitors real-time queue position, reviews weighment & moisture slips, receives DBT payout alerts, submits grievances. | Mobile / Responsive Web App (8 Regional Languages: en, hi, mr, pa, bho, te, kn, ml) |
| **E2** | **Mandi Gate Operator / Staff** | Scans QR gate passes, verifies vehicle registration & slot time window, authorizes check-ins, operates weighbridge & quality stations. | Staff Web Portal / Handheld PWA Scanner |
| **E3** | **Centre Admin / Supervisor** | Configures daily slot quotas, assigns counters/bays, manages operator accounts, handles manual queue overrides and disputes. | Centre Admin Portal |
| **E4** | **State / Super Admin** | Regulates statewide MSP price masters, audits cryptographic tamper logs, tracks PFMS disbursement quotas, monitors statewide heatmaps. | Master Admin Portal |
| **E5** | **UIDAI / DigiLocker API** | Verifies farmer identity, Aadhaar tokenization, and digitizes certified land title ownership records (7/12, Khasra/Khatauni). | REST / HTTPS OAuth2 API |
| **E6** | **Electronic Weighbridge (IoT)** | Transmits raw gross vehicle weight and tare weight readings directly over serial/REST to prevent manual tampering. | RS232 / TCP-IP / Web-Serial IoT Bridge |
| **E7** | **PFMS / NPCI / RBI Gateway** | Executes Direct Benefit Transfer (DBT) disbursement directly to Aadhaar-seeded farmer bank accounts. | PFMS SFTP / ISO 20022 REST Webhooks |
| **E8** | **SMS / WhatsApp Gateway** | Delivers transactional OTPs, token QR cards, status transitions, and electronic J-Form download links. | Twilio / CDAC / WhatsApp Cloud API |
| **E9** | **IMD / Weather API** | Feeds live local atmospheric parameters (temperature, humidity, precipitation) for moisture adjustments & yard planning. | OpenWeatherMap / IMD Satellite REST API |
| **E10** | **TEE / Cryptographic Auditing Service** | Performs SHA-256 tamper-hash chaining on weighbridge tickets, J-Forms, and financial transaction ledger records. | Enclave RPC / Node Crypto Service |

---

## 4. DFD Level 0 — Context Diagram

The Level 0 diagram visualizes the high-level boundary of the entire **Kisan Setu Platform System (0.0)** with all connected external actors, hardware devices, and governmental gateways.

```mermaid
flowchart TB
    subgraph ExternalEntities["External Entities & Government Gateways"]
        E1["E1: Farmer"]
        E2["E2: Mandi Staff / Operator"]
        E3["E3: Centre Admin / Supervisor"]
        E4["E4: State / Central Super Admin"]
        E5["E5: UIDAI / DigiLocker"]
        E6["E6: Electronic Weighbridge Scale"]
        E7["E7: PFMS / DBT Banking Gateway"]
        E8["E8: SMS & WhatsApp Gateway"]
        E9["E9: IMD / Weather Service"]
        E10["E10: TEE Cryptographic Notary"]
    end

    SYS(("0.0<br/>KISAN SETU<br/>CENTRAL PLATFORM<br/>SYSTEM"))

    %% Farmer Flows
    E1 -->|"Farmer Registration, KYC & Slot Booking Request"| SYS
    SYS -->|"Digital Gate Pass QR, Live Queue Position, J-Form & DBT Receipt"| E1

    %% Staff Flows
    E2 -->|"Scanned QR Token, Weighment Gross/Tare, Moisture Readings"| SYS
    SYS -->|"Farmer Verification Status, Bay Assignment, J-Form Approval"| E2

    %% Centre Admin Flows
    E3 -->|"Slot Capacity Schedule, Bay Config, Staff Allocation"| SYS
    SYS -->|"Centre Queue Metrics, Daily Procurement Tonnage, Dispute Alerts"| E3

    %% Super Admin Flows
    E4 -->|"MSP Master Rates, System Security Policies, Centre Approvals"| SYS
    SYS -->|"Statewide Analytics, Audit Hash Validation, Fund Outflow Reports"| E4

    %% Third-party APIs & Hardware
    E5 <-->|"Aadhaar OTP Validation & Land Record Metadata"| SYS
    E6 -->|"Raw Electronic Weight Stream (Gross & Tare)"| SYS
    SYS -->|"DBT Payout Batch Instruction (PFMS XML/JSON)"| E7
    E7 -->|"UTR Acknowledgment & Settlement Status"| SYS
    SYS -->|"Transactional SMS, OTPs & WhatsApp Notifications"| E8
    E9 -->|"Live Temperature, Humidity & Rain Forecasts"| SYS
    SYS <-->|"Payload Hashes & Cryptographic Attestation Proofs"| E10
```

---

## 5. DFD Level 1 — Major Subsystem Decomposition

The Level 1 diagram breaks the platform into **10 core processing subsystems**, interacting with **14 distinct PostgreSQL / Redis data stores**.

```mermaid
flowchart TB
    %% External Entities
    E1["E1: Farmer"]
    E2["E2: Mandi Staff"]
    E3["E3: Centre Admin"]
    E4["E4: Super Admin"]
    E6["E6: Electronic Scale"]
    E7["E7: PFMS DBT Gateway"]
    E8["E8: SMS Gateway"]

    %% Data Stores
    D1[("D1: Users & Auth")]
    D2[("D2: Farmer Profiles & Land")]
    D3[("D3: Centres & Counters")]
    D4[("D4: Operating Hours & Slots")]
    D5[("D5: Appointments & Tokens")]
    D6[("D6: Live Yard Queue")]
    D7[("D7: Weighment Records")]
    D8[("D8: Quality Inspection Logs")]
    D9[("D9: Procurements & J-Forms")]
    D10[("D10: DBT Ledger & Vouchers")]
    D12[("D12: MSP Price Masters")]
    D13[("D13: Cryptographic Audit Trail")]
    D14[("D14: AI/ML Queue Dataset")]

    %% Processes
    P1("1.0<br/>Authentication &<br/>Profile Management")
    P2("2.0<br/>Centre Capacity &<br/>Slot Configuration")
    P3("3.0<br/>Slot Reservation &<br/>Gate Pass Generator")
    P4("4.0<br/>Gate Pass Verification<br/>& Queue Orchestrator")
    P5("5.0<br/>Electronic Scale<br/>Weighment Processing")
    P6("6.0<br/>Quality Assessment<br/>& Moisture Grading")
    P7("7.0<br/>Procurement Finalization<br/>& DBT Disbursement")
    P8("8.0<br/>AI Predictive Queue<br/>& Wait-Time Service")
    P9("9.0<br/>Notifications &<br/>Multi-Language I18N")
    P10("10.0<br/>Statewide Analytics<br/>& Cryptographic Audit")

    %% Subsystem 1 Connections
    E1 -->|"Phone, OTP, Aadhaar, Bank"| P1
    P1 <-->|"Read/Write User Credentials"| D1
    P1 <-->|"Store Farmer Details & KYC"| D2

    %% Subsystem 2 Connections
    E3 -->|"Define Centre Slots & Hours"| P2
    E4 -->|"Set MSP Rates per Crop"| P2
    P2 <-->|"Write Operating Capacities"| D3
    P2 <-->|"Generate Available Slot Matrix"| D4
    P2 <-->|"Update Government MSP Rates"| D12

    %% Subsystem 3 Connections
    E1 -->|"Select Centre, Crop, Date & Slot"| P3
    P3 <-->|"Validate Slot Availability"| D4
    P3 <-->|"Verify Farmer Eligibility"| D2
    P3 -->|"Create Confirmed Appointment"| D5
    P3 -->|"Trigger Token SMS/WhatsApp"| P9

    %% Subsystem 4 Connections
    E2 -->|"Scan Gate Pass QR / Token"| P4
    P4 <-->|"Verify Token & Date"| D5
    P4 -->|"Check-in Farmer & Assign Yard Seq"| D6
    P4 -->|"Push Live State Update"| P8
    P4 -->|"Emit Status Notification"| P9

    %% Subsystem 5 Connections
    E6 -->|"Raw Weight Signal"| P5
    E2 -->|"Gross & Tare Readings"| P5
    P5 <-->|"Fetch Queue Item"| D6
    P5 -->|"Store Net Weight Ticket"| D7

    %% Subsystem 6 Connections
    E2 -->|"Moisture %, Foreign Matter, Grade"| P6
    P6 <-->|"Fetch Weighment Ticket"| D7
    P6 -->|"Store Quality Certificate"| D8

    %% Subsystem 7 Connections
    P7 <-->|"Collate Weight, Quality & MSP"| D7
    P7 <-->|"Read Quality & Moisture"| D8
    P7 <-->|"Read Current MSP Price"| D12
    P7 -->|"Generate Certified J-Form"| D9
    P7 -->|"Create Payment Instruction"| D10
    P7 -->|"Dispatch PFMS DBT Transfer"| E7
    P7 -->|"Send Audit Record"| P10

    %% Subsystem 8 Connections
    D6 -->|"Live Queue Length & Wait Times"| P8
    P8 <-->|"Historical Wait Dataset"| D14
    P8 -->|"Dynamic Waiting Time & Rush ETA"| E1
    P8 -->|"Capacity Recommendations"| E3

    %% Subsystem 9 Connections
    P9 -->|"Transactional Alerts"| E8
    E8 -->|"SMS / WhatsApp"| E1

    %% Subsystem 10 Connections
    P10 <-->|"Tamper-evident SHA-256 Hashes"| D13
    P10 -->|"Statewide Analytics & Audits"| E4
```

---

## 6. DFD Level 2 — Detailed Sub-Process Flow Diagrams

---

### 6.1 Sub-Process 1.0: Farmer & Staff Authentication, Registration & KYC

Handles citizen and staff identification, OTP issuance, Aadhaar/DigiLocker KYC, and Role-Based Access Control (RBAC).

```mermaid
flowchart TB
    E1["E1: Farmer / Staff"]
    E5["E5: UIDAI / DigiLocker"]
    D1[("D1: users & user_roles")]
    D2[("D2: farmer_profiles")]

    P1_1("1.1<br/>Capture Phone /<br/>Initiate OTP")
    P1_2("1.2<br/>Verify OTP &<br/>Issue Session JWT")
    P1_3("1.3<br/>Aadhaar & Land<br/>KYC Verification")
    P1_4("1.4<br/>Bank Account &<br/>Aadhaar Seeding Check")
    P1_5("1.5<br/>Role & Permission<br/>Resolution (RBAC)")

    E1 -->|"Phone Number"| P1_1
    P1_1 -->|"SMS OTP Request"| E1
    E1 -->|"Input OTP"| P1_2
    P1_2 <-->|"Validate Credentials"| D1
    P1_2 -->|"Authenticated Session"| P1_5

    E1 -->|"Aadhaar / Land Documents"| P1_3
    P1_3 <-->|"OAuth2 Identity & Land Title Verification"| E5
    P1_3 -->|"Verified KYC Metadata"| D2

    E1 -->|"Bank Account, IFSC, Aadhaar Linked"| P1_4
    P1_4 -->|"Persist DBT Bank Coordinates"| D2
    P1_5 -->|"Granted Permissions Payload"| E1
```

---

### 6.2 Sub-Process 2.0: Centre Capacity, Slot Allocation & MSP Management

Maintains procurement centres, operating hours, hourly capacity limits, crop seasons, and government MSP pricing.

```mermaid
flowchart TB
    E3["E3: Centre Admin"]
    E4["E4: Super Admin"]
    D3[("D3: centres & counters")]
    D4[("D4: operating_hours & slots")]
    D12[("D12: price_management")]

    P2_1("2.1<br/>Define Centre Operating<br/>Schedules & Bays")
    P2_2("2.2<br/>Compute Hourly<br/>Throughput Capacity")
    P2_3("2.3<br/>Generate Slot Matrix<br/>(2-Hour Windows)")
    P2_4("2.4<br/>Update & Lock Crop<br/>MSP Rates (Govt)")

    E3 -->|"Centre Details, Bay Counts, Working Days"| P2_1
    P2_1 -->|"Persist Centre Meta"| D3
    P2_1 -->|"Trigger Capacity Calculation"| P2_2
    P2_2 -->|"Write Daily Max Slots"| D4
    P2_3 <-->|"Refresh Available Slot Inventory"| D4

    E4 -->|"MSP Revision per Crop (e.g. Wheat ₹2,275/Qtl)"| P2_4
    P2_4 -->|"Write Government Official MSP"| D12
```

---

### 6.3 Sub-Process 3.0: Slot Reservation & Digital Gate Pass Issuance

Transforms a farmer's procurement intent into a confirmed appointment, allocates slot quotas, and generates a cryptographically signed digital gate pass with QR.

```mermaid
flowchart TB
    E1["E1: Farmer"]
    D2[("D2: farmer_profiles")]
    D4[("D4: slots")]
    D5[("D5: appointments & tokens")]
    E8["E8: SMS / WhatsApp Gateway"]

    P3_1("3.1<br/>Fetch Centres & Available<br/>Date/Time Slots")
    P3_2("3.2<br/>Validate Farmer<br/>Eligibility & Land Quota")
    P3_3("3.3<br/>Atomic Slot Decrement<br/>& Booking Creation")
    P3_4("3.4<br/>Unique Token & Secure<br/>QR Code Generator")
    P3_5("3.5<br/>Dispatch Multi-lingual<br/>Confirmation Alert")

    E1 -->|"Query Centre & Crop"| P3_1
    P3_1 <-->|"Read Real-time Slot Availability"| D4
    P3_1 -->|"Present Available Windows"| E1

    E1 -->|"Submit Booking (Centre, Crop, Qty, Slot)"| P3_2
    P3_2 <-->|"Check Max Acreage Yield Quota"| D2
    P3_2 -->|"Approved Booking Request"| P3_3

    P3_3 <-->|"Atomic Counter Increment & Slot Lock"| D4
    P3_3 -->|"Write Booking (Status: CONFIRMED)"| D5
    P3_3 -->|"Pass Booking Metadata"| P3_4

    P3_4 -->|"Generate Token & Signed QR Payload"| D5
    P3_4 -->|"Emit Token Data"| P3_5
    P3_5 -->|"Send SMS / WhatsApp Digital Pass"| E8
    P3_5 -->|"Render Digital Gate Pass"| E1
```

---

### 6.4 Sub-Process 4.0: Gate Pass QR Verification & Live Queue Orchestration

Enforces mandatory gate check-in so that only verified, present farmers enter the active yard queue.

```mermaid
flowchart TB
    E1["E1: Farmer"]
    E2["E2: Mandi Gate Staff"]
    D5[("D5: appointments & tokens")]
    D6[("D6: centre_queue (Active)")]
    D14[("D14: ml_queue_history")]
    E8["E8: SMS Gateway"]

    P4_1("4.1<br/>Scan Gate Pass QR /<br/>Manual Token Input")
    P4_2("4.2<br/>Validate Centre, Date,<br/>Slot Window & Status")
    P4_3("4.3<br/>Update Status to<br/>CHECKED_IN")
    P4_4("4.4<br/>Assign Live Queue<br/>Position & Inspection Bay")
    P4_5("4.5<br/>Broadcast Real-time<br/>Yard Queue Update")

    E1 -->|"Present QR Code on Arrival"| E2
    E2 -->|"Scan via Staff App"| P4_1
    P4_1 <-->|"Fetch Booking & Token Details"| D5

    P4_1 -->|"Token Data"| P4_2
    P4_2 -->|"Check: Date == Today & Centre == Assigned & Status == CONFIRMED"| P4_3
    
    P4_3 -->|"Set Booking Status = CHECKED_IN"| D5
    P4_3 -->|"Trigger Queue Allocation"| P4_4

    P4_4 -->|"Insert into Active Queue (FIFO/Priority)"| D6
    P4_4 -->|"Log Check-in Timestamp for AI Training"| D14
    P4_4 -->|"Emit Position Notification"| P4_5

    P4_5 -->|"Live Queue Position & Bay Screen"| E1
    P4_5 -->|"Dispatch Arrival SMS Alert"| E8
```

---

### 6.5 Sub-Process 5.0: Electronic Weighbridge & Tare/Gross Capture

Automates vehicle/produce weight capture with zero manual entry to prevent manipulation.

```mermaid
flowchart TB
    E2["E2: Weighbridge Operator"]
    E6["E6: Electronic Scale (IoT)"]
    D6[("D6: centre_queue")]
    D7[("D7: weighments")]

    P5_1("5.1<br/>Call Token to Scale Bay")
    P5_2("5.2<br/>Capture Gross Weight<br/>(Truck + Produce)")
    P5_3("5.3<br/>Capture Tare Weight<br/>(Empty Truck)")
    P5_4("5.4<br/>Compute Certified Net<br/>Weight & Create Ticket")

    D6 -->|"Current Token Serving"| P5_1
    P5_1 -->|"Farmer Moves to Scale"| E2

    E6 -->|"Gross Weight RS232/IoT Payload"| P5_2
    P5_2 -->|"Record Gross (kg)"| D7

    E6 -->|"Tare Weight RS232/IoT Payload"| P5_3
    P5_3 -->|"Record Tare (kg)"| D7

    P5_2 & P5_3 --> P5_4
    P5_4 -->|"Net Weight = Gross - Tare"| D7
    P5_4 -->|"Update Queue State: WEIGHED"| D6
```

---

### 6.6 Sub-Process 6.0: Laboratory Quality Assessment & Grade Certification

Validates moisture percentage and impurities against FAQ (Fair Average Quality) government standards.

```mermaid
flowchart TB
    E2["E2: Quality Inspector"]
    D7[("D7: weighments")]
    D8[("D8: quality_checks")]
    D6[("D6: centre_queue")]

    P6_1("6.1<br/>Collect Grain Sample<br/>& Sensor Reading")
    P6_2("6.2<br/>Input Moisture %, Foreign<br/>Matter, Broken Grain %")
    P6_3("6.3<br/>Evaluate Grade Standard<br/>(FAQ Grade A / B / C / Reject)")
    P6_4("6.4<br/>Issue Quality Certificate<br/>& Compute Net Payable Qtl")

    D7 -->|"Read Net Weight Ticket"| P6_1
    E2 -->|"Laboratory Sensor Metrics"| P6_2
    P6_2 -->|"Run Grading Rules"| P6_3

    P6_3 -->|"If Moisture <= 12%: 100% Acceptable"| P6_4
    P6_3 -->|"If Moisture > 12%: Apply Standard Moisture Deduction"| P6_4
    P6_3 -->|"If Moisture > 15%: Mark Drying Required / 24h Sun-dry"| D6

    P6_4 -->|"Save Certified Quality Log"| D8
    P6_4 -->|"Update Queue: QUALITY_APPROVED"| D6
```

---

### 6.7 Sub-Process 7.0: Procurement Finalization, Digital J-Form & DBT Payment

Computes final payout based on Net Payable Quantity × Government MSP, generates authenticated J-Form certificates, and triggers PFMS Direct Benefit Transfer.

```mermaid
flowchart TB
    E1["E1: Farmer"]
    E2["E2: Procurement Officer"]
    E7["E7: PFMS / Bank Gateway"]
    D2[("D2: farmer_profiles")]
    D7[("D7: weighments")]
    D8[("D8: quality_checks")]
    D9[("D9: procurements & j_forms")]
    D10[("D10: payments & dbt_vouchers")]
    D12[("D12: price_management")]
    D13[("D13: audit_logs (SHA-256)")]
    E8["E8: WhatsApp / SMS Gateway"]

    P7_1("7.1<br/>Calculate Total Payout<br/>(Net Qty × MSP Rate)")
    P7_2("7.2<br/>Generate Cryptographic<br/>Digital J-Form Certificate")
    P7_3("7.3<br/>Construct PFMS DBT<br/>Payment Batch Instruction")
    P7_4("7.4<br/>PFMS Execution & Webhook<br/>Reconciliation (UTR)")
    P7_5("7.5<br/>Publish Settlement Receipt<br/>& Update Farmer Ledger")

    D7 & D8 & D12 --> P7_1
    P7_1 -->|"Total MSP Amount (₹)"| P7_2
    E2 -->|"Officer Digital Signature Approval"| P7_2

    P7_2 -->|"Save J-Form Record"| D9
    P7_2 -->|"Log SHA-256 Hash"| D13
    P7_2 -->|"Trigger DBT Payment Creation"| P7_3

    D2 -->|"Aadhaar Seeded Bank Details"| P7_3
    P7_3 -->|"Save Voucher (Status: INITIATED)"| D10
    P7_3 -->|"Transmit DBT Instruction"| E7

    E7 -->|"Webhook Callback (UTR, Status: SUCCESS)"| P7_4
    P7_4 -->|"Update Voucher (Status: COMPLETED, UTR)"| D10
    P7_4 --> P7_5

    P7_5 -->|"Deliver J-Form PDF & UTR via WhatsApp/SMS"| E8
    P7_5 -->|"Real-time Balance in Farmer Portal"| E1
```

---

### 6.8 Sub-Process 8.0: AI/ML Queue Simulation & Wait-Time Prediction Engine

Uses Random Forest & Linear Regression models to continuously predict queue waiting times, counter wait estimates, and rush hour forecasts based on live yard data.

```mermaid
flowchart TB
    D6[("D6: centre_queue (Live)")]
    D4[("D4: slots & capacities")]
    D14[("D14: ml_queue_history")]
    E1["E1: Farmer"]
    E3["E3: Centre Admin"]

    P8_1("8.1<br/>Ingest Live Yard Queue State<br/>(Every 60 Seconds)")
    P8_2("8.2<br/>Feature Vector Extraction<br/>(Queue, Bays, Service Time, Hour)")
    P8_3("8.3<br/>Random Forest Inference<br/>(predict_waiting_time)")
    P8_4("8.4<br/>Autoregressive Rush Forecasting<br/>(forecast_queue)")

    D6 -->|"Active Queue Length, Average Service Rate"| P8_1
    D4 -->|"Upcoming Booked Farmers Next 1-2 Hours"| P8_1
    P8_1 --> P8_2

    P8_2 -->|"Feature Vector: [Q_len, active_counters, avg_srv, appts, hour, day]"| P8_3
    P8_3 <-->|"Trained Model Weights"| D14
    P8_3 -->|"Predicted Wait Time (Minutes)"| E1

    P8_2 -->|"Historical Hourly Flow"| P8_4
    P8_4 -->|"Next 3-Hour Congestion Forecast & Bay Allocation Recommendation"| E3
```

---

### 6.9 Sub-Process 9.0: Grievance Redressal, Multi-Language & Notifications

Delivers localization across 8 languages and handles automated dispute ticketing.

```mermaid
flowchart TB
    E1["E1: Farmer"]
    E2["E2: Mandi Staff"]
    D11[("D11: grievances & notifications")]
    E8["E8: SMS / WhatsApp Gateway"]

    P9_1("9.1<br/>Language Selection &<br/>Dynamic I18N Resolver")
    P9_2("9.2<br/>Lodge Farmer Grievance<br/>(Weighment / Payment / Token)")
    P9_3("9.3<br/>Staff Dispute Investigation<br/>& Redressal Update")
    P9_4("9.4<br/>Transactional Push & SMS Dispatcher")

    E1 -->|"Select Language (hi, mr, te, ml, etc.)"| P9_1
    P9_1 -->|"Render Translated UI Components"| E1

    E1 -->|"Submit Grievance Ticket"| P9_2
    P9_2 -->|"Store Ticket in Grievance Store"| D11
    P9_2 -->|"Alert Mandi Supervisor"| E2

    E2 -->|"Resolve Ticket & Attach Investigation Note"| P9_3
    P9_3 -->|"Update Ticket (RESOLVED)"| D11
    P9_3 --> P9_4

    P9_4 -->|"SMS / WhatsApp Notification"| E8
    E8 --> E1
```

---

### 6.10 Sub-Process 10.0: Statewide Oversight, Cryptographic Audit & TEE Attestation

Maintains tamper-evident audit logs using SHA-256 cryptographic chaining.

```mermaid
flowchart TB
    P5("5.0: Weighment")
    P7("7.0: J-Form & Payment")
    D13[("D13: audit_logs & hashes")]
    E4["E4: Super Admin / Auditor"]
    E10["E10: TEE Cryptographic Service"]

    P10_1("10.1<br/>Compute SHA-256 Hash<br/>over Payload Block")
    P10_2("10.2<br/>Chain with Previous<br/>Audit Block Hash")
    P10_3("10.3<br/>TEE Signature Attestation<br/>& Immutable Write")
    P10_4("10.4<br/>Audit Verification &<br/>Statewide Heatmap Engine")

    P5 & P7 -->|"Raw Critical Transaction Data"| P10_1
    P10_1 -->|"Digest = SHA-256(Data)"| P10_2
    P10_2 <-->|"Fetch Previous Record Hash"| D13

    P10_2 -->|"Chained Digest"| P10_3
    P10_3 <-->|"Cryptographic Signing"| E10
    P10_3 -->|"Append-Only Audit Record"| D13

    P10_4 <-->|"Verify Chain Integrity (No Alterations)"| D13
    P10_4 -->|"Cryptographically Audited Dashboard"| E4
```

---

## 7. Data Store Directory (Schema Mapping)

The table below catalogs all primary data stores in the Kisan Setu ecosystem, mapping them to PostgreSQL relational tables and Redis caching layers.

| Store ID | Data Store Name | Type | Key Fields / Schema | Retention & Access Rules |
| :--- | :--- | :--- | :--- | :--- |
| **D1** | `users`, `user_roles`, `permissions` | PostgreSQL | `id`, `phone_number`, `password_hash`, `role` (FARMER, STAFF, CENTRE_ADMIN, ADMIN), `is_active`, `created_at` | Permanent; encrypted passwords (bcrypt); JWT auth sessions. |
| **D2** | `farmer_profiles`, `farmer_land_records` | PostgreSQL | `id`, `user_id`, `farmer_code`, `aadhaar_hash`, `bank_account_number`, `ifsc_code`, `land_area_acres`, `district`, `state` | Permanent; Aadhaar tokenized; bank details encrypted at rest. |
| **D3** | `centres`, `departments`, `counters` | PostgreSQL | `id`, `code`, `name`, `district`, `state`, `latitude`, `longitude`, `daily_capacity_quintals`, `active_bays` | Permanent; public readable for centre discovery. |
| **D4** | `operating_hours`, `slots` | PostgreSQL / Redis | `id`, `centre_id`, `date`, `start_time`, `end_time`, `max_capacity_quintals`, `booked_capacity_quintals`, `is_active` | Cached in Redis for sub-millisecond concurrency during booking bursts. |
| **D5** | `appointments`, `tokens` | PostgreSQL | `id`, `appointment_code`, `token_number`, `farmer_id`, `centre_id`, `slot_id`, `crop_type`, `estimated_quantity`, `status` (`CONFIRMED`, `CHECKED_IN`, `WEIGHED`, `COMPLETED`, `CANCELLED`), `qr_payload` | Permanent; indexed by `token_number`, `farmer_id`, and `date`. |
| **D6** | `centre_queue` / `live_yard_queue` | PostgreSQL / Redis | `id`, `centre_id`, `token_number`, `farmer_id`, `queue_position`, `bay_assigned`, `check_in_time`, `status` (`WAITING`, `WEIGHING`, `QUALITY_CHECK`, `DISPATCHED`) | Real-time Redis Sorted Set (`ZSET`) + PostgreSQL log for fault tolerance. |
| **D7** | `weighments` | PostgreSQL | `id`, `appointment_id`, `token_number`, `gross_weight_kg`, `tare_weight_kg`, `net_weight_kg`, `scale_operator_id`, `scale_device_id`, `gross_time`, `tare_time` | Immutable append-only log; IoT device signature verified. |
| **D8** | `quality_checks` | PostgreSQL | `id`, `appointment_id`, `token_number`, `moisture_percentage`, `foreign_matter_percentage`, `grade` (GRADE_A, GRADE_B, FAQ, REJECTED), `inspector_id`, `deduction_kg` | Permanent; attached to weighment ticket. |
| **D9** | `procurements`, `j_forms` | PostgreSQL | `id`, `j_form_number`, `appointment_id`, `farmer_id`, `centre_id`, `crop_type`, `final_procured_weight_quintals`, `msp_rate_per_quintal`, `gross_amount`, `j_form_pdf_url`, `approval_signature` | Legal audit record; digitally signed PDF generated. |
| **D10** | `payments`, `dbt_vouchers` | PostgreSQL | `id`, `procurement_id`, `farmer_id`, `amount_rupees`, `pfms_batch_id`, `utr_number`, `payment_status` (`INITIATED`, `PROCESSING`, `SUCCESS`, `FAILED`), `disbursed_at` | Financial ledger; append-only; reconciled via PFMS webhooks. |
| **D11** | `grievances`, `notifications` | PostgreSQL | `id`, `user_id`, `ticket_number`, `category`, `description`, `status` (`OPEN`, `INVESTIGATING`, `RESOLVED`), `assigned_to`, `resolution_notes` | Permanent; accessible to farmer and assigned supervisor. |
| **D12** | `price_management` (MSP Rates) | PostgreSQL | `id`, `crop_name`, `variety`, `msp_rate_per_quintal`, `season_year`, `effective_from`, `effective_to`, `is_active` | Versioned history of official government Minimum Support Prices. |
| **D13** | `audit_logs`, `tee_metadata` | PostgreSQL | `id`, `entity_type`, `entity_id`, `action`, `actor_id`, `prev_hash`, `curr_hash`, `payload_digest`, `created_at` | Append-only; SHA-256 cryptographic chain preventing retroactive tampering. |
| **D14** | `ml_queue_history`, `datasets` | PostgreSQL / Parquet | `id`, `centre_id`, `timestamp`, `queue_length`, `active_counters`, `avg_service_time`, `arrivals_count`, `served_count`, `actual_wait_minutes` | ML training feature store; used for offline model re-training. |

---

## 8. Data Dictionary & Payload Specifications

### 8.1 Data Flows Index

| Flow ID | Flow Name | Source | Destination | Data Composition / Fields |
| :--- | :--- | :--- | :--- | :--- |
| **F01** | `FarmerRegistrationReq` | E1 | P1 | `{ phone, name, aadhaarNo, state, district, bankAccount, ifsc, landAcres }` |
| **F02** | `SlotQuery` | E1 | P3 | `{ centreId, cropType, preferredDate }` |
| **F03** | `AvailableSlotMatrix` | P3 | E1 | `[{ slotId, startTime, endTime, availableCapacityQtl, status }]` |
| **F04** | `BookingSubmission` | E1 | P3 | `{ centreId, slotId, cropType, estQuantityQtl, vehicleType, vehicleNo }` |
| **F05** | `GatePassToken` | P3 | D5, E1, E8 | `{ tokenNo: "T-20260923-042", qrPayload: "KS:TOKEN:...", slotWindow: "10:00-12:00", centre: "Mandi A" }` |
| **F06** | `ScanQRCheckIn` | E2 | P4 | `{ qrPayload, staffId, centreId, checkInTimestamp }` |
| **F07** | `LiveQueueUpdate` | P4 | D6, E1 | `{ tokenNo, queuePosition: 4, farmersAhead: 3, estWaitMinutes: 22, bayAssigned: "BAY-02" }` |
| **F08** | `RawScaleSignal` | E6 | P5 | `{ deviceSerial: "WB-01", weightKg: 14250.0, timestamp, hash }` |
| **F09** | `WeighmentTicket` | P5 | D7, P6 | `{ tokenNo, grossWeightKg: 14250, tareWeightKg: 4200, netWeightKg: 10050 }` |
| **F10** | `QualityInspectionResult`| E2 | P6 | `{ tokenNo, moisturePct: 11.8, foreignMatterPct: 0.4, grade: "GRADE_A", deductionKg: 0 }` |
| **F11** | `JFormPayload` | P7 | D9, E1 | `{ jFormNo: "JF-2026-9812", netQtl: 100.5, mspRate: 2275.0, totalAmount: 228637.5, digitalSign }` |
| **F12** | `DBTInstruction` | P7 | E7 | `{ batchId: "DBT-20260923-01", aadhaarHash, ifsc, accountNo, amount: 228637.5, crop: "Wheat" }` |
| **F13** | `PFMSSettlementReport` | E7 | P7 | `{ batchId, utrNumber: "P260923987123", status: "SUCCESS", settledAt: "2026-09-23T10:45:00Z" }` |
| **F14** | `AIFeatureVector` | D6 | P8 | `{ queue_length: 12, active_counters: 4, avg_service_time: 8.5, appointments_next_hour: 15, hour: 10, day_of_week: 3 }` |
| **F15** | `AIWaitPrediction` | P8 | E1, E3 | `{ predicted_waiting_time_minutes: 25.5, status: "moderate_traffic", rush_alert: false }` |

---

## 9. Data Flow Security, Concurrency & Integrity Matrix

```text
+---------------------------------------------------------------------------------------------------+
| LAYER               SECURITY MECHANISM                   INTEGRITY ENFORCEMENT                    |
|---------------------------------------------------------------------------------------------------|
| Client / Transport  TLS 1.3 Strict HTTPS                 Token QR Signed with RS256 Private Key   |
| Authentication      JWT (HTTP-only) + RBAC               OTP expiry: 5 mins, max 3 attempts       |
| Concurrency (Slots) Redis Distributed Locks (Redlock)    PostgreSQL Row-level Locks (FOR UPDATE)  |
| Scale Hardware      RS232 / TCP Hardware Serial Port     Checksum validation on raw byte stream   |
| Financial / J-Form  SHA-256 Append-only Chaining         PFMS double-entry reconciliation ledger  |
| Auditing            TEE Attestation Metadata             Immutable write-once PostgreSQL table    |
+---------------------------------------------------------------------------------------------------+
```

1. **Concurrency Control during Booking Surges:**  
   When hundreds of farmers simultaneously request slots during seasonal peak windows, the system utilizes **Redis atomic decrement (`DECRBY`)** backed by **PostgreSQL row-level transactional locks (`SELECT FOR UPDATE`)** to prevent double-booking or quota overflows.

2. **Tamper-Proof Weighment Bridge:**  
   Raw weight captures bypass client-side form inputs and communicate directly through authenticated backend serial connectors, appending operator ID and device hardware UUID to the immutable weighment store (**D7**).

3. **Cryptographic J-Form & DBT Audit Trail:**  
   Every issued J-Form certificate and DBT voucher calculates a SHA-256 cryptographic hash over `{ appointmentId, farmerId, netWeight, mspRate, totalAmount, previousRecordHash }`, guaranteeing that no record can be modified retroactively without breaking the cryptographic audit chain.

---

*Document compiled and certified for Kisan Setu SIH Architecture Repository.*
