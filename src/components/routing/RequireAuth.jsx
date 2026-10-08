/* Route guards for the demo session (no real authentication yet) */
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function RequireAuth({ children }) {
  const { session } = useApp();
  const location = useLocation();
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/* Business Admin only: Inventory Managers are sent back to the dashboard */
export function RequireAdmin({ children }) {
  const { isAdmin } = useApp();
  if (!isAdmin) return <Navigate to="/dashboard" replace state={{ denied: true }} />;
  return children;
}
