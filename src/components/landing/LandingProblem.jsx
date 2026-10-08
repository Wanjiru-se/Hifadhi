/*
  Landing page section 1: the problem Hifadhi addresses.
  id="solution" so the navbar "Solution" link and the hero CTA scroll here.

  The right side is an ILLUSTRATIVE interactive scenario only. Moving through
  the shelf life shows days remaining, units sold so far and units remaining.
  Expected demand stays unknown on purpose: the retailer can see the past but
  not what demand to expect before expiry. Nothing here is connected to real
  data, the dashboard or a model.

  When the section first enters the viewport its parts are revealed one
  after another. With prefers-reduced-motion everything shows at once.
*/
import { useEffect, useRef, useState } from 'react';

const STOCK = 120;
const SHELF_DAYS = 7;

/* Illustrative sales so far for Day 1 to Day 7 (index 0 = Day 1) */
const SOLD_BY_DAY = [0, 14, 27, 41, 54, 68, 82];

/* ms after the section enters view when each step appears */
const REVEAL_AT = [
  0, // 1: 120 units in stock
  500, // 2: shelf-life timeline draws
  1400, // 3: days remaining
  2000, // 4: expected demand label
  2500, // 5: the ?
  3000, // 6: the question
  3700, // 7: what you know / what's missing
  4400, // 8: closing line
];
const ALL_STEPS = REVEAL_AT.length;

function useProgressiveReveal() {
  const ref = useRef(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduced || !('IntersectionObserver' in window)) {
      setStep(ALL_STEPS);
      return undefined;
    }
    const timers = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        REVEAL_AT.forEach((t, i) => timers.push(setTimeout(() => setStep(i + 1), t)));
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return [ref, step];
}

/* Day 1 = 7 days remaining ... Day 6 = 2 days remaining, Day 7 = expiry today */
function remainingText(day) {
  if (day >= SHELF_DAYS) return 'Expiry today';
  return `${SHELF_DAYS + 1 - day} days remaining`;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

export default function LandingProblem() {
  const [ref, step] = useProgressiveReveal();
  const [day, setDay] = useState(1);
  const on = (n) => (step >= n ? ' is-on' : '');
  const progress = (day - 1) / (SHELF_DAYS - 1);
  const sold = SOLD_BY_DAY[day - 1];
  const remaining = STOCK - sold;
  const isExpiry = day === SHELF_DAYS;

  return (
    <section id="solution" ref={ref} className="lp-problem" aria-labelledby="lp-problem-title">
      <div className="lp-container">
        <div className="lp-problem-grid">
          {/* Left: message */}
          <div className="lp-problem-copy">
            <p className="lp-eyebrow">The problem</p>
            <h2 id="lp-problem-title" className="lp-problem-title">
              <span>Knowing when stock expires isn&apos;t enough.</span>
              <span className="lp-problem-title-accent">You need to know if it will sell in time.</span>
            </h2>
            <p className="lp-problem-text">
              Stock levels tell you what you have. Expiry dates tell you how long you have. Neither tells you whether
              demand will be enough to sell that inventory in time.
            </p>
          </div>

          {/* Right: illustrative scenario */}
          <div className="lp-scenario">
            <div className={`lp-step${on(1)}`}>
              <p className="lp-mini-label">Current inventory</p>
              <p className={`lp-stock${isExpiry ? ' is-final' : ''}`}>
                <span className="lp-stock-value" key={remaining}>
                  {remaining}
                </span>
                <span className="lp-stock-label">units remaining</span>
              </p>
            </div>

            <div className={`lp-tl${on(2)}`}>
              <div className="lp-tl-ends" aria-hidden="true">
                <span>Today</span>
                <span>Expiry</span>
              </div>
              <div className="lp-tl-rail" style={{ '--p': progress }}>
                <span className="lp-tl-track" aria-hidden="true" />
                <span className="lp-tl-fill" aria-hidden="true" />
                <span className="lp-tl-ticks" aria-hidden="true">
                  {Array.from({ length: SHELF_DAYS }, (_, i) => (
                    <i key={i} className={i < day ? 'is-past' : ''} />
                  ))}
                </span>
                <label htmlFor="lp-shelf-day" className="sr-only">
                  Day of shelf life
                </label>
                <input
                  id="lp-shelf-day"
                  className="lp-tl-range"
                  type="range"
                  min="1"
                  max={SHELF_DAYS}
                  step="1"
                  value={day}
                  onChange={(e) => setDay(Number(e.target.value))}
                  aria-valuetext={`Day ${day}: ${remainingText(day)}, ${sold} units sold, ${remaining} units remaining`}
                />
              </div>
              <div className="lp-tl-days" aria-hidden="true">
                {Array.from({ length: SHELF_DAYS }, (_, i) => (
                  <span key={i} className={i + 1 === day ? 'is-current' : ''}>
                    Day {i + 1}
                  </span>
                ))}
              </div>
              <p className="lp-tl-hint">Move through the shelf life</p>
            </div>

            <div className={`lp-progress-block lp-step${on(3)}`}>
              <p className={`lp-remaining${isExpiry ? ' is-final' : ''}`} aria-live="polite">
                {remainingText(day)}
              </p>

              <div className="lp-sold">
                <div className="lp-sold-head">
                  <span className="lp-mini-label">Units sold</span>
                  <span className="lp-sold-value">
                    <strong>{sold}</strong> units sold
                  </span>
                </div>
                <div
                  className="lp-sold-bar"
                  style={{ '--sold': sold / STOCK }}
                  role="img"
                  aria-label={`${sold} of ${STOCK} units sold`}
                >
                  <span />
                </div>
              </div>

              <p className={`lp-unsold${isExpiry ? ' is-shown' : ''}`} aria-hidden={!isExpiry}>
                {remaining} units reached expiry unsold.
              </p>
            </div>

            <div className="lp-demand">
              <span className={`lp-mini-label lp-step${on(4)}`}>Expected demand</span>
              <span className={`lp-demand-q lp-step${on(5)}`} aria-label="unknown">
                ?
              </span>
            </div>

            <p className={`lp-question lp-step${on(6)}`}>
              Will all {STOCK} units sell before expiry?
            </p>

            <div className={`lp-known lp-step${on(7)}`}>
              <div>
                <p className="lp-mini-label">What you know</p>
                <ul>
                  <li>
                    Stock quantity
                    <span className="lp-known-mark">
                      <CheckIcon />
                      <span className="sr-only">known</span>
                    </span>
                  </li>
                  <li>
                    Expiry date
                    <span className="lp-known-mark">
                      <CheckIcon />
                      <span className="sr-only">known</span>
                    </span>
                  </li>
                </ul>
              </div>
              <div className="lp-missing">
                <p className="lp-mini-label">What&apos;s missing</p>
                <ul>
                  <li>
                    Expected demand
                    <span className="lp-missing-mark" aria-label="unknown">
                      ?
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={`lp-problem-close lp-step${on(8)}`}>
          <p>
            Hifadhi adds the missing piece: <strong>expected demand.</strong>
            <span className="lp-problem-close-arrow" aria-hidden="true">
              →
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
