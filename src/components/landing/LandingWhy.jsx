/*
  Landing page section 3: Why Hifadhi (id="why-hifadhi").

  A passive, progressive comparison of two retailers with the same
  illustrative scenario (120 units, 7 days until expiry). It tells one story:
    stock known -> expiry known -> risk unknown -> Hifadhi adds demand
    information -> risk becomes visible -> there is still time to respond.

  Sequence (runs once, see STEPS). Scroll position controls progression
  through three gates: A when the comparison enters view (left side),
  B once it has been scrolled well into view (sweep and Hifadhi side), and
  C when the shared timeline comes into view (timeline, outcomes, close).
  Within each part the steps run quickly on their own, then hold until the
  visitor scrolls on:
    1. Without early visibility: 120 counts up, then 7 days, then Risk
       visibility, then "Unknown" with one soft pulse, then "Will it all sell?".
    2. A soft light sweeps left to right across the comparison, and the
       With Hifadhi panel brightens as it arrives.
    3. With Hifadhi: 120 units, 7 days, then expected demand counting to 82.
    4. Potentially at risk: the card's border draws itself, 38 counts up,
       and the finished card settles with a gentle emphasis.
    5. "There is still time to respond." rises in last.
  Then, as before, the shared expiry timeline moves slowly toward expiry,
  the three outcomes appear and the closing line follows.
  It is not interactive and not connected to real data or a model. With
  prefers-reduced-motion the final comparison is shown straight away and
  nothing moves.
*/
import { useEffect, useRef, useState } from 'react';

const DAYS = 7;
const DAY_STEP = 1900; // ms between timeline steps
const LAST_DAY_INDEX = DAYS - 2; // stops at "1 day remaining"

/*
  [id, ms after the previous step, scroll gate that must be passed first]
  Gates are viewport-height shares from the top:
    A: comparison top above 78%   B: comparison top above 42%
    C: timeline top above 85%
*/
const STEPS = [
  ['leftStock', 0, 'A'],
  ['leftExpiry', 700],
  ['leftRiskLabel', 450],
  ['leftUnknown', 350],
  ['leftQuestion', 650],
  ['sweep', 450, 'B'],
  ['wash', 450],
  ['rightStock', 150],
  ['rightExpiry', 400],
  ['rightDemand', 400],
  ['risk', 950],
  ['riskCount', 300],
  ['settled', 900],
  ['respond', 400],
  ['time', 350, 'C'],
];
const STEP_INDEX = Object.fromEntries(STEPS.map(([id], i) => [id, i + 1]));
const GATE_ORDER = ['A', 'B', 'C'];

const OUTCOMES = [
  { title: 'See earlier', text: 'Identify potential inventory risk before expiry.' },
  { title: 'Decide earlier', text: 'Get useful information while there is still time to respond.' },
  { title: 'Waste less', text: 'Create more opportunity to sell or redirect inventory before it becomes waste.' },
];

function remainingLabel(dayIndex) {
  const left = DAYS - dayIndex;
  return `${left} ${left === 1 ? 'day' : 'days'} remaining`;
}

function useWhySequence() {
  const ref = useRef(null);
  const timeRef = useRef(null);
  const [step, setStep] = useState(0);
  const [gate, setGate] = useState(-1); /* index in GATE_ORDER of the furthest gate passed */
  const [dayIndex, setDayIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  /* Scroll gates */
  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!ref.current || prefersReduced) {
      setReduced(!!prefersReduced);
      setStep(STEPS.length);
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = ref.current?.getBoundingClientRect().top ?? Infinity;
      const timeTop = timeRef.current?.getBoundingClientRect().top ?? Infinity;
      let passed = -1;
      if (top <= vh * 0.78) passed = 0;
      if (passed === 0 && top <= vh * 0.42) passed = 1;
      if (passed === 1 && timeTop <= vh * 0.85) passed = 2;
      setGate((g) => Math.max(g, passed));
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

  /* Step through STEPS, waiting at each gate until it has been scrolled past */
  const next = STEPS[step];
  const open = !next || !next[2] || gate >= GATE_ORDER.indexOf(next[2]);
  useEffect(() => {
    if (reduced || step >= STEPS.length || !open) return undefined;
    const t = setTimeout(() => setStep((n) => n + 1), STEPS[step][1]);
    return () => clearTimeout(t);
  }, [step, open, reduced]);

  /* The shared timeline moves slowly toward expiry once it is reached */
  const timeOn = step >= STEP_INDEX.time;
  useEffect(() => {
    if (!timeOn || reduced) return undefined;
    const timers = [];
    for (let d = 1; d <= LAST_DAY_INDEX; d += 1) timers.push(setTimeout(() => setDayIndex(d), d * DAY_STEP));
    return () => timers.forEach(clearTimeout);
  }, [timeOn, reduced]);

  return [ref, timeRef, step, dayIndex, reduced];
}

/* Counts from 0 to target once active (eased, no overshoot) */
function useCountUp(target, active, duration, reduced) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active || reduced) return undefined;
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, reduced]);
  if (reduced) return target;
  return active ? value : 0;
}

/* Count shown with a fixed width so the text beside it does not shift */
function Count({ value, target }) {
  return (
    <strong className="lp-vs-count" style={{ minWidth: `${String(target).length}ch` }}>
      {value}
    </strong>
  );
}

/* The at-risk card: its border is drawn around it, then it settles */
function RiskCard({ drawn, settled, value }) {
  const ref = useRef(null);
  const [size, setSize] = useState(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);

  return (
    <div ref={ref} className={`lp-vs-risk${drawn ? ' is-drawn' : ''}${settled ? ' is-settled' : ''}`}>
      {size && (
        <svg className="lp-vs-risk-border" width={size.w} height={size.h} aria-hidden="true" focusable="false">
          <rect
            x="0.75"
            y="0.75"
            width={Math.max(0, size.w - 1.5)}
            height={Math.max(0, size.h - 1.5)}
            rx="13.5"
            pathLength="1"
          />
        </svg>
      )}
      <p className="lp-vs-mini lp-vs-mini-hf">Potentially at risk</p>
      <p className="lp-vs-value">
        <Count value={value} target={38} /> units
      </p>
    </div>
  );
}

export default function LandingWhy() {
  const [ref, timeRef, step, dayIndex, reduced] = useWhySequence();
  const at = (id) => step >= STEP_INDEX[id];
  const on = (id) => (at(id) ? ' is-on' : '');
  const progress = dayIndex / (DAYS - 1);

  const leftStock = useCountUp(120, at('leftStock'), 800, reduced);
  const demand = useCountUp(82, at('rightDemand'), 800, reduced);
  const risk = useCountUp(38, at('riskCount'), 800, reduced);

  return (
    <section
      id="why-hifadhi"
      className={`lp-why${at('time') ? ' is-visible' : ''}${reduced ? ' is-static' : ''}`}
      aria-labelledby="lp-why-title"
    >
      <div className="lp-container lp-why-inner">
        <header className="lp-why-head">
          <p className="lp-eyebrow">Why Hifadhi</p>
          <h2 id="lp-why-title" className="lp-why-title">
            See the risk while there&apos;s still time to act.
          </h2>
        </header>

        <div
          ref={ref}
          className={`lp-vs${at('wash') ? ' is-washed' : ''}${at('sweep') && !reduced ? ' is-sweeping' : ''}`}
        >
          {/* Soft left-to-right light that carries attention to the Hifadhi side */}
          <span className="lp-vs-sweep" aria-hidden="true" />

          {/* Row: side labels */}
          <p className="lp-vs-cell lp-vs-label">Without early visibility</p>
          <p className="lp-vs-cell lp-vs-hf lp-vs-label lp-vs-label-hf">With Hifadhi</p>

          {/* Row: stock (identical) */}
          <div className={`lp-vs-cell lp-vs-step${on('leftStock')}`}>
            <p className="lp-vs-value">
              <Count value={leftStock} target={120} /> units in stock
            </p>
          </div>
          <div className={`lp-vs-cell lp-vs-hf lp-vs-step${on('rightStock')}`}>
            <p className="lp-vs-value">
              <strong>120</strong> units in stock
            </p>
          </div>

          {/* Row: expiry (identical) */}
          <div className={`lp-vs-cell lp-vs-step${on('leftExpiry')}`}>
            <p className="lp-vs-value">
              <strong>7</strong> days until expiry
            </p>
          </div>
          <div className={`lp-vs-cell lp-vs-hf lp-vs-step${on('rightExpiry')}`}>
            <p className="lp-vs-value">
              <strong>7</strong> days until expiry
            </p>
          </div>

          {/* Row: where the difference begins */}
          <div className="lp-vs-cell">
            <p className={`lp-vs-mini lp-vs-step${on('leftRiskLabel')}`}>Risk visibility</p>
            <p className={`lp-vs-unknown lp-vs-step${on('leftUnknown')}`}>Unknown</p>
          </div>
          <div className={`lp-vs-cell lp-vs-hf lp-vs-step${on('rightDemand')}`}>
            <p className="lp-vs-mini lp-vs-mini-hf">Expected demand</p>
            <p className="lp-vs-value">
              <Count value={demand} target={82} /> units
            </p>
          </div>

          <div className={`lp-vs-cell lp-vs-step${on('leftQuestion')}`}>
            <p className="lp-vs-question">Will it all sell?</p>
          </div>
          <div className={`lp-vs-cell lp-vs-hf lp-vs-step${on('risk')}`}>
            <RiskCard drawn={at('risk')} settled={at('settled')} value={risk} />
          </div>

          <div className="lp-vs-cell" aria-hidden="true" />
          <div className={`lp-vs-cell lp-vs-hf lp-vs-step${on('respond')}`}>
            <p className="lp-vs-respond">There is still time to respond.</p>
          </div>

          {/* Shared, automatic expiry progression (not interactive) */}
          <div ref={timeRef} className={`lp-vs-time lp-vs-step${on('time')}`} style={{ '--p': progress }}>
            <p className="lp-vs-time-label" aria-live="polite">
              {remainingLabel(dayIndex)}
            </p>
            <div className="lp-vs-track" aria-hidden="true">
              <span className="lp-vs-track-fill" />
              <span className="lp-vs-points">
                {Array.from({ length: DAYS }, (_, i) => (
                  <i key={i} className={`${i < dayIndex ? 'is-past' : ''}${i === dayIndex ? ' is-now' : ''}`} />
                ))}
              </span>
            </div>
            <div className="lp-vs-time-ends" aria-hidden="true">
              <span>7 days before expiry</span>
              <span>Expiry</span>
            </div>
          </div>
        </div>

        <ul className={`lp-why-outcomes${at('time') ? ' is-on' : ''}`}>
          {OUTCOMES.map((o, i) => (
            <li key={o.title} style={{ '--d': i }}>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </li>
          ))}
        </ul>

        <div className="lp-why-close lp-why-reveal" style={{ '--d': 2 }}>
          <p className="lp-why-close-line">
            Better visibility. Earlier decisions. <span>Less avoidable waste.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
