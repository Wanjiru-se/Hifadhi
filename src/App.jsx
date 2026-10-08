/*
  Application routes.
  Public: / (landing page), /get-started (choose Login or Registration),
  /login, /register
  Authenticated (inside AppLayout): all other pages.
  Business Admin only: /branches, /users
  Later phase (hidden while LATER_PHASE_FEATURES is false): /forecasts,
  /risk, /risk/:productId. Their pages are kept for Weeks 5 onwards.
*/
import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { RequireAdmin, RequireAuth } from './components/routing/RequireAuth';
import { LATER_PHASE_FEATURES } from './config/features';
import GetStartedPage from './pages/auth/GetStartedPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';
import AddBatchPage from './pages/AddBatchPage';
import BranchesPage from './pages/BranchesPage';
import DashboardPage from './pages/DashboardPage';
import ForecastsPage from './pages/ForecastsPage';
import InventoryPage from './pages/InventoryPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductRiskDetailsPage from './pages/ProductRiskDetailsPage';
import ProductsPage from './pages/ProductsPage';
import RiskPage from './pages/RiskPage';
import SalesDataPage from './pages/SalesDataPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/inventory/add-batch" element={<AddBatchPage />} />
        <Route path="/inventory/:batchId/edit" element={<AddBatchPage />} />
        <Route path="/sales" element={<SalesDataPage />} />
        {LATER_PHASE_FEATURES && (
          <>
            <Route path="/forecasts" element={<ForecastsPage />} />
            <Route path="/risk" element={<RiskPage />} />
            <Route path="/risk/:productId" element={<ProductRiskDetailsPage />} />
          </>
        )}
        <Route path="/branches" element={<RequireAdmin><BranchesPage /></RequireAdmin>} />
        <Route path="/users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
