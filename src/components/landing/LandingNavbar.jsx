/*
  Public landing page navigation.
  Section links point to the landing page section IDs. Get Started opens
  /get-started, a simple page where visitors choose the existing Login or
  Registration flow.

  The bar is fixed to the top of the viewport. At the top of the page it
  is transparent over the hero, exactly as before. Once the page scrolls it
  gains a more solid dark green background (is-scrolled) and becomes
  slightly more compact. The link for the section currently in view
  (Solution, How It Works, Why Hifadhi or About) is gently highlighted.
  Anchor jumps leave room for the bar through scroll-padding-top in CSS.
*/
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';
import Logo from '../ui/Logo';

/* Sections that can be highlighted as the visitor scrolls */
const TRACKED = ['solution', 'how-it-works', 'why-hifadhi', 'about'];

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#solution', label: 'Solution' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#why-hifadhi', label: 'Why Hifadhi' },
  { href: '#about', label: 'About' },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('');
  const close = () => setOpen(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setScrolled(window.scrollY > 8);
      /* A section is current when it crosses a line 40% down the viewport */
      const line = window.innerHeight * 0.4;
      let current = '';
      TRACKED.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) current = id;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={`lp-nav${open ? ' is-open' : ''}${scrolled ? ' is-scrolled' : ''}`}>
      <div className="lp-container lp-nav-inner">
        <Link to="/" className="lp-nav-logo" aria-label="Hifadhi home" onClick={close}>
          <Logo variant="dark" showTagline={false} />
        </Link>

        <button
          type="button"
          className="lp-nav-toggle"
          aria-expanded={open}
          aria-controls="lp-nav-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu'} size={24} />
        </button>

        <nav id="lp-nav-menu" className="lp-nav-menu" aria-label="Main">
          <ul className="lp-nav-links">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`lp-nav-link${active === item.href.slice(1) ? ' is-active' : ''}`}
                  aria-current={active === item.href.slice(1) ? 'location' : undefined}
                  onClick={close}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Link to="/get-started" className="lp-nav-login" onClick={close}>
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  );
}
