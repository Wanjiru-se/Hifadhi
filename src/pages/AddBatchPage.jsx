/*
  Batch form, used for both Add Batch (/inventory/add-batch) and
  Edit Batch (/inventory/:batchId/edit).
  Validation is done in validateBatch() with a message under each field.
  Data is temporary (in memory) at this stage.
*/
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEMO_TODAY } from '../data/demoData';
import { addDays, daysBetween, formatDate, formatKSh } from '../utils/format';
import { firstError, hasErrors, isEmpty, matches, money, required, textLength, validDate, wholeNumber } from '../utils/validation';
import Alert from '../components/ui/Alert';
import Button, { ButtonLink } from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import PageHeader from '../components/ui/PageHeader';
import { SelectField, TextField } from '../components/ui/FormField';

/* Batch ID: 3 to 20 letters, numbers or hyphens, starting with a letter or number */
const BATCH_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,19}$/;
const SUPPLIER_PATTERN = /^[A-Za-z0-9 .,'&()-]+$/;
const MAX_SHELF_DAYS = 730;

const quantityLabel = (editingId) => (editingId ? 'Quantity in stock' : 'Quantity received');

export function validateBatch(form, { batches, editingId, originalExpiry }) {
  const batchNo = form.batchId.trim().toUpperCase();
  const errors = {
    productId: required(form.productId, 'Product'),
    branchId: required(form.branchId, 'Branch'),
    batchId: firstError(
      required(form.batchId, 'Batch ID'),
      matches(batchNo, BATCH_PATTERN, 'Batch ID must be 3 to 20 characters: letters, numbers and hyphens only.'),
      batches.some((b) => b.id !== editingId && b.id === batchNo) ? 'This Batch ID is already in use.' : '',
    ),
    /* When editing, quantity is the units remaining, which can be 0 after sales */
    quantity: firstError(
      required(form.quantity, quantityLabel(editingId)),
      wholeNumber(form.quantity, quantityLabel(editingId), { min: editingId ? 0 : 1, max: 100000 }),
    ),
    unitCost: firstError(required(form.unitCost, 'Unit cost'), money(form.unitCost, 'Unit cost')),
    receivedDate: firstError(
      required(form.receivedDate, 'Date received'),
      validDate(form.receivedDate, 'Date received'),
      form.receivedDate > DEMO_TODAY ? 'Date received cannot be in the future.' : '',
    ),
    expiryDate: firstError(required(form.expiryDate, 'Expiry date'), validDate(form.expiryDate, 'Expiry date')),
    supplier: isEmpty(form.supplier)
      ? ''
      : firstError(
          textLength(form.supplier, 'Supplier', { min: 2, max: 60 }),
          matches(form.supplier, SUPPLIER_PATTERN, 'Supplier can only contain letters, numbers, spaces and . , \' & ( ) -'),
        ),
  };

  /* Date rules, checked once both dates are valid */
  if (!errors.receivedDate && !errors.expiryDate) {
    const shelf = daysBetween(form.receivedDate, form.expiryDate);
    if (shelf <= 0) errors.expiryDate = 'Expiry date must be after the date received.';
    else if (shelf > MAX_SHELF_DAYS) errors.expiryDate = 'Expiry date must be within 2 years of the date received.';
    else if (form.expiryDate < DEMO_TODAY && form.expiryDate !== originalExpiry)
      errors.expiryDate = 'Expiry date has already passed. Expired stock cannot be added.';
  }
  return errors;
}

export default function AddBatchPage() {
  const { products, batches, branches, isMultiBranch, selectedBranch, addBatch, updateBatch } = useApp();
  const navigate = useNavigate();
  const { batchId: editParam } = useParams();
  const editingId = editParam ? decodeURIComponent(editParam) : null;
  const existing = editingId ? batches.find((b) => b.id === editingId) : null;
  const isEdit = Boolean(editingId);

  const nextId = `BATCH-${String(batches.length + 1).padStart(3, '0')}`;
  const first = products[0];

  const [form, setForm] = useState(() =>
    existing
      ? {
          productId: existing.productId,
          branchId: existing.branchId,
          batchId: existing.id,
          quantity: String(existing.quantity),
          unitCost: String(existing.unitCost ?? products.find((p) => p.id === existing.productId)?.unitCost ?? ''),
          supplier: existing.supplier ?? '',
          receivedDate: existing.receivedDate,
          expiryDate: existing.expiryDate,
        }
      : {
          productId: first?.id ?? '',
          branchId: selectedBranch.id,
          batchId: nextId,
          quantity: '',
          unitCost: first ? String(first.unitCost) : '',
          supplier: '',
          receivedDate: DEMO_TODAY,
          expiryDate: first ? addDays(DEMO_TODAY, first.shelfLifeDays) : '',
        },
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (isEdit && !existing) {
    return (
      <div className="stack">
        <PageHeader title="Batch not found" description="This batch may have been deleted." />
        <div><ButtonLink to="/inventory" variant="secondary" icon="arrowLeft">Back to Inventory</ButtonLink></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="stack">
        <PageHeader title="Add Inventory Batch" description="Add a product before recording a batch." />
        <Alert tone="info">There are no products yet. Add a product first, then record its batches here.</Alert>
        <div><ButtonLink to="/products" icon="package">Go to Products</ButtonLink></div>
      </div>
    );
  }

  const product = products.find((p) => p.id === form.productId);
  const context = { batches, editingId, originalExpiry: existing?.expiryDate };

  const setAndCheck = (next) => {
    setForm(next);
    if (submitted) setErrors(validateBatch(next, context));
  };
  const update = (field) => (e) => setAndCheck({ ...form, [field]: e.target.value });

  /* Choosing a product fills in its unit cost and typical expiry (new batches only) */
  const changeProduct = (e) => {
    const p = products.find((x) => x.id === e.target.value);
    if (!p || isEdit) return setAndCheck({ ...form, productId: e.target.value });
    setAndCheck({
      ...form,
      productId: p.id,
      unitCost: String(p.unitCost),
      expiryDate: validDate(form.receivedDate, 'x') ? form.expiryDate : addDays(form.receivedDate, p.shelfLifeDays),
    });
  };

  const datesValid = !validDate(form.receivedDate, 'x') && !validDate(form.expiryDate, 'x');
  const daysLeft = datesValid ? daysBetween(DEMO_TODAY, form.expiryDate) : null;
  const qty = /^\d+$/.test(form.quantity.trim()) ? Number(form.quantity) : 0;
  const cost = Number(form.unitCost) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateBatch(form, context);
    setErrors(found);
    if (hasErrors(found)) return;

    const values = {
      id: form.batchId.trim().toUpperCase(),
      productId: form.productId,
      branchId: form.branchId,
      quantity: Number(form.quantity),
      unitCost: Number(form.unitCost),
      receivedDate: form.receivedDate,
      expiryDate: form.expiryDate,
      supplier: form.supplier.trim(),
    };
    if (isEdit) {
      updateBatch(editingId, values);
      navigate('/inventory', { state: { updatedBatch: values.id } });
    } else {
      /* atRiskUnits is kept for the later risk phase; not shown at this stage */
      addBatch({ ...values, atRiskUnits: 0 });
      navigate('/inventory', { state: { addedBatch: values.id } });
    }
  };

  const title = isEdit ? 'Edit Inventory Batch' : 'Add Inventory Batch';

  return (
    <div className="stack">
      <div>
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <Link to="/inventory">Inventory</Link>
          <Icon name="chevronRight" size={14} />
          <span>{title}</span>
        </nav>
        <PageHeader
          title={title}
          description={isEdit ? `Update the details of batch ${editingId}.` : 'Record a new delivery so Hifadhi can track its expiry.'}
        />
      </div>

      <div className="grid-main-side">
        <Card title="Batch details">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <SelectField
                className="span-2"
                label="Product"
                required
                value={form.productId}
                onChange={changeProduct}
                error={errors.productId}
                options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              />
              {isMultiBranch ? (
                <SelectField
                  label="Branch"
                  required
                  value={form.branchId}
                  onChange={update('branchId')}
                  error={errors.branchId}
                  options={branches.map((b) => ({ value: b.id, label: `${b.name} Branch` }))}
                />
              ) : (
                <TextField label="Branch" value={`${selectedBranch.name} Branch`} readOnly />
              )}
              <TextField label="Batch ID" required maxLength={20} value={form.batchId} onChange={update('batchId')} error={errors.batchId} hint={isEdit ? 'Letters, numbers and hyphens, 3 to 20 characters' : 'Suggested automatically. You can change it.'} />
              <TextField label={`${quantityLabel(editingId)} (units)`} required inputMode="numeric" placeholder="e.g. 60" value={form.quantity} onChange={update('quantity')} error={errors.quantity} hint={isEdit ? 'Units remaining in this batch, 0 to 100,000' : 'Whole number, 1 to 100,000'} />
              <TextField label="Unit cost (KSh)" required inputMode="decimal" value={form.unitCost} onChange={update('unitCost')} error={errors.unitCost} hint="Up to 2 decimal places" />
              <TextField label="Date received" type="date" required max={DEMO_TODAY} value={form.receivedDate} onChange={update('receivedDate')} error={errors.receivedDate} />
              <TextField label="Expiry date" type="date" required value={form.expiryDate} onChange={update('expiryDate')} error={errors.expiryDate} hint={product ? `Typical shelf life for this product: ${product.shelfLifeDays} days` : undefined} />
              <TextField className="span-2" label="Supplier" placeholder="e.g. Brookside Dairy" maxLength={60} value={form.supplier} onChange={update('supplier')} error={errors.supplier} hint="Optional, 2 to 60 characters" />
            </div>

            {submitted && hasErrors(errors) && (
              <div style={{ marginTop: 'var(--sp-4)' }}>
                <Alert tone="warning">Please correct the highlighted fields before saving.</Alert>
              </div>
            )}

            <div className="form-actions">
              <ButtonLink to="/inventory" variant="secondary">Cancel</ButtonLink>
              <Button type="submit" icon="check">{isEdit ? 'Save Changes' : 'Save Batch'}</Button>
            </div>
          </form>
        </Card>

        <div className="stack">
          <Card title="Batch summary">
            <dl className="kv-list" style={{ margin: 0 }}>
              <div className="kv-row"><dt>Product</dt><dd>{product?.name ?? 'Not selected'}</dd></div>
              <div className="kv-row"><dt>Quantity</dt><dd>{qty} units</dd></div>
              <div className="kv-row"><dt>Batch value</dt><dd>{formatKSh(qty * cost)}</dd></div>
              <div className="kv-row"><dt>Expires</dt><dd>{datesValid ? formatDate(form.expiryDate) : 'Not set'}</dd></div>
              <div className="kv-row">
                <dt>Days until expiry</dt>
                <dd className={daysLeft !== null && daysLeft <= 3 ? 'text-danger' : ''}>
                  {daysLeft === null ? 'Not set' : `${daysLeft} days`}
                </dd>
              </div>
            </dl>
          </Card>
          <Alert tone="info">
            Batches are listed <strong>First Expiry, First Out (FEFO)</strong>. Hifadhi places this batch in the
            selling order based on its expiry date.
          </Alert>
        </div>
      </div>
    </div>
  );
}
