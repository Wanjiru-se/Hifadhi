/*
  Landing page final section: call to action (id="get-started").
  A calm cream closing statement after the dark About section.

  When the section is meaningfully in view its parts appear once, in order:
  label, first heading line, (short pause) second heading line, supporting
  sentence, then the Login button. Subtle opacity and vertical movement
  only. With prefers-reduced-motion everything is shown at once.
  The button goes to the existing /register route; returning users log in
  from the navbar.
*/
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon';

/* ms after the section enters view when each step appears */
const REVEAL_AT = [0, 250, 1150, 1800, 2400];

export default function LandingCta() {
  const ref = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduced || !('IntersectionObserver' in window)) {
      setStep(REVEAL_AT.length);
      return undefined;
    }
    const timers = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        REVEAL_AT.forEach((t, i) => timers.push(setTimeout(() => setStep(i + 1), t)));
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const on = (n) => `lp-cta-step${step >= n ? ' is-on' : ''}`;

  return (
    <section id="get-started" ref={ref} className="lp-cta" aria-labelledby="lp-cta-title">
      <div className="lp-container lp-cta-inner">
        <p className={`lp-eyebrow lp-cta-label ${on(1)}`}>Make the decision earlier</p>
        <h2 id="lp-cta-title" className="lp-cta-title">
          <span className={on(2)}>Make better decisions</span>{' '}
          <span className={`lp-cta-title-accent ${on(3)}`}>before inventory becomes waste.</span>
        </h2>
        <p className={`lp-cta-text ${on(4)}`}>
          Turn inventory, sales and expiry information into earlier, more informed decisions.
        </p>
        <div className={on(5)}>
          <Link to="/register" className="lp-cta-btn">
            Get started with Hifadhi
            <Icon name="arrowRight" size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
