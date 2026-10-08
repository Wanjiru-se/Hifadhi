import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import { Checkbox, PasswordField, TextField } from '../../components/ui/FormField';

/* Demo accounts: no real authentication in this phase */
const DEMO_ROLES = [
  {
    key: 'admin',
    title: 'Business Admin',
    text: 'Owner. All features, branches and users.',
    email: 'owner@greenmart.co.ke',
  },
  {
    key: 'manager',
    title: 'Inventory Manager',
    text: 'Staff. Inventory features only.',
    email: 'peter@greenmart.co.ke',
  },
];

export default function LoginPage() {
  const { signIn } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState(DEMO_ROLES[0].email);
  const [password, setPassword] = useState('demo1234');
  const [showReset, setShowReset] = useState(false);

  const chooseRole = (r) => {
    setRole(r.key);
    setEmail(r.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(role);
    navigate(location.state?.from ?? '/dashboard', { replace: true });
  };

  return (
    <AuthLayout>
      <h1>Welcome back</h1>
      <p className="auth-subtitle">Sign in to your Hifadhi account</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <TextField
          label="Email address"
          type="email"
          icon="mail"
          placeholder="you@business.co.ke"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordField
          label="Password"
          icon="lock"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="row-between">
          <Checkbox label="Remember me" defaultChecked />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowReset(true)}>
            Forgot password?
          </button>
        </div>

        {showReset && (
          <Alert tone="info">Password reset will be available once authentication is connected in a later phase.</Alert>
        )}

        <div className="demo-note">
          <p className="demo-note-title">Demo account</p>
          <div className="role-picker">
            {DEMO_ROLES.map((r) => (
              <button
                key={r.key}
                type="button"
                className="role-option"
                aria-pressed={role === r.key}
                onClick={() => chooseRole(r)}
              >
                <strong>{r.title}</strong>
                <span>{r.text}</span>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" block>
          Sign In
        </Button>
      </form>

      <p className="auth-footer">
        New to Hifadhi? <Link to="/register">Register your business</Link>
      </p>
    </AuthLayout>
  );
}
