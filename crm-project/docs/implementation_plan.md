# Implementation Plan - React + Express + PostgreSQL CRM Migration

Migrate the SalesNest CRM from static Vanilla HTML/JS files to a full-stack, enterprise-grade architecture:
1. **Frontend**: React + Vite + TypeScript Single Page Application (SPA) with responsive, collapsible layouts, dynamic lists, sorting, filtering, details workspaces, and a Kanban board for Deals.
2. **Backend**: Node.js + Express REST API connecting to the local PostgreSQL `crm_db` database on port 5432 with password `2901`.
3. **Database**: Automated DDL tables initialization (for Tasks and Activities) and realistic pre-seeding (leads, companies, contacts) if the tables are empty.

---

## User Review Required

> [!IMPORTANT]
> **Authentication & Configuration**: 
> - The application will connect directly to the local PostgreSQL database using the credentials verified by you: user `postgres`, password `2901`, database `crm_db`, port `5432`.
> - We will create a `tasks` and `activities` schema in PostgreSQL to support full CRM task lists and real-time dashboard audit logs.
> - The Vanilla CSS layout styles will be migrated directly to `front end/src/index.css` to keep the premium HubSpot/Linear aesthetic.

---

## Proposed Changes

We will restructure the project folder as follows:
```
crm-project/
├── backend/
│   ├── db.js                 # PostgreSQL Pool setup
│   ├── server.js             # Express app entry point & seed runner
│   ├── package.json          # Node dependencies (express, pg, cors, dotenv)
│   └── routes/               # API routes (leads, companies, deals, contacts, tasks, activities)
│
└── front end/
    ├── index.html            # Imports Google Font & FontAwesome CDN
    ├── package.json          # Vite React App packages
    ├── vite.config.ts        # React TS bundler configuration
    └── src/
        ├── index.css         # Shared design system variables & layouts
        ├── main.tsx          # React application bootstrapper
        ├── App.tsx           # React Router mappings & layouts
        ├── components/       # Common components (Sidebar, Topbar, KPI, Modal)
        └── pages/            # Page workspaces (Dashboard, Leads, Companies, Deals, Tasks, etc.)
```

### 1. Database & Express Backend

#### [NEW] [package.json](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/backend/package.json)
- Express server configuration with `pg`, `cors`, `dotenv`, and `nodemon`.

#### [NEW] [db.js](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/backend/db.js)
- PostgreSQL Pool initialization using `pg`.

#### [NEW] [server.js](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/backend/server.js)
- Express app with JSON parsing, CORS routing, error handling, and tables initialization.
- Seed Runner: Populates the PostgreSQL tables with the full suite of CRM users, companies, contacts, leads, and deals if they are empty.

#### [NEW] API Routes in [routes/](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/backend/routes/)
- CRUD endpoints mapping directly to the PostgreSQL database tables.

---

### 2. React + TypeScript Frontend

#### [MODIFY] [index.html](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/front%20end/index.html)
- Links to FontAwesome CDN and Google Fonts.

#### [MODIFY] [package.json](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/front%20end/package.json)
- Adds `react-router-dom` for client-side routing.

#### [NEW] [index.css](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/front%20end/src/index.css)
- Imports `shared.css` variables, animations, and custom layouts.

#### [NEW] [App.tsx](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/front%20end/src/App.tsx)
- Manages routing for Dashboard, Leads, Companies, Deals, Contacts, Tasks, and Settings.
- Handles responsive, collapsible Sidebar wrapper.

#### [NEW] Page Components in [src/pages/](file:///c:/Users/KIIT0001/Desktop/crm_db/crm-project/front%20end/src/pages/)
- **`Dashboard.tsx`**: KPI blocks, conversion statistics gauge, and audit log list.
- **`Leads/LeadsPage.tsx`**: Filter and search table with page pagination and create lead modal.
- **`Leads/LeadDetailsPage.tsx`**: Three-column lead workspace.
- **`Companies/CompaniesPage.tsx`**: Directory list with filters.
- **`Companies/CompanyDetailsPage.tsx`**: Company workspace linking relationships.
- **`Deals/DealsPage.tsx`**: Interactive Kanban Board grouped by sales stages.
- **`Tasks/TasksPage.tsx`**: Task checkboxes list with status and priority toggles.

---

## Verification Plan

### Automated Tests
- Run `npm install` and start servers.
- Perform API connectivity checks using PowerShell/curl requests.

### Manual Verification
- Launch Vite development server (`npm run dev`) and test page navigations.
- Check dashboard metrics calculations on adding/deleting leads.
- Test responsive collapsible state of the sidebar.
