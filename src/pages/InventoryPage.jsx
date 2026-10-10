/*
  Inventory: stock is tracked by batch (one delivery = one batch).
  View, edit and delete batches here; adding and editing use the batch form
  page. Processing shown: FEFO ordering, days left, units and stock value.
  Data is temporary (in memory) at this stage.
*/
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatDate, formatKSh } from '../utils/format';
import { sortFefo, withDaysLeft } from '../utils/inventory';
import Alert from '../components/ui/Alert';
import Button, { ButtonLink } from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';

const FILTERS = [
  { value: 'all', label: 'All batches' },
  { value: 'soon', label: 'Expiring in 3 days' },
  { value: 'expired', label: 'Expired' },
];

export default function InventoryPage() {
  const { products, batches, selectedBranch, deleteBatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [deletedId, setDeletedId] = useState('');
  const added = location.state?.addedBatch;
  const updated = location.state?.updatedBatch;

  const findProduct = (id) => products.find((p) => p.id === id);

  const rows = sortFefo(batches.map(withDaysLeft))
    .filter((b) => (filter === 'soon' ? b.daysLeft >= 0 && b.daysLeft <= 3 : filter === 'expired' ? b.daysLeft < 0 : true))
    .filter((b) => `${b.id} ${findProduct(b.productId)?.name}`.toLowerCase().includes(query.trim().toLowerCase()));

  const totalUnits = batches.reduce((s, b) => s + b.quantity, 0);
  const stockValue = batches.reduce((s, b) => s + b.quantity * (b.unitCost ?? findProduct(b.productId)?.unitCost ?? 0), 0);

  const handleDelete = async () => {
  await deleteBatch(deleting.id);

  setDeletedId(deleting.id);
  setDeleting(null);

  /* Clear any added/updated notice from the previous page */
  navigate('/inventory', { replace: true, state: null });
};

  const notice = deletedId
    ? `Batch ${deletedId} was deleted.`
    : added
      ? `Batch ${added} was added.`
      : updated
        ? `Batch ${updated} was updated.`
        : '';

  return (
    <div className="stack">
      <PageHeader
        title="Inventory"
        description={`Stock batches at ${selectedBranch.name} Branch, listed First Expiry, First Out (FEFO).`}
        actions={
          <ButtonLink to="/inventory/add-batch" icon="plus">
            Add Batch
          </ButtonLink>
        }
      />

      {notice && (
        <Alert tone="success">{notice}</Alert>
      )}

      <div className="grid-3">
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="layers" size={24} /></span>
          <div><div className="stat-value">{batches.filter((b) => b.quantity > 0).length}</div><div className="stat-label">Batches with stock</div></div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="package" size={24} /></span>
          <div><div className="stat-value">{totalUnits}</div><div className="stat-label">Units in stock</div></div>
        </div>
        <div className="card stat-card">
          <span className="stat-icon"><Icon name="tag" size={24} /></span>
          <div><div className="stat-value">{formatKSh(stockValue)}</div><div className="stat-label">Stock value at cost</div></div>
        </div>
      </div>

      <Card flush>
        <div className="toolbar">
          <div className="input-wrap has-icon">
            <Icon name="search" size={18} className="input-icon" />
            <label htmlFor="batch-search" className="sr-only">Search batches</label>
            <input id="batch-search" className="input" type="search" placeholder="Search batch or product" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} label="Filter batches" />
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Batch ID</th>
                <th scope="col">Product</th>
                <th scope="col" className="num">Quantity</th>
                <th scope="col" className="num">Unit Cost</th>
                <th scope="col">Supplier</th>
                <th scope="col">Received</th>
                <th scope="col">Expiry Date</th>
                <th scope="col" className="num">Days Left</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="cell-title nowrap">{b.id}</td>
                  <td>{findProduct(b.productId)?.name ?? 'Unknown product'}</td>
                  <td className="num">{b.quantity}</td>
                  <td className="num">{formatKSh(b.unitCost ?? findProduct(b.productId)?.unitCost ?? 0)}</td>
                  <td>{b.supplier || <span className="text-muted">Not recorded</span>}</td>
                  <td>{formatDate(b.receivedDate)}</td>
                  <td>{formatDate(b.expiryDate)}</td>
                  <td className={`num${b.daysLeft <= 3 ? ' text-danger' : ''}`}>
                    {b.daysLeft < 0 ? 'Expired' : b.daysLeft}
                  </td>
                  <td>
                    <div className="row-actions">
                      <ButtonLink to={`/inventory/${encodeURIComponent(b.id)}/edit`} variant="secondary" size="sm" icon="edit" aria-label={`Edit batch ${b.id}`}>
                        Edit
                      </ButtonLink>
                      <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(b)} aria-label={`Delete batch ${b.id}`}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
                    {batches.length === 0 ? 'No batches yet. Use Add Batch to record a delivery.' : 'No batches match this filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {deleting && (
        <ConfirmDialog title="Delete batch?" onConfirm={handleDelete} onClose={() => setDeleting(null)}>
          Batch <strong>{deleting.id}</strong> ({deleting.quantity} units of {findProduct(deleting.productId)?.name}) will
          be removed from inventory.
        </ConfirmDialog>
      )}
    </div>
  );
}
