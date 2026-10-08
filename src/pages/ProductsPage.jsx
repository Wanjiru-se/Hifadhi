/*
  Products: add, view, update and delete (temporary, in-memory data).
  Validation is done in validateProduct() with a message under each field.
*/
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { categories } from '../data/demoData';
import { formatKSh } from '../utils/format';
import { firstError, hasErrors, matches, money, required, textLength, wholeNumber } from '../utils/validation';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { SelectField, TextField } from '../components/ui/FormField';

const EMPTY_FORM = { name: '', sku: '', category: '', unitCost: '', unitPrice: '', shelfLifeDays: '' };

/* SKU format: 2 to 5 capital letters, a hyphen, then 3 to 5 digits (e.g. YOG-001) */
const SKU_PATTERN = /^[A-Z]{2,5}-\d{3,5}$/;
/* Product names: letters, numbers, spaces and . , ' & ( ) - / % */
const NAME_PATTERN = /^[A-Za-z0-9 .,'&()\-/%]+$/;

export function validateProduct(form, products, editingId) {
  const others = products.filter((p) => p.id !== editingId);
  const errors = {
    name: firstError(
      required(form.name, 'Product name'),
      textLength(form.name, 'Product name', { min: 2, max: 60 }),
      matches(form.name, NAME_PATTERN, 'Product name can only contain letters, numbers, spaces and . , \' & ( ) - / %'),
      others.some((p) => p.name.toLowerCase() === form.name.trim().toLowerCase())
        ? 'A product with this name already exists.'
        : '',
    ),
    sku: firstError(
      required(form.sku, 'SKU'),
      matches(form.sku.toUpperCase(), SKU_PATTERN, 'SKU must look like YOG-001: 2 to 5 letters, a hyphen, then 3 to 5 digits.'),
      others.some((p) => p.sku === form.sku.trim().toUpperCase()) ? 'This SKU is already used by another product.' : '',
    ),
    category: required(form.category, 'Category'),
    unitCost: firstError(required(form.unitCost, 'Unit cost'), money(form.unitCost, 'Unit cost')),
    unitPrice: firstError(required(form.unitPrice, 'Selling price'), money(form.unitPrice, 'Selling price')),
    shelfLifeDays: firstError(
      required(form.shelfLifeDays, 'Shelf life'),
      wholeNumber(form.shelfLifeDays, 'Shelf life', { min: 1, max: 365 }),
    ),
  };
  /* Business rule: selling below cost is not allowed */
  if (!errors.unitCost && !errors.unitPrice && Number(form.unitPrice) < Number(form.unitCost)) {
    errors.unitPrice = 'Selling price cannot be lower than the unit cost.';
  }
  return errors;
}

function ProductModal({ product, products, onSave, onClose }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          sku: product.sku,
          category: product.category,
          unitCost: String(product.unitCost),
          unitPrice: String(product.unitPrice),
          shelfLifeDays: String(product.shelfLifeDays),
        }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field) => (e) => {
    const next = { ...form, [field]: e.target.value };
    setForm(next);
    /* After the first save attempt, re-check as the user types */
    if (submitted) setErrors(validateProduct(next, products, product?.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validateProduct(form, products, product?.id);
    setErrors(found);
    if (hasErrors(found)) return;
    onSave({
      name: form.name.trim(),
      sku: form.sku.trim().toUpperCase(),
      category: form.category,
      unitCost: Number(form.unitCost),
      unitPrice: Number(form.unitPrice),
      shelfLifeDays: Number(form.shelfLifeDays),
    });
  };

  return (
    <Modal
      title={product ? 'Edit Product' : 'Add Product'}
      description={product ? `Update the details for ${product.name}.` : 'Add a perishable product to your catalogue.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <TextField className="span-2" label="Product name" required placeholder="e.g. Fresh Milk 1L" maxLength={60} value={form.name} onChange={update('name')} error={errors.name} hint="2 to 60 characters" />
          <TextField label="SKU" required placeholder="e.g. MLK-002" maxLength={11} value={form.sku} onChange={update('sku')} error={errors.sku} hint="Format: ABC-123" />
          <SelectField
            label="Category"
            required
            value={form.category}
            onChange={update('category')}
            error={errors.category}
            options={[{ value: '', label: 'Select a category' }, ...categories]}
          />
          <TextField label="Unit cost (KSh)" required inputMode="decimal" placeholder="e.g. 65" value={form.unitCost} onChange={update('unitCost')} error={errors.unitCost} />
          <TextField label="Selling price (KSh)" required inputMode="decimal" placeholder="e.g. 90" value={form.unitPrice} onChange={update('unitPrice')} error={errors.unitPrice} />
          <TextField className="span-2" label="Shelf life (days)" required inputMode="numeric" placeholder="e.g. 8" value={form.shelfLifeDays} onChange={update('shelfLifeDays')} error={errors.shelfLifeDays} hint="Typical days from delivery to expiry, 1 to 365" />
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="check">{product ? 'Save Changes' : 'Add Product'}</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProductsPage() {
  const { products, batches, sales, addProduct, updateProduct, deleteProduct } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [editing, setEditing] = useState(null); /* null, 'new' or a product */
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState(null);

  /* Processing: units in stock = sum of this product's batch quantities */
  const stockFor = (id) => batches.filter((b) => b.productId === id).reduce((sum, b) => sum + b.quantity, 0);

  const rows = products
    .filter((p) => category === 'All' || p.category === category)
    .filter((p) => `${p.name} ${p.sku}`.toLowerCase().includes(query.trim().toLowerCase()));

  const handleSave = (values) => {
    if (editing === 'new') {
      addProduct({ id: `prd-${Date.now()}`, ...values });
      setNotice({ tone: 'success', text: `${values.name} was added.` });
    } else {
      updateProduct(editing.id, values);
      setNotice({ tone: 'success', text: `${values.name} was updated.` });
    }
    setEditing(null);
  };

  const linkedCount = (p) =>
    batches.filter((b) => b.productId === p.id).length + sales.filter((s) => s.productId === p.id).length;

  const handleDelete = () => {
    deleteProduct(deleting.id);
    setNotice({ tone: 'success', text: `${deleting.name} was deleted.` });
    setDeleting(null);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Products"
        description="Perishable products in your catalogue, with pricing and typical shelf life."
        actions={
          <Button icon="plus" onClick={() => setEditing('new')}>
            Add Product
          </Button>
        }
      />

      {notice && <Alert tone={notice.tone}>{notice.text}</Alert>}

      <Card flush>
        <div className="toolbar">
          <div className="input-wrap has-icon">
            <Icon name="search" size={18} className="input-icon" />
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <input id="product-search" className="input" type="search" placeholder="Search by name or SKU" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div>
            <label htmlFor="category-filter" className="sr-only">Category</label>
            <select id="category-filter" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['All', ...categories].map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">SKU</th>
                <th scope="col">Category</th>
                <th scope="col" className="num">Unit Cost</th>
                <th scope="col" className="num">Selling Price</th>
                <th scope="col" className="num">Shelf Life</th>
                <th scope="col" className="num">In Stock</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="cell-title">{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{p.category}</td>
                  <td className="num">{formatKSh(p.unitCost)}</td>
                  <td className="num">{formatKSh(p.unitPrice)}</td>
                  <td className="num">{p.shelfLifeDays} days</td>
                  <td className="num">{stockFor(p.id)}</td>
                  <td>
                    <div className="row-actions">
                      <Button variant="secondary" size="sm" icon="edit" onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`}>Edit</Button>
                      <Button variant="danger" size="sm" icon="trash" onClick={() => setDeleting(p)} aria-label={`Delete ${p.name}`}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted" style={{ textAlign: 'center', padding: 32 }}>
                    {products.length === 0 ? 'No products yet. Use Add Product to create one.' : 'No products match your search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <ProductModal
          product={editing === 'new' ? null : editing}
          products={products}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting &&
        (linkedCount(deleting) > 0 ? (
          <ConfirmDialog title="Product cannot be deleted" onClose={() => setDeleting(null)}>
            <strong>{deleting.name}</strong> still has inventory batches or sales records. Delete those records first,
            then delete the product.
          </ConfirmDialog>
        ) : (
          <ConfirmDialog title="Delete product?" onConfirm={handleDelete} onClose={() => setDeleting(null)}>
            <strong>{deleting.name}</strong> ({deleting.sku}) will be removed from your catalogue.
          </ConfirmDialog>
        ))}
    </div>
  );
}
