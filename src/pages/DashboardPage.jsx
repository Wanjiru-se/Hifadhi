/*
  Dashboard: a simple overview of the data currently in the system
  (products, inventory batches, stock and sales records).
  Processing only: counts, totals, FEFO ordering and days left.
  Forecast and risk figures belong to a later phase and are not shown.
*/
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEMO_TODAY } from '../data/demoData';
import { formatDate, formatKSh, formatLongDate } from '../utils/format';
import { sortFefo, withDaysLeft } from '../utils/inventory';
import Alert from '../components/ui/Alert';
import { ButtonLink } from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { products, batches, sales, currentUser, selectedBranch, isMultiBranch } = useApp();
  const location = useLocation();
  const firstName = currentUser.name.split(' ')[0];
  const findProduct = (id) => products.find((p) => p.id === id);

  const fefo = sortFefo(batches.map(withDaysLeft));
  const totalUnits = batches.reduce((s, b) => s + b.quantity, 0);
  const stockValue = batches.reduce((s, b) => s + b.quantity * (b.unitCost ?? findProduct(b.productId)?.unitCost ?? 0), 0);
  const expiringSoonest = fefo.filter((b) => b.daysLeft >= 0 && b.quantity > 0).slice(0, 5);
  const recentSales = [...sales].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  /* Stock per product: batches, units and earliest expiry (FEFO) */
  const stockRows = products.map((p) => {
    const own = fefo.filter((b) => b.productId === p.id && b.quantity > 0);
    return {
      ...p,
      batchCount: own.length,
      units: own.reduce((s, b) => s + b.quantity, 0),
      earliest: own[0] ?? null,
    };
  });

  return (
    <div className="stack">
      <PageHeader
        title="Dashboard"
        description={`${greeting()}, ${firstName}. Here is an overview of your data for ${selectedBranch.name} Branch.`}
        meta={formatLongDate(DEMO_TODAY)}
      />

      {location.state?.denied && (
        <Alert tone="warning">That page is only available to the Business Admin.</Alert>
      )}
      {isMultiBranch && selectedBranch.id !== 'br-kilimani' && (
        <Alert tone="info">Demo data: figures below use the Kilimani Branch sample data.</Alert>
      )}

      <div className="grid-4">
        <StatCard icon="package" value={products.length} label="Products" hint="In your catalogue" />
        <StatCard icon="layers" value={batches.filter((b) => b.quantity > 0).length} label="Inventory Batches" hint={`${totalUnits} units in stock`} />
        <StatCard icon="tag" value={formatKSh(stockValue)} label="Stock Value" hint="At unit cost" />
        <StatCard icon="chart" value={sales.length} label="Sales Records" hint="Daily sales entered" />
      </div>

      <Card
        title="Stock by Product"
        subtitle="Units in stock and the earliest expiring batch for each product"
        flush
        action={
          <ButtonLink to="/products" variant="ghost" size="sm" iconRight="arrowRight">
            Products
          </ButtonLink>
        }
      >
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Category</th>
                <th scope="col" className="num">Batches</th>
                <th scope="col" className="num">Units in Stock</th>
                <th scope="col">Earliest Expiry</th>
              </tr>
            </thead>
            <tbody>
              {stockRows.map((r) => (
                <tr key={r.id}>
                  <td className="cell-title">{r.name}</td>
                  <td>{r.category}</td>
                  <td className="num">{r.batchCount}</td>
                  <td className="num">{r.units}</td>
                  <td>{r.earliest ? `${formatDate(r.earliest.expiryDate)} (${r.earliest.id})` : <span className="text-muted">No stock</span>}</td>
                </tr>
              ))}
              {stockRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
                    No products yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid-2">
        <Card
          title="Expiring Soonest"
          subtitle="Next batches to sell, First Expiry, First Out"
          action={
            <ButtonLink to="/inventory" variant="ghost" size="sm" iconRight="arrowRight">
              Inventory
            </ButtonLink>
          }
        >
          {expiringSoonest.length ? (
            <ul className="expiring-list">
              {expiringSoonest.map((b) => (
                <li key={b.id}>
                  <span>
                    <span className="text-strong">{findProduct(b.productId)?.name}</span>
                    <span className="text-muted"> · {b.id} · {b.quantity} units</span>
                  </span>
                  <span className={`nowrap ${b.daysLeft <= 3 ? 'text-danger' : 'text-muted'}`}>
                    <Icon name="clock" size={14} className="inline-icon" /> {b.daysLeft} {b.daysLeft === 1 ? 'day' : 'days'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No batches in stock.</p>
          )}
        </Card>

        <Card
          title="Recent Sales"
          subtitle="Latest sales records entered"
          action={
            <ButtonLink to="/sales" variant="ghost" size="sm" iconRight="arrowRight">
              Sales Data
            </ButtonLink>
          }
        >
          {recentSales.length ? (
            <ul className="expiring-list">
              {recentSales.map((s) => (
                <li key={s.id}>
                  <span>
                    <span className="text-strong">{findProduct(s.productId)?.name}</span>
                    <span className="text-muted"> · {formatDate(s.date)}</span>
                  </span>
                  <span className="nowrap text-muted">{s.quantity} units</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No sales records yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
