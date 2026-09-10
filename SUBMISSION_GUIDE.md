# Datastraw Assessment — Candidate Submission Kit

This guide contains everything you need to finalize and submit your assessment to Datastraw Technologies.

---

## 📬 1. Ready-to-Send Submission Email

**To**: `ozair.shaikh@datastraw.in`, `aryan.jaiswal@datastraw.in`  
**CC**: `talent@datastraw.in`  
**Subject**: `Datastraw Assessment Submission: Support CRM System — [Your Full Name]`

---

### Email Body (Copy & Paste)

```markdown
Hi Ozair, Aryan, and the Datastraw Talent Team,

I have completed the hiring assessment for the Customer Support Ticketing CRM System. Below are the links to my live deployed application, GitHub repository, and demo video walkthrough:

• Deployed Application: [PASTE YOUR DEPLOYED URL HERE, e.g., https://datastraw-support-crm.onrender.com]
• GitHub Repository: [PASTE YOUR GITHUB REPO URL HERE, e.g., https://github.com/your-username/datastraw-support-crm]
• Demo Video Walkthrough (3-5 mins): [PASTE YOUR YOUTUBE/LOOM LINK HERE]
• LinkedIn Profile: [PASTE YOUR LINKEDIN PROFILE URL HERE]

---

### Technical Approach & Architectural Decisions
I engineered this system as a cohesive, production-grade full-stack web application using Node.js, Express, SQLite, React (Vite), and Tailwind CSS:
1. End-to-End Type & Schema Discipline: Designed a normalized SQLite database with Write-Ahead Logging (WAL) and foreign keys, strictly adhering to the two-table requirement (`tickets` and `notes`) while keeping operations fast and ACID-compliant.
2. Unified Deployment Model: Built the client with Vite and configured Express to serve the production build directly from a single port (`5000`). This ensures zero-config, low-latency deployment to Render, Railway, or Docker without managing separate hosting environments.
3. Ergonomic API Design: Developed the 4 required REST endpoints (`POST /api/tickets`, `GET /api/tickets`, `GET /api/tickets/:id`, `PUT /api/tickets/:id`) with input sanitization, parameterized queries, and auto-incrementing sequential ticket IDs (`TKT-001`, `TKT-002`).

### Key Features & Standout Additions
Beyond fulfilling all 5 core requirements (ticket creation, listing, instant as-you-type search across multiple fields, status filtering, and deep ticket view/update), I focused on what high-velocity support teams actually need:
• Real-time KPI Metrics Cards: Instant visibility into Total, Open, In Progress, Closed tickets, and Resolution Rate %, with interactive filtering.
• Customer 360 View: Automatically queries and surfaces previous tickets opened by the same customer email, providing instant context on repeat issues.
• Quick Canned Replies: 1-click support reply templates (Initial Triage, Diagnostics Request, Billing Escalation, Resolved) to eliminate repetitive typing.
• CSV Data Export: Downloadable audit and BI reporting data.
• 1-Click Realistic Seeder: Pre-loaded with 8+ enterprise scenarios to immediately showcase the system under active workloads.

### Challenges Faced & Solutions
• Efficient As-You-Type Search: Rather than client-only filtering or heavy fuzzy search libraries, I combined SQL parameterized `LIKE` queries with indexing on status, email, and created timestamps, debounced on the frontend for snappy performance with zero UI freeze.
• Cross-Platform Build Consistency: Standardized the build pipeline across Windows, Linux, and Alpine Docker containers using multi-stage Docker builds and cross-platform npm scripts.

### Next Steps with Additional Time
With extra time, I would implement:
1. WebSockets/SSE for live collaborative ticket updates between multiple concurrent support agents.
2. Email webhook ingestion (inbound email-to-ticket via SendGrid/Postmark).
3. SLA countdown timers and automated escalation triggers for urgent tickets.

Thank you for the opportunity to work on this assignment. I look forward to your feedback and discussing the project in the next round!

Best regards,
[Your Full Name]
[Your Phone Number]
[Your LinkedIn URL]
```

---

## 🎥 2. 3–5 Minute Demo Video Walkthrough Script

Use this structured script to record your video on Loom or OBS:

### Scene 1: Introduction & Technology Stack (0:00 – 0:45)
- **Visual**: Show your face briefly + screen sharing the live deployed web application.
- **Talking Points**:
  - *"Hi Datastraw team, my name is [Your Name], and this is my submission for the Customer Support CRM hiring assignment."*
  - *"I built this full-stack application using Node.js, Express, and SQLite on the backend, paired with React 18, Vite, and Tailwind CSS on the frontend."*
  - *"My goal was to build a system that is not only clean and robust in code, but genuinely useful for a support team handling hundreds of tickets daily."*

### Scene 2: Core User Flows — Search, Filter & List (0:45 – 1:45)
- **Visual**: Navigate the dashboard.
- **Talking Points**:
  - *"On the main screen, we have a clean ticket table showing Ticket ID, Customer Name, Email, Subject, Status badge, Priority, and Timestamp."*
  - *(Type into search bar)*: *"The search bar works instantly as you type across ticket IDs, customer names, emails, subjects, and descriptions."*
  - *(Click status pills)*: *"We can filter by Open, In Progress, and Closed tickets, or click the metric cards up top for quick triage."*
  - *(Show quick status dropdown on a row)*: *"Agents can also change ticket status directly from the table row with optimistic updates."*

### Scene 3: Ticket Creation & Deep Inspection (1:45 – 2:45)
- **Visual**: Open 'Create Ticket' modal, submit a test ticket, then click into it.
- **Talking Points**:
  - *"Clicking 'Create Ticket' opens a validated modal. Let's create a ticket for an API authentication failure."*
  - *"Notice the system auto-generates sequential ticket IDs like TKT-009 with exact timestamps."*
  - *"When we click on a ticket, a detailed inspector drawer opens. Here we see full problem details and customer history."*
  - *"Under Customer 360, the system automatically detects other tickets from this same customer email, giving agents complete context."*
  - *"Agents can also write internal collaboration notes, or select from Canned Replies to respond rapidly."*

### Scene 4: Codebase & Architecture Walkthrough (2:45 – 3:45)
- **Visual**: Open VS Code or GitHub repository.
- **Talking Points**:
  - *"Looking at the codebase, we have a clean modular structure:"*
  - *"`server/src/config/database.js` sets up our SQLite database with WAL mode and creates the two normalized tables: tickets and notes."*
  - *"`server/src/controllers/ticketsController.js` implements the 4 required REST endpoints with validation, parameterized queries, and error handling."*
  - *"The frontend is built with React and Tailwind CSS, featuring reusable components for search, filtering, and ticket modals."*
  - *"In production, Express serves the pre-built React bundle, allowing single-command hosting on Render or Docker."*

### Scene 5: Standout Features & Wrap-up (3:45 – 4:30)
- **Visual**: Show CSV export download, automated test suite (`node test-suite.js` passing 14/14 tests), and deployed URL.
- **Talking Points**:
  - *"For standout features, I added live KPI metrics, Customer 360 history, canned responses, CSV export, and an automated 14-test suite."*
  - *"The app is deployed live and ready for testing. Thank you for your time!"*

---

## 🚀 3. Step-by-Step GitHub & Deployment Checklist

1. **Commit & Push Code**:
   ```bash
   git add .
   git commit -m "feat: complete Datastraw Support CRM system with standout features"
   git remote add origin https://github.com/your-username/datastraw-support-crm.git
   git branch -M main
   git push -u origin main
   ```
2. **Deploy on Render** (Takes ~3 minutes):
   - Sign in to [Render.com](https://render.com).
   - Click **New +** -> **Web Service**.
   - Select your repo `datastraw-support-crm`.
   - Build Command: `npm run build && cd server && npm install`
   - Start Command: `npm start`
   - Click **Deploy Web Service**.
3. **Verify Deployment**:
   - Open your deployed URL.
   - Click **Seed Demo Data** to populate initial tickets.
   - Create a new ticket, search, and change a status to verify live operation.
4. **Record Video & Send Email**:
   - Record your 3-5 minute video using Loom or OBS.
   - Paste the URLs into the email template above and send to `ozair.shaikh@datastraw.in` & `aryan.jaiswal@datastraw.in`, with CC to `talent@datastraw.in`.
