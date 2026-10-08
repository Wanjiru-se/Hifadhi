/*
  Public landing page footer.
  Brand (existing Logo component), three small link groups and a quiet
  bottom row. Section links reuse the landing page section IDs; Get Started
  and Login reuse the existing /register and /login routes.
  A very subtle fade-in when the footer first enters view; none with
  prefers-reduced-motion.
*/
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const GROUPS = [
  {
    title: 'Explore',
    links: [
      { href: '#home', label: 'Home' },
      { href: '#solution', label: 'Solution' },
      { href: '#how-it-works', label: 'How It Works' },
      { href: '#why-hifadhi', label: 'Why Hifadhi' },
    ],
  },
  {
    title: 'Hifadhi',
    links: [{ href: '#about', label: 'About' }],
  },
  {
    title: 'Access',
    links: [
      { to: '/register', label: 'Get Started' },
      { to: '/login', label: 'Login' },
    ],
  },
];

function FooterLink({ item }) {
  if (item.to) {
    return (
      <Link to={item.to} className="lp-footer-link">
        {item.label}
      </Link>
    );
  }
  if (item.href) {
    return (
      <a href={item.href} className="lp-footer-link">
        {item.label}
      </a>
    );
  }
  return <span className="lp-footer-text">{item.text}</span>;
}

export default function LandingFooter() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduced || !('IntersectionObserver' in window)) {
      setShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className={`lp-footer${shown ? ' is-shown' : ''}`}>
      <div className="lp-container lp-footer-inner">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <Link to="/" className="lp-footer-logo" aria-label="Hifadhi home">
              <Logo variant="dark" showTagline={false} />
            </Link>
            <p className="lp-footer-desc">
              Helping retailers make earlier, informed decisions about perishable inventory.
            </p>
          </div>

          <nav className="lp-footer-nav" aria-label="Footer">
            {GROUPS.map((group) => (
              <div key={group.title} className="lp-footer-group">
                <p className="lp-footer-title">{group.title}</p>
                <ul>
                  {group.links.map((item) => (
                    <li key={item.label || item.text}>
                      <FooterLink item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="lp-footer-bottom">
          <p>© 2026 Hifadhi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
