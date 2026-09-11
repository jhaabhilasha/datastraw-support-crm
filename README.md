# Datastraw Support CRM System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![SQLite3](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57.svg)](https://sqlite.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready, full-stack Customer Support Ticketing CRM built for the **Datastraw Assessment Test**. Designed to handle real-world support ticket lifecycles, team collaboration notes, fast as-you-type search, filtering, and instant customer context.

---

## 🌟 Live Demo & Preview

- **Web Application URL**: [https://datastraw-support-crm-r6za.onrender.com](https://datastraw-support-crm-r6za.onrender.com)
- **Demo Video Walkthrough**: *(Replace with your 3-5 min YouTube / Loom video link)*
- **GitHub Repository**: [https://github.com/jhaabhilasha/datastraw-support-crm](https://github.com/jhaabhilasha/datastraw-support-crm)

---

## 📋 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Core Features](#-core-features)
- [Standout / Bonus Features](#-standout--bonus-features)
- [Database Design](#-database-design)
- [REST API Reference](#-rest-api-reference)
- [Local Development Setup](#-local-development-setup)
- [Automated Testing](#-automated-testing)
- [Deployment Guide](#-deployment-guide)
- [Submission Package](#-submission-package)

---

## 🏗 Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                  │
│  - Metrics & KPI Cards        - Live Search (as-you-type)   │
│  - Status Filter Tabs         - Ticket List / Table         │
│  - Ticket Creation Modal      - Detailed Drawer / View      │
│  - Internal Notes Thread      - Customer 360 History        │
│  - Canned Response Inserter   - CSV Data Export             │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend (Node.js + Express)              │
│  - POST /api/tickets           (Create ticket & auto TKT-ID)│
│  - GET  /api/tickets           (List, search, filter)       │
│  - GET  /api/tickets/:id       (Ticket detail + notes)      │
│  - PUT  /api/tickets/:id       (Update status & add note)   │
│  - POST /api/tickets/:id/notes (Add note)                   │
│  - GET  /api/tickets/stats     (Dashboard KPI metrics)      │
│  - GET  /api/tickets/export    (CSV export)                 │
│  - POST /api/seed              (Populate realistic tickets) │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQLite Database
┌──────────────────────────────▼──────────────────────────────┐
│                         SQLite DB                           │
│  - tickets (id, ticket_id, customer_name, email, etc.)      │
│  - notes   (id, ticket_id, note_text, author, created_at)   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Choices & Rationale
1. **Backend (Node.js + Express)**:
   - High throughput, asynchronous non-blocking I/O ideal for real-time ticket streaming and collaboration.
   - Clean, lightweight REST architecture without heavy framework overhead.
2. **Database (SQLite with WAL Mode)**:
   - Zero configuration, zero external service dependency, and crash-resilient with Write-Ahead Logging (`PRAGMA journal_mode = WAL`).
   - Fast sub-millisecond query latency for local and single-instance container deployments.
3. **Frontend (React 18 + Vite + Tailwind CSS)**:
   - Vite provides lightning-fast hot module replacement and an optimized production bundle.
   - Tailwind CSS delivers a modern, accessible, enterprise-grade design system reminiscent of Linear and Zendesk.
   - Lucide Icons for clean visual ergonomics.
4. **Single-Port Production Serving**:
   - In production, Express directly serves the pre-built React static files, making the app hostable on any cloud provider with zero extra CDN setup.

---

## 🚀 Core Features

| Feature | Description |
| :--- | :--- |
| **1. Create Tickets** | Customer name, email (validated), issue subject, description, priority. Auto-generates unique sequential IDs (`TKT-001`, `TKT-002`, etc.) and ISO timestamps. |
| **2. List All Tickets** | Polished data table displaying Ticket ID, Customer Name, Email, Subject snippet, Status badge, Priority, and Created Date. |
| **3. Instant Search** | Real-time, as-you-type search matching across ticket IDs, customer names, emails, subjects, and descriptions. |
| **4. Status Filtering** | Filter by `All`, `Open`, `In Progress`, and `Closed` with live badge counter indicators. |
| **5. View & Update Tickets** | Deep inspector drawer showing full ticket description, customer profile, status switcher, and internal collaboration notes. |

---

## 🌟 Standout / Bonus Features

To deliver a system genuinely tailored for high-volume support teams handling hundreds of tickets daily:

1. **KPI Metrics Dashboard**:
   - Live summary cards calculating **Total Tickets**, **Open**, **In Progress**, **Closed**, and **Resolution Rate %**.
   - Clicking any metric card instantly filters the ticket list.
2. **Customer 360 View**:
   - When inspecting any ticket, the system automatically looks up and displays all **past tickets submitted by the same customer email**, giving agents instant customer context.
3. **Canned Response Templates**:
   - One-click reply templates (*Initial Triage*, *Request Diagnostics*, *Billing Escalation*, *Fix Deployed*) allowing agents to respond in seconds.
4. **CSV Export**:
   - Download complete ticket dumps as RFC 4180-compliant CSV for business intelligence reporting.
5. **One-Click Realistic Demo Seeder**:
   - Built-in seeder with 8+ diverse enterprise scenarios (Stripe webhook timeouts, SAML SSO errors, billing chargebacks, rate limiting) with full internal notes history.
6. **Optimistic UI Updates**:
   - Status changes update immediately in the UI for a snappy, zero-lag experience.

---

## 🗄 Database Design

The schema adheres strictly to the required 2-table model:

### `tickets` Table
```sql
CREATE TABLE IF NOT EXISTS tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT UNIQUE NOT NULL,      -- e.g., TKT-001
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `notes` Table
```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id TEXT NOT NULL,             -- Foreign key referencing tickets.ticket_id
  note_text TEXT NOT NULL,
  author TEXT DEFAULT 'Support Agent',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE
);
```

---

## 🔌 REST API Reference

All endpoints return JSON and use standard HTTP status codes.

### 1. Create Ticket
- **Endpoint**: `POST /api/tickets`
- **Request Body**:
  ```json
  {
    "customer_name": "Jane Smith",
    "customer_email": "jane@company.com",
    "subject": "Unable to access billing portal",
    "description": "Getting 403 forbidden error when accessing subscription tab.",
    "priority": "High"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "ticket_id": "TKT-009",
    "created_at": "2026-09-10T10:46:00.000Z",
    "customer_name": "Jane Smith",
    "customer_email": "jane@company.com",
    "subject": "Unable to access billing portal",
    "status": "Open",
    "priority": "High"
  }
  ```

### 2. List & Filter Tickets
- **Endpoint**: `GET /api/tickets`
- **Query Parameters**:
  - `status` (Optional): `Open` | `In Progress` | `Closed` | `All`
  - `search` (Optional): String matching ID, name, email, subject, or description
  - `priority` (Optional): `Urgent` | `High` | `Medium` | `Low` | `All`
- **Response** (`200 OK`):
  ```json
  [
    {
      "id": 1,
      "ticket_id": "TKT-001",
      "customer_name": "Alex Rivera",
      "customer_email": "alex.rivera@fintechcorp.io",
      "subject": "Stripe webhook delivery failing with 504 Gateway Timeout",
      "status": "In Progress",
      "priority": "Urgent",
      "created_at": "2026-09-10T06:46:00.000Z",
      "notes_count": 2
    }
  ]
  ```

### 3. Get Ticket Details
- **Endpoint**: `GET /api/tickets/:ticket_id`
- **Response** (`200 OK`):
  ```json
  {
    "ticket_id": "TKT-001",
    "customer_name": "Alex Rivera",
    "customer_email": "alex.rivera@fintechcorp.io",
    "subject": "Stripe webhook delivery failing with 504 Gateway Timeout",
    "description": "Since 08:30 UTC today, all our invoice.paid events are returning HTTP 504...",
    "status": "In Progress",
    "priority": "Urgent",
    "created_at": "2026-09-10T06:46:00.000Z",
    "updated_at": "2026-09-10T08:15:00.000Z",
    "notes": [
      {
        "id": 1,
        "ticket_id": "TKT-001",
        "note_text": "Escalated to Infrastructure team.",
        "author": "Sarah Jenkins (L2 Support)",
        "created_at": "2026-09-10T07:15:00.000Z"
      }
    ],
    "customer_history": [
      {
        "ticket_id": "TKT-006",
        "subject": "Feature Request: Export audit logs to Amazon S3 bucket daily",
        "status": "Open",
        "priority": "Low",
        "created_at": "2026-09-10T09:00:00.000Z"
      }
    ]
  }
  ```

### 4. Update Ticket Status & Notes
- **Endpoint**: `PUT /api/tickets/:ticket_id`
- **Request Body**:
  ```json
  {
    "status": "Closed",
    "notes": "Customer confirmed resolution. Ticket closed."
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "updated_at": "2026-09-10T10:48:00.000Z",
    "ticket_id": "TKT-001",
    "status": "Closed"
  }
  ```

### 5. Additional Endpoints
- `POST /api/tickets/:ticket_id/notes`: Add an internal note (`{ note_text, author }`).
- `GET /api/tickets/stats/summary`: Fetch KPI dashboard numbers.
- `GET /api/tickets/export/csv`: Download tickets in CSV format.
- `POST /api/tickets/seed`: Reset and re-seed sample tickets.

---

## 💻 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher recommended)
- `npm` (v9 or higher)

### Quick Start (3 Steps)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jhaabhilasha/datastraw-support-crm.git
   cd datastraw-support-crm
   ```

2. **Install all dependencies**:
   ```bash
   npm run postinstall
   ```

3. **Run in Development Mode**:
   - Terminal 1 (Backend API):
     ```bash
     npm run dev:server
     ```
     *Runs on `http://localhost:5000`*
   - Terminal 2 (Frontend Vite Dev Server):
     ```bash
     npm run dev:client
     ```
     *Runs on `http://localhost:3000` with hot-reload and API proxying.*

### Single-Command Production Mode
```bash
npm run build
npm start
```
*Access the unified application directly at `http://localhost:5000`!*

---

## 🧪 Automated Testing

Run the included automated verification suite testing all required REST endpoints:
```bash
cd server
node test-suite.js
```

---

## 🚢 Deployment Guide

### Option 1: Render (Recommended - Free & Easy)
1. Fork or push this repository to GitHub.
2. Go to [dashboard.render.com](https://dashboard.render.com) and click **New + Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run build && cd server && npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV`: `production`
     - `PORT`: `5000`
5. Click **Deploy**. Your app is live with a public HTTPS URL!

### Option 2: Railway.app
1. Create a new project on [Railway.app](https://railway.app).
2. Deploy from GitHub repository.
3. Railway automatically detects `Dockerfile` or `package.json` and runs `npm run build && npm start`.

### Option 3: Docker / Docker Compose
```bash
docker-compose up --build
```
*Application will be live at `http://localhost:5000`.*

---

## 📦 Submission Package

See [SUBMISSION_GUIDE.md](./SUBMISSION_GUIDE.md) for:
- Pre-written **Submission Email** with candidate cover letter answering all required prompts.
- **3–5 Minute Video Walkthrough Script** with step-by-step cues.
- Architecture and engineering trade-off rationale.
