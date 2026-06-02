# Implementation Plan - Enterprise SaaS CRM Refactoring

Refactor and refine the CRM leads module frontend into a modular, production-grade, 3-layer inspired architecture. This transition will separate shared assets and layouts from module-specific code, creating a highly cohesive, reusable, and maintainable frontend system.

---

## Proposed Directory Layout

We will reorganize the frontend files inside `front end/` as follows:

```
front end/
│
├── shared/
│   ├── shared.css         # Global design tokens, common typography, grids, layout structure, sidebar/navbar, tables, modals, loading skeletons
│   └── shared.js          # Shared state manager (CRMDataStore), relational mock tables, dynamic sidebar/navbar injection, UI loaders
│
├── leads/
│   ├── leads-dashboard.html # Main dashboard utilizing shared layouts
│   ├── create-lead-form.html # Standalone lead creation form
│   ├── lead-details.html    # Relational details page
│   └── leads.js           # Leads module controllers, filtering, sorting, pagination rendering
│
├── deals/
│   └── deals-dashboard.html # Placeholder/Shell Deals page importing shared.css and shared.js
│
├── contacts/
│   └── contacts-dashboard.html # Placeholder/Shell Contacts page importing shared.css and shared.js
│
└── companies/
    └── companies-dashboard.html # Placeholder/Shell Companies page importing shared.css and shared.js
```

---

## User Review Required

> **Dynamic Layout Reusability**: Rather than duplicating navigation HTML headers and menus across every template, `shared.js` will export a `CRMLayout` module. HTML pages will include simple placeholders:
> ```html
> <div id="sidebar-placeholder"></div>
> <div id="navbar-placeholder"></div>
> ```
> At load time, `shared.js` will compile the collapsible sidebar (with icon-only state for compact widths) and the top navbar (injecting breadcrumbs based on the active path) dynamically. This achieves a modular architectural pattern.

---

## Proposed Changes

### 1. Shared Assets Layer

#### [NEW] [shared.css](../shared/shared.css)
- Central design system stylesheet containing variables, grids, components, responsive styles, tables, forms, modals, activities, and skeleton pulse loaders.

#### [NEW] [shared.js](../shared/shared.js)
- Common logic wrapper containing `CRMDataStore` state manager, dynamic layout builder, breadcrumbs parser, sidebar collapse, and activity feed logging.

---

### 2. Module Refactoring

#### [MODIFY] [leads-dashboard.html](../leads/leads-dashboard.html)
- Clean up to use dynamic sidebar/navbar placeholders, connect to shared stylesheet/scripts, update tables with sticky headers, and integrate KPI stats cards, conversion graphs, and loading skeletons.

#### [MODIFY] [create-lead-form.html](../leads/create-lead-form.html)
- Cleans structural markup and upgrades form layouts (multi-column grids, modern input containers, and sticky actions footers).

#### [MODIFY] [lead-details.html](../leads/lead-details.html)
- Upgrades views to use dynamic placeholders and links to shared assets.

#### [MODIFY] [leads.js](../leads/leads.js)
- Refactors code to connect page event listeners and render methods to the shared `CRMDataStore` database.

---

### 3. Navigation Target Shells

#### [NEW] [deals-dashboard.html](../deals/deals-dashboard.html)
#### [NEW] [contacts-dashboard.html](../contacts/contacts-dashboard.html)
#### [NEW] [companies-dashboard.html](../companies/companies-dashboard.html)
- Reuses shared sidebar and navbar templates, demonstrating layouts modularity.

---

## Verification Plan

### Automated Tests
- Run validation on all relative links.
- Confirm JavaScript syntax checks.

### Manual Verification
- Open `leads-dashboard.html` in Chrome.
- Test sidebar collapse (toggling between 72px and 240px) and verify icons-only representation.
- Verify breadcrumbs change as you navigate from Leads Dashboard to Lead Details or Create Lead page.
- Test loading skeleton behavior on page refresh.
- Check modal form heights and scrolling, verifying the "Create Lead" button is fully visible at all window sizes.
- Open `deals-dashboard.html`, `contacts-dashboard.html`, and `companies-dashboard.html` and verify the shared layout renders correctly.
