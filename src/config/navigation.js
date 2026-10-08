/*
  Sidebar navigation. adminOnly items are hidden from Inventory Managers
  and their routes are protected in App.jsx.
  laterPhase items (forecasting and risk) are hidden until
  LATER_PHASE_FEATURES is switched on (see config/features.js).
*/
import { LATER_PHASE_FEATURES } from './features';

const allMainNav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'home' },
  { to: '/products', label: 'Products', icon: 'package' },
  { to: '/inventory', label: 'Inventory', icon: 'layers' },
  { to: '/sales', label: 'Sales Data', icon: 'chart' },
  { to: '/forecasts', label: 'Forecasts', icon: 'trending', laterPhase: true },
  { to: '/risk', label: 'Risk & Recommendations', icon: 'alert', laterPhase: true },
];

export const mainNav = allMainNav.filter((item) => LATER_PHASE_FEATURES || !item.laterPhase);

export const businessNav = [
  { to: '/branches', label: 'Branches', icon: 'pin', adminOnly: true },
  { to: '/users', label: 'Users', icon: 'users', adminOnly: true },
];

export const ROLE_LABELS = {
  admin: 'Business Admin',
  manager: 'Inventory Manager',
};
