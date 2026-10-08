# Hifadhi

**Predict Demand. Protect Stock. Reduce Waste.**

Hifadhi is an online perishable inventory risk prediction and decision support system for small-to-medium grocery retailers. This repository currently contains the **frontend interface phase**: a navigable React prototype that uses hard-coded demonstration data. There is no backend, database, authentication or forecasting model yet.

## Running the project

```bash
npm install     # installs react-router-dom the first time
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Demo walkthrough

- **Login:** pick a demo account (Business Admin or Inventory Manager) and select **Sign In**.
- **Register your business:** a 3-step onboarding flow (business account, first branch, confirmation). Registering creates a **single-branch** business.
- **Settings > Prototype demo options:** switch role and single or multiple branches at any time.

What changes by role and branch setup:

| | Business Admin | Inventory Manager |
|---|---|---|
| Dashboard, Products, Inventory, Add Batch, Sales, Forecasts, Risk | Yes | Yes |
| Branches and Users | Yes | No (hidden and redirected) |
| Business details in Settings | Yes | No |

With a single branch, the top bar shows the branch name instead of a selector, and redistribution suggestions are not shown.

## Project structure

```
src/
  main.jsx                 App entry: router, context provider, global styles
  App.jsx                  All routes (public, authenticated, admin-only)
  config/navigation.js     Sidebar items and role labels
  context/AppContext.jsx   Demo session, role, branch mode, added records
  data/demoData.js         Hard-coded demo data (products, batches, branches, users, sales)
  utils/format.js          Currency and date formatting helpers
  utils/inventory.js       Risk level, FEFO sorting, totals and recommendations
  components/
    ui/                    Reusable building blocks (Button, Card, StatCard, Badge, FormField, Modal, Tabs...)
    layout/                AppLayout, Sidebar, Topbar, AuthLayout
    routing/               RequireAuth and RequireAdmin route guards
    risk/                  RiskTable, BatchTable, RiskBreakdown, RecommendationList
    charts/                DemandChart (plain SVG)
  pages/                   One file per screen
  styles/
    tokens.css             Colours, type scale, spacing (edit here to restyle)
    base.css               Resets and base elements
    components.css         Shared component styles
    layout.css             Shell, sidebar, top bar, auth layout, responsive rules
    pages.css              Feature-specific styles
```

## Demo risk logic

For each product:

- **Estimated at-risk stock** = current stock - forecast demand before the earliest batch expires
- **Estimated value at risk** = at-risk stock x unit cost
- **Risk level** uses the share of stock at risk: High is 25% or more, Medium is 8% to 24%, Low is below 8%

Example: Strawberry Yoghurt 500ml has 120 units, 7 days to expiry and a forecast of 85 units, so 35 units (KSh 4,200) are at risk.

The demo inventory is deliberately small: two products (Strawberry Yoghurt 500ml, High risk, and Fresh Milk 1L, Medium risk), one batch each, plus a short daily sales series for the yoghurt chart. All figures live in `src/data/demoData.js`. When the backend and model are added, replace those arrays with API calls that return the same shape.

## Screenshots

Screenshots of the Hifadhi interface are provided below.

Landing Page
<img width="1902" height="915" alt="Screenshot 2026-10-08 133349" src="https://github.com/user-attachments/assets/c7d4e158-2f7c-4bc6-810e-e26c2637669d" />
<img width="1917" height="915" alt="Screenshot 2026-10-08 133407" src="https://github.com/user-attachments/assets/d0beca92-c979-4bf0-b333-b9b2bb983e58" />
<img width="1917" height="910" alt="Screenshot 2026-10-08 133433" src="https://github.com/user-attachments/assets/b14f99c9-cf6f-4722-bb71-8eed72e2cd9d" />

Dashboard
<img width="1917" height="910" alt="Screenshot 2026-10-08 144631" src="https://github.com/user-attachments/assets/6968c5d6-8135-45ff-84da-5d2624ba7420" />

<img width="1917" height="912" alt="Screenshot 2026-10-08 144755" src="https://github.com/user-attachments/assets/813fd02f-6e5d-42c4-af9e-1ccf03b6c7ce" />

Product Management
<img width="1917" height="915" alt="Screenshot 2026-10-08 144830" src="https://github.com/user-attachments/assets/71d79706-9a17-4bcb-9903-72692dcc25be" />


Inventory Management
<img width="1917" height="907" alt="Screenshot 2026-10-08 144909" src="https://github.com/user-attachments/assets/49412ad2-5f74-4f2b-b070-c4844022f40c" />


Sales Data
<img width="1917" height="912" alt="Screenshot 2026-10-08 144931" src="https://github.com/user-attachments/assets/eb8a326a-14c4-4088-9a94-349551d61674" />


Input Validation

## Development Status

Hifadhi is currently under development as a Software Engineering Final Capstone Project.

## Completed

User interface design and navigation

Product management CRUD

Inventory management CRUD

Sales data management CRUD

Data input, processing and validation

## Planned for Later Development

Database integration and normalization

Authentication and security improvements

Machine-learning demand forecasting

Inventory waste-risk assessment

Decision-support recommendations

System reporting and further integration

The current prototype uses temporary application state for inventory, product and sales data. Database persistence will be introduced in a later development phase.


