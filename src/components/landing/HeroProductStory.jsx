/*
  Rotating hero visual for the landing page.
  Each product runs a short "analysis" story:
    image -> inventory and expiry -> expected demand -> units at risk
    -> recommendation -> fade out -> next product.
  Values are illustrative (see src/data/landingHeroDemo.js).
  With prefers-reduced-motion the first product is shown with all
  information visible and nothing rotates.
*/
import { useEffect, useState } from 'react';
import { heroStoryProducts } from '../../data/landingHeroDemo';

/* Milliseconds after a product appears when each step is revealed */
const STEP_TIMES = [
  900, // 1: category label + inventory and expiry
  2300, // 2: expected demand
  3700, // 3: units at risk
  5100, // 4: recommendation
];
const HOLD_UNTIL = 8600; // information starts fading out
const NEXT_AT = 9400; // next product crossfades in
const ALL_STEPS = STEP_TIMES.length;

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function HeroProductStory() {
  const reducedMotion = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      setIndex(0);
      setStep(ALL_STEPS);
      setLeaving(false);
      return undefined;
    }
    setStep(0);
    setLeaving(false);
    const timers = STEP_TIMES.map((t, i) => setTimeout(() => setStep(i + 1), t));
    timers.push(setTimeout(() => setLeaving(true), HOLD_UNTIL));
    timers.push(
      setTimeout(() => setIndex((i) => (i + 1) % heroStoryProducts.length), NEXT_AT),
    );
    return () => timers.forEach(clearTimeout);
  }, [index, reducedMotion]);

  const product = heroStoryProducts[index];
  const shown = (n) => (step >= n && !leaving ? ' is-shown' : '');

  return (
    <div className={`lp-story${reducedMotion ? ' is-static' : ''}`}>
      <div className="lp-story-stage">
        {heroStoryProducts.map((p, i) => (
          <img
            key={p.id}
            src={p.image}
            alt=""
            className={`lp-story-image${i === index ? ' is-active' : ''}`}
            style={{ '--fx': `${p.focus.x}%`, '--fy': `${p.focus.y}%`, '--zoom': p.zoom }}
            draggable="false"
          />
        ))}
      </div>

      <div className="lp-story-info" key={product.id}>
        <div className={`lp-chip lp-chip-inventory${shown(1)}`}>
          <span className="lp-chip-label">{product.category}</span>
          <span className="lp-chip-value">
            <span>{product.stock} units in stock</span>
            <span className="lp-chip-sep" aria-hidden="true" />
            <span>{product.daysToExpiry} days to expiry</span>
          </span>
        </div>

        <div className={`lp-chip lp-chip-demand${shown(2)}`}>
          <span className="lp-chip-label">Expected demand</span>
          <span className="lp-chip-value">{product.expectedDemand} units</span>
        </div>

        <div className={`lp-chip lp-chip-risk${shown(3)}`}>
          <span className="lp-chip-label">Estimated at risk</span>
          <span className="lp-chip-risk-value">
            <strong>{product.atRisk}</strong> units
          </span>
        </div>

        <div className={`lp-chip lp-chip-action${shown(4)}`}>
          <span className="lp-action-dot" aria-hidden="true" />
          {product.recommendation}
        </div>
      </div>
    </div>
  );
}
