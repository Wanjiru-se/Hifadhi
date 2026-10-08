/*
  Split layout for Login and Registration: brand panel on the left,
  form panel on the right. Brand text stays as real HTML; the produce
  photo (src/assets/login-produce.jpg) is decorative only.
*/
import producePhoto from '../../assets/login-produce.jpg';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';

const FEATURES = [
  { icon: 'package', text: 'Smarter inventory management' },
  { icon: 'lock', text: 'Less food waste' },
  { icon: 'leaf', text: 'A more sustainable tomorrow' },
];

/* quote may be a string or an array of lines */
export default function AuthLayout({ children, quote = ['Good food', 'goes further.'] }) {
  const quoteLines = Array.isArray(quote) ? quote : [quote];
  return (
    <div className="auth-page">
      <aside className="auth-hero">
        <div className="auth-brand">
          <Logo variant="light" stacked />
          <ul className="auth-features">
            {FEATURES.map((f) => (
              <li key={f.text}>
                <span className="feature-icon">
                  <Icon name={f.icon} size={20} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        <img className="auth-produce" src={producePhoto} alt="" aria-hidden="true" />
        <p className="auth-quote">
          {quoteLines.map((line) => (
            <span key={line} className="auth-quote-line">
              {line}
            </span>
          ))}
          <svg className="auth-quote-stroke" viewBox="0 0 220 16" aria-hidden="true" focusable="false">
            <path d="M4 12C60 4 140 2 216 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </p>
      </aside>
      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
