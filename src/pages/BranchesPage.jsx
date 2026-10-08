import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Alert from '../components/ui/Alert';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { SelectField, TextField } from '../components/ui/FormField';

function AddBranchModal({ onClose, onSave, managers }) {
  const [form, setForm] = useState({ name: '', location: '', manager: managers[0] });
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Modal title="Add Branch" description="Add another store location to your business." onClose={onClose}>
      <form
        className="stack"
        style={{ gap: 'var(--sp-4)' }}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <TextField label="Branch name" placeholder="e.g. Lavington" required value={form.name} onChange={update('name')} />
        <TextField label="Location / address" placeholder="e.g. Lavington, Nairobi" required value={form.location} onChange={update('location')} />
        <SelectField label="Branch manager" options={managers} value={form.manager} onChange={update('manager')} />
        <div className="form-actions" style={{ marginTop: 'var(--sp-2)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="plus">Add Branch</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function BranchesPage() {
  const { branches, users, isMultiBranch, addBranch, setSelectedBranchId } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState('');
  const managers = [...users.map((u) => u.name), 'Assign later'];

  const handleSave = (form) => {
    addBranch({
      id: `br-${form.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: form.name,
      location: form.location,
      manager: form.manager === 'Assign later' ? 'Not assigned' : form.manager,
      status: 'Active',
      products: 0,
    });
    setShowModal(false);
    setNotice(`${form.name} Branch was added (demo only, it will reset when the page is refreshed).`);
  };

  const openBranch = (id) => {
    setSelectedBranchId(id);
    navigate('/dashboard');
  };

  return (
    <div className="stack">
      <PageHeader
        title="Branches"
        description="Manage your business branches."
        actions={<Button icon="plus" onClick={() => setShowModal(true)}>Add Branch</Button>}
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      {!isMultiBranch && (
        <Alert tone="info">
          Your business has one branch, and Hifadhi works fully with a single branch. If you open another location,
          add it here.
        </Alert>
      )}

      <Card flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Branch Name</th>
                <th scope="col">Location</th>
                <th scope="col">Manager</th>
                <th scope="col" className="num">Products</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.id}>
                  <td className="cell-title">{b.name}</td>
                  <td>{b.location}</td>
                  <td>
                    {b.manager}
                    {b.managerNote && <span className="cell-sub">{b.managerNote}</span>}
                  </td>
                  <td className="num">{b.products}</td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    <Button variant="secondary" size="sm" onClick={() => openBranch(b.id)} aria-label={`Open ${b.name} Branch dashboard`}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && <AddBranchModal managers={managers} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
