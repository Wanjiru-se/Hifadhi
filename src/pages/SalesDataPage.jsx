/*
  Sales Data: add, view, update and delete daily sales records
  (temporary, in-memory data). One record = units of one product sold on
  one day. Validation is done in validateSale() with a message under each
  field. Adding, editing or deleting a sale updates batch stock FEFO (see
  utils/stock.js); a sale can never use more units than are available.
  Forecasting from this history belongs to a later phase.
*/
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DEMO_TODAY } from '../data/demoData';
import { formatDate, formatKSh } from '../utils/format';
import { availableUnits, heldUnits } from '../utils/stock';
import { firstError, hasErrors, required, validDate, wholeNumber } from '../utils/validation';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { SelectField, TextField } from '../components/ui/FormField';

const EARLIEST_DATE = '2020-01-01';

/* Units this record could use: current stock plus what it already holds (when editing) */
export function unitsAvailableFor(productId, batches, sale) {
  return availableUnits(batches, productId) + heldUnits(sale, productId);
}

export function validateSale(form, sales, editingId, batches) {
  const editing = sales.find((s) => s.id === editingId);
  /* Opening records are already reflected in stock, so no stock check applies */
  const checkStock = !editing || Boolean(editing.allocations);
  const errors = {
    date: firstError(
      required(form.date, 'Sale date'),
      validDate(form.date, 'Sale date'),
      form.date > DEMO_TODAY ? 'Sale date cannot be in the future.' : '',
      form.date < EARLIEST_DATE ? 'Sale date cannot be before 1 January 2020.' : '',
    ),
    productId: required(form.productId, 'Product'),
    quantity: firstError(required(form.quantity, 'Units sold'), wholeNumber(form.quantity, 'Units sold', { min: 1, max: 10000 })),
  };
  /* Business rule: one record per product per day */
  if (
    !errors.date &&
    !errors.productId &&
    sales.some((s) => s.id !== editingId && s.productId === form.productId && s.date === form.date)
  ) {
    errors.productId = 'A sales record for this product on this date already exists. Edit that record instead.';
  }
  /* Business rule: cannot sell more than the stock available */
  if (checkStock && !errors.productId) {
    const available = unitsAvailableFor(form.productId, batches, editing);
    if (available === 0) {
      errors.productId = 'This product has no stock available. Add an inventory batch first.';
    } else if (!errors.quantity && Number(form.quantity) > available) {
      errors.quantity = `Only ${available} ${available === 1 ? 'unit is' : 'units are'} currently available.`;
    }
  }
  return errors;
}

function SaleModal({ sale, sales, products, batches, onSave, onClose }) {
  const [form, setForm] = useState(
    sale
      ? { date: sale.date, productId: sale.productId, quantity: String(sale.quantity) }
      : { date: DEMO_TODAY, productId: '', quantity: '' },
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const isOpening = Boolean(sale && !sale.allocations);
  const available = form.productId && !isOpening ? unitsAvailableFor(form.productId, batches, sale) : null;

  const update = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    if (submitted) setErrors(validateSale(next, sales, sale?.id, batches));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateSale(form, sales, sale?.id, batches);
    setErrors(found);
    if (hasErrors(found)) return;
    onSave({ date: form.date, productId: form.productId, quantity: Number(form.quantity) });
  };

  return (
    <Modal
      title={sale ? 'Edit Sales Record' : 'Add Sales Record'}
      description="Record the number of units of one product sold on one day."
      onClose={onClose}
    >
      {isOpening && (
        <p className="field-hint" style={{ margin: '0 0 var(--sp-4)' }}>
          This is an opening record that is already reflected in the current stock, so changing it does not adjust
          inventory.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <TextField label="Sale date" type="date" required min={EARLIEST_DATE} max={DEMO_TODAY} value={form.date} onChange={update('date')} error={errors.date} />
          <TextField label="Units sold" required inputMode="numeric" placeholder="e.g. 12" value={form.quantity} onChange={update('quantity')} error={errors.quantity} hint={available === null ? 'Whole number, 1 to 10,000' : `Available: ${available} units`} />
          <SelectField
            className="span-2"
            label="Product"
            required
            value={form.productId}
            onChange={update('productId')}
            error={errors.productId}
            options={[{ value: '', label: 'Select a product' }, ...products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))]}
          />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="check">{sale ? 'Save Changes' : 'Add Record'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function SalesDataPage() {
  const { products, batches, sales, addSale, updateSale, deleteSale } = useApp();
  const [editing, setEditing] = useState(null); /* null, 'new' or a record */
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');

  const findProduct = (id) => products.find((p) => p.id === id);
  /* Processing: newest first, plus totals across all records */
  const rows = [...sales].sort((a, b) => b.date.localeCompare(a.date) || (findProduct(a.productId)?.name ?? '').localeCompare(findProduct(b.productId)?.name ?? ''));
  const unitsSold = sales.reduce((s, r) => s + r.quantity, 0);
  const revenue = sales.reduce((s, r) => s + r.quantity * (findProduct(r.productId)?.unitPrice ?? 0), 0);

  const handleSave = (values) => {
    const name = findProduct(values.productId)?.name;
    if (editing === 'new') {
      addSale({ id: `s-${Date.now()}`, ...values });
      setNotice(`Sales record for ${name} on ${formatDate(values.date)} was added.`);
    } else {
      updateSale(editing.id, values);
      setNotice(`Sales record for ${name} on ${formatDate(values.date)} was updated.`);
    }
    setEditing(null);
  };

  const handleDelete = () => {
    deleteSale(deleting.id);
    setNotice(`Sales record for ${findProduct(deleting.productId)?.name} on ${formatDate(deleting.date)} was deleted.`);
    setDeleting(null);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Sales Data"
        description="Daily sales records for each product."
        actions={
          <Button icon="plus" onClick={() => setEditing('new')} disabled={products.length === 0}>
            Add Sales Record
          </Button>
        }
      />

      {notice && <Alert tone="success">{notice}</Alert>}

      <div className="grid-3">
        <div className="card stat-card">
          <div><div className="stat-value">{unitsSold}</div><div className="stat-label">Units sold (all records)</div></div>
        </div>
        <div className="card stat-card">
          <div><div className="stat-value">{formatKSh(revenue)}</div><div className="stat-label">Sales value (all records)</div></div>
        </div>
        <div className="card stat-card">
          <div><div className="stat-value">{sales.length}</div><div className="stat-label">Sales records</div></div>
        </div>
      </div>

      <Card title="Sales records" subtitle="Newest first" flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Product</th>
                <th scope="col" className="num">Units Sold</th>
                <th scope="col" className="num">Unit Price</th>
                <th scope="col" className="num">Sales Value</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const p = findProduct(s.productId);
                const price = p?.unitPrice ?? 0;
                return (
                  <tr key={s.id}>
                    <td>{formatDate(s.date)}</td>
                    <td className="cell-title">{p?.name ?? 'Unknown product'}</td>
                    <td className="num">{s.quantity}</td>
                    <td className="num">{formatKSh(price)}</td>
                    <td className="num">{formatKSh(s.quantity * price)}</td>
                    <td>
                      <div className="row-actions">
                        <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(s)} aria-label={`Edit sales record for ${p?.name} on ${formatDate(s.date)}`}>Edit</Button>
                        <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(s)} aria-label={`Delete sales record for ${p?.name} on ${formatDate(s.date)}`}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
                    No sales records yet. Use Add Sales Record to enter one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <SaleModal
          sale={editing === 'new' ? null : editing}
          sales={sales}
          products={products}
          batches={batches}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog title="Delete sales record?" onConfirm={handleDelete} onClose={() => setDeleting(null)}>
          The record of <strong>{deleting.quantity} units</strong> of {findProduct(deleting.productId)?.name} sold on{' '}
          {formatDate(deleting.date)} will be removed.
          {deleting.allocations ? ' These units will be returned to inventory.' : ''}
        </ConfirmDialog>
      )}
    </div>
  );
}
