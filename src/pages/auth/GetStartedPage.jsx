/*
  Authentication entry page (/get-started), opened from the landing page
  navbar. It only points to the existing flows: /login for existing users
  and /register for new businesses. No authentication happens here.
*/
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Icon from '../../components/ui/Icon';

const CHOICES = [
  {
    to: '/login',
    icon: 'user',
    title: 'Log in',
    text: 'I already have a Hifadhi account.',
  },
  {
    to: '/register',
    icon: 'store',
    title: 'Create an account',
    text: 'Register a new business and become its Business Admin.',
  },
];

export default function GetStartedPage() {
  return (
    <AuthLayout>
      <h1>Get started with Hifadhi</h1>
      <p className="auth-subtitle">Choose how you would like to continue.</p>

      <div className="auth-choices">
        {CHOICES.map((c) => (
          <Link key={c.to} to={c.to} className="auth-choice">
            <span className="auth-choice-icon" aria-hidden="true">
              <Icon name={c.icon} size={22} />
            </span>
            <span className="auth-choice-text">
              <strong>{c.title}</strong>
              <span>{c.text}</span>
            </span>
            <Icon name="arrowRight" size={20} className="auth-choice-arrow" />
          </Link>
        ))}
      </div>

      <p className="auth-footer">
        <Link to="/">Back to home</Link>
      </p>
    </AuthLayout>
  );
}
