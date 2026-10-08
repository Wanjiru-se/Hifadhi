/*
  Hard-coded demonstration data for the interface-development phase.
  This is the ONLY place inventory demo data lives. Every page (dashboard,
  inventory, risk, forecasts, sales) reads from here and calculates its
  totals, so changing a value below updates the whole interface.
  Nothing here comes from a backend yet. When the database and the
  forecasting model are added, these arrays will be replaced by API calls
  with the same shape, so the pages can stay largely unchanged.

  All dates are relative to DEMO_TODAY so the numbers always line up.
*/

export const DEMO_TODAY = '2026-09-23';

export const business = {
  name: 'GreenMart Groceries',
  type: 'Grocery Retailer',
  email: 'owner@greenmart.co.ke',
  phone: '+254 712 345 678',
  currency: 'Kenyan Shilling (KSh)',
  timeZone: '(GMT+3) Nairobi',
};

export const branches = [
  {
    id: 'br-kilimani',
    name: 'Kilimani',
    location: 'Kilimani, Nairobi',
    manager: 'Ann Wanjiku',
    managerNote: 'Owner',
    status: 'Active',
    products: 2,
  },
  {
    id: 'br-westlands',
    name: 'Westlands',
    location: 'Westlands, Nairobi',
    manager: 'Not assigned',
    status: 'Active',
    products: 2,
  },
  {
    id: 'br-karen',
    name: 'Karen',
    location: 'Karen, Nairobi',
    manager: 'Not assigned',
    status: 'Active',
    products: 2,
  },
];

export const users = [
  {
    id: 'u-ann',
    name: 'Ann Wanjiru',
    email: 'owner@greenmart.co.ke',
    role: 'Business Admin',
    branchAccess: 'All Branches',
    status: 'Active',
    lastActive: 'Today, 09:14',
  },
  {
    id: 'u-peter',
    name: 'Peter Njuguna',
    email: 'peter@greenmart.co.ke',
    role: 'Inventory Manager',
    branchAccess: 'Kilimani',
    status: 'Active',
    lastActive: 'Today, 09:14',
  },
];

/* The two demo accounts offered on the login screen */
export const demoAccounts = {
  admin: { userId: 'u-ann', role: 'admin', branchId: 'br-kilimani' },
  manager: { userId: 'u-peter', role: 'manager', branchId: 'br-kilimani' },
};

/*
  Inventory demo data: two representative products, one batch each.
  forecastDemand = units expected to sell before the stock expires.
  Estimated at-risk units are stored on each batch (see batches below).

  Strawberry Yoghurt: 120 in stock - 85 forecast = 35 at risk (29%, High)
  Fresh Milk:          60 in stock - 52 forecast =  8 at risk (13%, Medium)
*/
export const products = [
  {
    id: 'strawberry-yoghurt-500ml',
    name: 'Strawberry Yoghurt 500ml',
    sku: 'YOG-001',
    category: 'Dairy',
    unitCost: 120,
    unitPrice: 165,
    shelfLifeDays: 21,
    forecastDemand: 85,
  },
  {
    id: 'fresh-milk-1l',
    name: 'Fresh Milk 1L',
    sku: 'MLK-001',
    category: 'Dairy',
    unitCost: 65,
    unitPrice: 90,
    shelfLifeDays: 8,
    forecastDemand: 52,
  },
];

/*
  Inventory batches for the Kilimani branch.
  atRiskUnits is the estimated number of units from that batch that will
  not sell before expiry when stock is sold First Expiry, First Out (FEFO).
  Days to expiry are calculated from DEMO_TODAY (7 days and 5 days).
*/
export const batches = [
  {
    id: 'BATCH-001',
    productId: 'strawberry-yoghurt-500ml',
    branchId: 'br-kilimani',
    quantity: 120,
    receivedDate: '2026-09-16',
    expiryDate: '2026-09-30',
    supplier: 'Brookside Dairy',
    atRiskUnits: 35,
  },
  {
    id: 'BATCH-002',
    productId: 'fresh-milk-1l',
    branchId: 'br-kilimani',
    quantity: 60,
    receivedDate: '2026-09-20',
    expiryDate: '2026-09-28',
    supplier: 'Brookside Dairy',
    atRiskUnits: 8,
  },
];

/*
  Time-series demo points for ONE product only (Strawberry Yoghurt), used
  by the demand chart: 7 days of actual sales and 7 days of forecast.
  The forecast values add up to 85. Other products show a
  "no chart data yet" message instead of invented points.
*/
export const demandSeries = {
  'strawberry-yoghurt-500ml': [
    { date: '2026-09-16', actual: 11 },
    { date: '2026-09-17', actual: 13 },
    { date: '2026-09-18', actual: 12 },
    { date: '2026-09-19', actual: 10 },
    { date: '2026-09-20', actual: 14 },
    { date: '2026-09-21', actual: 12 },
    { date: '2026-09-22', actual: 11 },
    { date: '2026-09-23', forecast: 12 },
    { date: '2026-09-24', forecast: 13 },
    { date: '2026-09-25', forecast: 11 },
    { date: '2026-09-26', forecast: 12 },
    { date: '2026-09-27', forecast: 13 },
    { date: '2026-09-28', forecast: 12 },
    { date: '2026-09-29', forecast: 12 },
  ],
};

/*
  Yoghurt stock and forecast at the other branches. Used only when the
  business has more than one branch, to suggest redistribution.
*/
export const otherBranchPositions = {
  'strawberry-yoghurt-500ml': [
    { branchId: 'br-westlands', stock: 20, forecastDemand: 48 },
    { branchId: 'br-karen', stock: 45, forecastDemand: 40 },
  ],
};

/* Recent sales records shown on the Sales Data page (yoghurt matches the chart) */
export const recentSales = [
  { id: 's1', date: '2026-09-22', productId: 'strawberry-yoghurt-500ml', quantity: 11 },
  { id: 's2', date: '2026-09-22', productId: 'fresh-milk-1l', quantity: 10 },
  { id: 's3', date: '2026-09-21', productId: 'strawberry-yoghurt-500ml', quantity: 12 },
  { id: 's4', date: '2026-09-21', productId: 'fresh-milk-1l', quantity: 11 },
];

export const categories = [
  'Dairy',
  'Meat & Poultry',
  'Vegetables',
  'Fruit',
  'Bakery',
  'Beverages',
];

export const businessTypes = [
  'Grocery Retailer',
  'Mini-market',
  'Supermarket',
  'Butchery',
  'Dairy Shop',
  'Fruit & Vegetable Store',
];
