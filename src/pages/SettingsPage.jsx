import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { businessTypes } from '../data/demoData';
import { LATER_PHASE_FEATURES } from '../config/features';
import { EXPIRING_SOON_DAYS, RISK_THRESHOLDS } from '../utils/inventory';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import { Checkbox, SelectField, TextField } from '../components/ui/FormField';

export default function SettingsPage() {
  const { isAdmin, currentUser, business, session, branchMode, setRole, setBranchMode } = useApp();
  const [saved, setSaved] = useState(false);

  const save = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="stack">
      <PageHeader title="Settings" description={isAdmin ? 'Manage your profile and business details.' : 'Manage your profile.'} />

      {saved && <Alert tone="success">Settings saved (demo only, nothing is stored yet).</Alert>}

      <form className="stack" onSubmit={save} key={currentUser.id}>
        <Card title="My profile">
          <div className="form-grid">
            <TextField label="Full name" defaultValue={currentUser.name} />
            <TextField label="Email address" type="email" defaultValue={currentUser.email} />
          </div>
        </Card>

        {isAdmin && (
          <Card title="Business details" subtitle="Only the Business Admin can change these">
            <div className="form-grid">
              <TextField label="Business name" defaultValue={business.name} />
              <SelectField label="Business type" options={businessTypes} defaultValue={business.type} />
              <SelectField label="Currency" options={['Kenyan Shilling (KSh)']} defaultValue="Kenyan Shilling (KSh)" />
              <SelectField label="Time zone" options={['(GMT+3) Nairobi']} defaultValue="(GMT+3) Nairobi" />
            </div>
          </Card>
        )}

        {/* Risk alerts: later phase */}
        {LATER_PHASE_FEATURES && (
        <Card title="Risk alerts">
          <div className="setting-row">
            <div>
              <p className="setting-title">Expiring soon window</p>
              <p>Products expiring within this many days are counted as expiring soon.</p>
            </div>
            <span className="badge badge-neutral badge-lg">{EXPIRING_SOON_DAYS} days</span>
          </div>
          <div className="setting-row">
            <div>
              <p className="setting-title">Risk level thresholds</p>
              <p>Share of stock expected to remain unsold at expiry.</p>
            </div>
            <span className="text-strong">
              High from {RISK_THRESHOLDS.high * 100}%, Medium from {RISK_THRESHOLDS.medium * 100}%
            </span>
          </div>
          <div className="setting-row">
            <div>
              <p className="setting-title">Notifications</p>
              <p>Choose which alerts appear in the notification bell.</p>
            </div>
            <div className="stack" style={{ gap: 'var(--sp-2)' }}>
              <Checkbox label="High-risk products" defaultChecked />
              <Checkbox label="Batches expiring in 3 days" defaultChecked />
              <Checkbox label="Daily summary" />
            </div>
          </div>
        </Card>
        )}

        <div className="form-actions" style={{ marginTop: 0 }}>
          <Button type="submit" icon="check">Save Changes</Button>
        </div>
      </form>

      <Card title="Prototype demo options" subtitle="For demonstrating the interface only. These will be removed when real accounts are added.">
        <div className="setting-row">
          <div>
            <p className="setting-title">View as role</p>
            <p>Switch between the Business Admin and Inventory Manager views.</p>
          </div>
          <SegmentedControl
            label="Demo role"
            value={session.role}
            onChange={setRole}
            options={[
              { value: 'admin', label: 'Business Admin' },
              { value: 'manager', label: 'Inventory Manager' },
            ]}
          />
        </div>
        <div className="setting-row">
          <div>
            <p className="setting-title">Branch setup</p>
            <p>A single-branch business hides the branch selector and redistribution suggestions.</p>
          </div>
          <SegmentedControl
            label="Branch setup"
            value={branchMode}
            onChange={setBranchMode}
            options={[
              { value: 'single', label: 'Single branch' },
              { value: 'multi', label: 'Multiple branches' },
            ]}
          />
        </div>
      </Card>
    </div>
  );
}
