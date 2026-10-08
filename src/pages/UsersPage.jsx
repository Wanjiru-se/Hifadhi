import { useState } from 'react';
import { useApp } from '../context/AppContext';
import Alert from '../components/ui/Alert';
import { StatusBadge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { SelectField, TextField } from '../components/ui/FormField';

const PERMISSIONS = [
  ['Dashboard, products and inventory', true, true],
  ['Add inventory batches', true, true],
  ['Sales data and forecasts', true, true],
  ['Risk details and recommendations', true, true],
  ['Manage branches', true, false],
  ['Manage users', true, false],
  ['Business account settings', true, false],
];

function Allowed({ value }) {
  return value ? (
    <span className="badge badge-low"><Icon name="check" size={14} strokeWidth={3} /> Yes</span>
  ) : (
    <span className="badge badge-neutral"><Icon name="x" size={14} strokeWidth={3} /> No</span>
  );
}

function AddUserModal({ onClose, onSave, branchOptions }) {
  const [form, setForm] = useState({ name: '', email: '', branchAccess: branchOptions[0] });
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <Modal title="Add User" description="Invite an employee to help manage inventory." onClose={onClose}>
      <form
        className="stack"
        style={{ gap: 'var(--sp-4)' }}
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
      >
        <TextField label="Full name" required placeholder="e.g. Grace Achieng" value={form.name} onChange={update('name')} />
        <TextField label="Email address" type="email" required placeholder="name@business.co.ke" value={form.email} onChange={update('email')} />
        <TextField label="Role" value="Inventory Manager" readOnly hint="Only the business owner holds the Business Admin role." />
        <SelectField label="Branch access" options={branchOptions} value={form.branchAccess} onChange={update('branchAccess')} />
        <div className="form-actions" style={{ marginTop: 'var(--sp-2)' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon="mail">Send Invitation</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const { users, branches, addUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [notice, setNotice] = useState('');
  const branchOptions = branches.length > 1 ? [...branches.map((b) => b.name), 'All Branches'] : [branches[0].name];

  const handleSave = (form) => {
    addUser({
      id: `u-${Date.now()}`,
      name: form.name,
      email: form.email,
      role: 'Inventory Manager',
      branchAccess: form.branchAccess,
      status: 'Invited',
      lastActive: 'Not yet signed in',
    });
    setShowModal(false);
    setNotice(`An invitation for ${form.name} was created (demo only, no email is sent).`);
  };

  return (
    <div className="stack">
      <PageHeader
        title="Users"
        description="Manage who can access your Hifadhi account."
        actions={<Button icon="plus" onClick={() => setShowModal(true)}>Add User</Button>}
      />

      {notice && <Alert tone="success">{notice}</Alert>}
      <Alert tone="info">
        Inventory Manager accounts are optional. As the Business Admin you can already use every inventory feature
        yourself.
      </Alert>

      <Card flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Role</th>
                <th scope="col">Branch Access</th>
                <th scope="col">Status</th>
                <th scope="col">Last Active</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="cell-title">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.branchAccess}</td>
                  <td><StatusBadge status={u.status} /></td>
                  <td className="text-muted">{u.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Role permissions" subtitle="What each role can do in Hifadhi" flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                <th scope="col">Business Admin</th>
                <th scope="col">Inventory Manager</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map(([feature, admin, manager]) => (
                <tr key={feature}>
                  <td className="cell-title">{feature}</td>
                  <td><Allowed value={admin} /></td>
                  <td><Allowed value={manager} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && <AddUserModal branchOptions={branchOptions} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
