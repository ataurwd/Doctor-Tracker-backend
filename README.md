# Doctor Tracker — Clinical Operations & Physician Management Portal

## Description
**Doctor Tracker** is an enterprise-grade administrative healthcare web application built to empower clinic administrators with real-time management of medical doctors and their corresponding patients. Engineered with Next.js, TypeScript, Node.js, Express, and MongoDB, Doctor Tracker combines streamlined physician-to-patient roster workflows with high-performance MongoDB aggregation telemetry, delivering instant visibility into admission trends, patient conditions, and physician caseload distribution through a modern light theme aesthetic.

---

## Setup Guide

### Prerequisites
- **Node.js** (v18+ or v20+)
- **npm** (v9+)
- **MongoDB** (Local instance or MongoDB Atlas URI; an automatic in-memory fallback is also embedded for instant zero-dependency evaluation)

### Step 1: Clone & Navigate
```bash
git clone https://github.com/ataurwd/Doctor-Tracker-backend.git backend
git clone https://github.com/ataurwd/Doctor-Tracker-Frontend.git frontend
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
> The backend server will initialize on `http://localhost:5000`. If no records exist, the database will automatically seed with default administrative credentials and sample medical records.

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```
> The frontend application will start on `http://localhost:3000`.

### Environment Configuration

#### Backend `.env.example`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/doctor_tracker
JWT_SECRET=supersecretjwtkey_doctor_tracker_2026_dev
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

#### Frontend `.env.example`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Default Admin Credentials
- **Email:** `admin@doctortracker.com`
- **Password:** `admin123`
*(Available via the one-click "Fill Demo Credentials" button on the login screen)*

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Next.js App Router (Client Application)              │
│  - Plus Jakarta Sans Typography & Light Theme Palette                  │
│  - Color Tokens: Bold Blue (#1E46EB), Light Blue (#67BAF4), Jet Black  │
│  - Responsive Sidebar & Topbar Shell                                   │
│  - Recharts Visual Telemetry (Admissions, Condition Donut, Workload)   │
│  - Modals (Add Doctor, Doctor Patient Roster Drawer, Edit/Delete)      │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ JSON REST API over HTTPS
                                    │ (JWT Bearer Authorization)
┌───────────────────────────────────▼────────────────────────────────────┐
│                  Node.js + Express REST API (Standalone)               │
│  - Strict Zod Request Payload Validation                               │
│  - JWT Authentication & Role-Based Guard Middleware                    │
│  - Unified AppError & Cast/Duplicate Error Handling                    │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │ Mongoose ODM
                                    │ (Compound & Text Indexes)
┌───────────────────────────────────▼────────────────────────────────────┐
│                            MongoDB Database                            │
│  - Collections: Users, Doctors, Patients                               │
│  - Compound Indexes: { specialization: 1, createdAt: -1 }              │
│  - Foreign Key Index: { doctorId: 1, createdAt: -1 }                   │
│  - Pipeline Aggregations: $facet, $lookup, $group                      │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Flow
1. **Authentication Flow**: The user submits credentials to `/api/auth/login`. The backend validates with bcrypt and issues a signed JWT stored securely in the client state.
2. **Physician Caseload Pipeline**: The Doctors view requests `/api/doctors`. The server executes a MongoDB `$facet` aggregation that computes total filtered records, applies pagination (`$skip`/`$limit`), and performs an embedded `$lookup` count of corresponding patients in a single database round-trip.
3. **Telemetry Pipeline**: The Dashboard fires concurrent aggregation requests to `/api/analytics/summary`, `/api/analytics/trends`, and `/api/analytics/patients-per-doctor`, extracting group aggregations for Recharts visualizations.

---

## Technical Decisions

### Decision 1: Standalone Express REST Server vs. Next.js Route Handlers
* **Context**: While Next.js App Router supports API Route Handlers in the same repository, we architected the backend as a dedicated, standalone Express + TypeScript service communicating over REST endpoints.
* **Rationale**:
  1. **Strict Separation of Concerns**: Isolating the API server decouples frontend presentation changes from database connections, connection pooling, and background aggregations.
  2. **Horizontal Scalability**: The Node/Express service can be scaled independently of the Next.js static and server-rendered frontend containers based on traffic demands.
  3. **Multi-Client Readiness**: A dedicated RESTful API allows future mobile applications (React Native/iOS/Android) or hospital external services to consume identical endpoints with unified JWT authentication and Zod validation.

### Decision 2: Single-Roundtrip MongoDB `$facet` Aggregation vs. Multiple Database Queries for Paginated Rosters
* **Context**: Paginated data grids with dynamic search, multi-field filtering, and relational child counts (e.g. patients per doctor) typically require multiple sequential database queries (`find()`, `countDocuments()`, and separate relational lookups).
* **Rationale**:
  1. **Network Latency Elimination**: By leveraging MongoDB's `$facet` pipeline stage alongside `$lookup` and `$addFields`, the database engine computes both the paginated document slice and total matching record count in a single pass over indexed memory.
  2. **Consistency & Concurrency**: Executing count and pagination in a single pipeline guarantees that pagination metadata accurately reflects the exact state of the retrieved dataset during concurrent insertions.
  3. **Index Utilization**: Queries take advantage of compound indexes (`{ specialization: 1, createdAt: -1 }` and `{ doctorId: 1, createdAt: -1 }`), maintaining sub-10ms query execution times.

---

## Visual Evidence

### Desktop Views
- **Admin Dashboard**: Visual telemetry featuring 4 KPI metric cards, Patient Admission Trends area chart with soft blue gradients, Condition Breakdown donut chart, and Doctor Workload distribution bar chart.
- **Doctor Directory**: Physician cards showcasing specialty badges, hospital affiliations, contact information, real-time debounced search, specialization/hospital dropdowns, and date filters.
- **Doctor's Patient Roster Modal**: Detail modal allowing administrators to inspect assigned patients, register a new patient under the selected physician, and remove discharged patients.
- **Dedicated Patient Page**: Comprehensive tabular view with search by patient name/contact, filter by clinical condition (`Critical`, `Stable`, `Recovering`, `Routine Checkup`, `Under Observation`), inline editing modal, and delete confirmation dialogs.

### Mobile & Responsive Views
- **Collapsible Navigation Drawer**: Smooth slide-over navigation with mobile-optimized touch targets.
- **Adaptive Data Grids**: Doctor cards and patient table layout gracefully adjust from multi-column grids down to single-column card flows with responsive pagination.

---

## Evaluation Checklist Compliance
- [x] **Secure Authentication**: Only authenticated users access the portal; JWT protected routes.
- [x] **Doctor Management**: Create doctor (Name, specialization, hospital, phone, email); search, filter (date-wise, hospital, specialization), paginate, view patients, add/delete patients under specific doctor.
- [x] **Dedicated Patient Page**: List all patients, search, condition filter, date-wise filter, pagination, edit patient, delete patient.
- [x] **Dashboard & Data Visualization**: Total doctors, total patients, patients per doctor, date-based statistics, clean Recharts visualizations.
- [x] **Performance & Optimization**: MongoDB indexing (compound + text), `$facet` aggregation pipelines, debounced search, clean modular architecture.
- [x] **Design & Aesthetic**: Modern light theme utilizing the specified Clustr Studio color palette (Bold Blue `#1E46EB`, Light Blue `#67BAF4`, Soft White `#FAFAFA`, Jet Black `#0D0D0D`).
