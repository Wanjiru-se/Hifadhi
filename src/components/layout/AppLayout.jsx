/* Authenticated shell: sidebar + top bar + routed page content */
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LATER_PHASE_FEATURES } from '../../config/features';
import { buildRiskRows, summariseRisk } from '../../utils/inventory';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { products, batches } = useApp();
  /* High-risk alert count belongs to the later risk phase */
  const highRisk = LATER_PHASE_FEATURES ? summariseRisk(buildRiskRows(products, batches)).highRisk : null;

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-main">
        <Topbar onMenu={() => setMenuOpen(true)} alertCount={highRisk} />
        <main className="app-content" id="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
