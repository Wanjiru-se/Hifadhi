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
