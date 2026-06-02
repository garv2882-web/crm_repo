# SalesNest CRM Full-Stack Migration Walkthrough

This document outlines the changes, structure, and execution steps for the completed SalesNest CRM migration from a static client-side Vanilla HTML/CSS/JS interface to an enterprise-grade React (Vite + TS) SPA and a Node.js + Express + PostgreSQL database stack.

---

## 1. Directory Structure Mapped

The updated structure is laid out as follows:

```
crm-project/
├── backend/
│   ├── db.js                 # PostgreSQL Pool connection initialization
│   ├── server.js             # Express server entry point, schema migrations, and seed runner
│   ├── package.json          # Node modules: pg, express, cors, dotenv, nodemon
│   └── routes/               # Modular REST endpoints
│       ├── users.js          # GET /api/users
│       ├── companies.js      # CRUD for company profiles
│       ├── contacts.js       # CRUD for contacts directories
│       ├── leads.js          # CRUD + audit logging for leads
│       ├── deals.js          # CRUD + conversion pipeline for deals
│       ├── tasks.js          # CRUD for reminders checklist
│       └── activities.js     # GET/POST for recent audit activities log
│
├── front end/
│   ├── index.html            # Main markup page fetching fonts/FontAwesome styles
│   ├── package.json          # React + Vite + TS dependencies: react-router-dom, lucide-react
│   └── src/
│       ├── api.ts            # REST client endpoints wrapper
│       ├── index.css         # Central design variables, layout reset, and custom animations
│       ├── main.tsx          # Bootstrapping ReactDOM root element
│       ├── App.tsx           # Layout wrapper and react router mappings
│       ├── components/
│       │   ├── Sidebar.tsx   # Collapsible deep slate sidebar
│       │   └── Navbar.tsx    # Responsive top bar showing location breadcrumbs
│       └── pages/
│           ├── Dashboard.tsx # Real-time metrics gauge and recent activity audit list
│           ├── Leads/
│           │   ├── LeadsPage.tsx       # Search, filter, page pagination table & create lead modal
│           │   └── LeadDetailsPage.tsx # Detail workspace with note appending & deal conversion
│           ├── Companies/
│           │   ├── CompaniesPage.tsx       # Search, pagination directory table & company modal
│           │   └── CompanyDetailsPage.tsx # Associated contacts, leads, deals mapping and notes
│           ├── Contacts/
│           │   └── ContactsPage.tsx   # Contact profiles directories and creation modal
│           ├── Deals/
│           │   └── DealsPage.tsx      # Kanban board grouped by stage with forward/backward actions
│           ├── Tasks/
│           │   └── TasksPage.tsx      # Checklist format tasks management with checkboxes
│           └── Settings/
│               └── SettingsPage.tsx   # Firmographic metadata config and connection stats
│
└── docs/                     # Persistent system documents (implementation plans, tasks, ERDs)
```

---

## 2. Key Database Migrations

On server boot (`node server.js`):
1. **Companies**: Automatically altered to add `annual_revenue` NUMERIC(15,2) if it was missing in the legacy schema.
2. **Deals**: Automatically altered to add `company_id` UUID, `contact_id` UUID, and `sales_pipeline` VARCHAR if they were missing.
3. **Tasks Table**: Created `tasks` referencing `users(user_id)`, `leads(lead_id)`, `deals(deal_id)`, and `companies(company_id)`.
4. **Activities Table**: Created `activities` to track modifications and creations.
5. **Pre-Seeding**: Checks table rows count and seeds 24 Leads, 8 Companies, 8 Contacts, 2 Deals, 3 Activities, and 4 Users if they are empty.

---

## 3. Verification Details

- **Frontend Compilation**: Ran `npm run build` inside `front end` and it successfully compiled without TypeScript syntax errors or warnings:
  ```
  vite v8.0.16 building client environment for production...
  transforming...✓ 1760 modules transformed.
  rendering chunks...
  ✓ built in 802ms
  dist/assets/index-DBxd3kLB.css   20.87 kB
  dist/assets/index-ig4b1xlV.js   347.97 kB
  ```
- **Backend Status**: Backend boots cleanly on port 5000 and successfully connects to the PostgreSQL database pool.

---

## 4. Run Instructions

### Start Backend
In a terminal, navigate to `crm-project/backend/` and run:
```bash
npm install
npm run dev
```

### Start Frontend
In another terminal, navigate to `crm-project/front end/` and run:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:5173` to interact with the SalesNest enterprise workspace!
