/*
  Business Registration / onboarding in three steps:
  1. Create the business account (the person registering becomes Business Admin)
  2. Add the first branch (every business has at least one)
  3. Confirmation
*/
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { businessTypes } from '../../data/demoData';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import { Checkbox, PasswordField, SelectField, TextField } from '../../components/ui/FormField';

const TOTAL_STEPS = 3;

function StepHeader({ step, title, subtitle }) {
  return (
    <div className="steps-head">
      <span className="step-label">
        Step {step} of {TOTAL_STEPS}
      </span>
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={TOTAL_STEPS} aria-valuenow={step} aria-label="Registration progress">
        <span style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
      </div>
      <h1 style={{ marginTop: 'var(--sp-6)' }}>{title}</h1>
      <p className="auth-subtitle">{subtitle}</p>
    </div>
  );
}

export default function RegisterPage() {
  const { completeRegistration } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    ownerName: '',
    businessName: '',
    businessType: businessTypes[0],
    email: '',
    password: '',
    agreed: false,
    branchName: '',
    branchLocation: '',
    timeZone: '(GMT+3) Nairobi',
    currency: 'Kenyan Shilling (KSh)',
  });

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const finish = () => {
    completeRegistration(form);
    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      {step === 1 && (
        <>
          <StepHeader step={1} title="Create your business account" subtitle="Tell us about your business to get started with Hifadhi." />
          <form
            className="auth-form"
            style={{ marginTop: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            <TextField label="Your full name" placeholder="e.g. Ann Wanjiku" value={form.ownerName} onChange={update('ownerName')} required autoComplete="name" />
            <TextField label="Business name" placeholder="e.g. GreenMart Groceries" value={form.businessName} onChange={update('businessName')} required />
            <SelectField label="Business type" options={businessTypes} value={form.businessType} onChange={update('businessType')} required />
            <TextField label="Email address" type="email" placeholder="owner@business.co.ke" value={form.email} onChange={update('email')} required autoComplete="email" />
            <PasswordField label="Password" placeholder="At least 8 characters" minLength={8} value={form.password} onChange={update('password')} required autoComplete="new-password" />
            <Checkbox
              checked={form.agreed}
              onChange={update('agreed')}
              required
              label={
                <>
                  I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                </>
              }
            />
            <Button type="submit" block iconRight="arrowRight">
              Continue
            </Button>
          </form>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </>
      )}

      {step === 2 && (
        <>
          <StepHeader step={2} title="Add your first branch" subtitle="Every business has at least one branch. You can add more branches later if you need them." />
          <form
            className="auth-form"
            style={{ marginTop: 0 }}
            onSubmit={(e) => {
              e.preventDefault();
              setStep(3);
            }}
          >
            <TextField label="Branch name" placeholder="e.g. Kilimani" value={form.branchName} onChange={update('branchName')} required />
            <TextField label="Location / address" placeholder="e.g. Kilimani, Nairobi" value={form.branchLocation} onChange={update('branchLocation')} required />
            <SelectField label="Time zone" options={['(GMT+3) Nairobi', '(GMT+3) Kampala', '(GMT+3) Dar es Salaam']} value={form.timeZone} onChange={update('timeZone')} />
            <SelectField label="Currency" options={['Kenyan Shilling (KSh)', 'Ugandan Shilling (UGX)', 'Tanzanian Shilling (TZS)']} value={form.currency} onChange={update('currency')} />
            <div className="row-between" style={{ marginTop: 'var(--sp-2)' }}>
              <Button variant="secondary" icon="arrowLeft" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" iconRight="arrowRight">
                Continue
              </Button>
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <StepHeader step={3} title="You're all set!" subtitle="Your Hifadhi account has been created successfully." />
          <div style={{ textAlign: 'center' }}>
            <div className="success-illustration" aria-hidden="true">
              <Icon name="store" size={96} strokeWidth={1.5} />
              <span className="success-check">
                <Icon name="check" size={26} strokeWidth={3} />
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--fs-xl)' }}>{form.businessName || 'Your business'}</h2>
            <p className="text-muted">{form.branchName || 'First'} Branch</p>
          </div>
          <ul className="checklist">
            <li>
              <Icon name="checkCircle" /> Business account created
            </li>
            <li>
              <Icon name="checkCircle" /> First branch added
            </li>
            <li>
              <Icon name="checkCircle" /> You are now the Business Admin
            </li>
          </ul>
          <p className="field-hint" style={{ marginTop: 'var(--sp-4)' }}>
            You can manage inventory yourself. Adding Inventory Manager accounts is optional and can be done later from Users.
          </p>
          <Button block iconRight="arrowRight" onClick={finish} style={{ marginTop: 'var(--sp-6)' }}>
            Go to Dashboard
          </Button>
        </>
      )}
    </AuthLayout>
  );
}
