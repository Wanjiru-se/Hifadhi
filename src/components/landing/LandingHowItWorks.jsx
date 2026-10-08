/*
  Landing page section 2: How Hifadhi works (id="how-it-works").
  01 Know -> 02 Forecast -> 03 Assess -> 04 Act

  ILLUSTRATIVE EXAMPLE ONLY. The numbers match the Problem section story
  (120 units, 7 days, 82 expected, 38 at risk). Nothing here runs a model
  or reads real data.

  Layout
  - 900px and wider: a 2 x 2 journey. Know (top left) -> Forecast (top
    right) -> down to Assess (bottom right) -> back to Act (bottom left),
    joined by three directional connectors.
  - Narrower screens: one vertical sequence, Know -> Forecast -> Assess -> Act.

  Storytelling sequence (automatic, nothing to click or drag)
  The story is a list of timed beats (BEATS below). Scroll position
  controls progression: the first beat of each stage waits until the
  visitor has scrolled to that stage's gate (see useStageGates), and each
  gate needs at least MIN_GATE_GAP px more scrolling than the previous one,
  even where two stages sit side by side. Within a stage the beats run
  quickly on their own, so a stage completes and then holds until the
  visitor scrolls on.
    Know:     historical sales, then inventory and shelf life appear.
    Forecast: bars rise one by one, the forecast line draws itself with its
              endpoint travelling along it, then 82 units expected demand.
    Assess:   the 82 in Forecast is briefly emphasised, then 120 available,
              82 expected demand (highlighted, from 02), 7 days, the bar,
              and 38 units potentially at risk.
    Act:      three recommendations, the review note, then the closing line.
  It runs once. If the whole section leaves the viewport, it resets and
  plays again cleanly on the next visit. With prefers-reduced-motion every
  stage is shown complete, with no animation.
*/
import { useEffect, useRef, useState } from 'react';

const HISTORY = [12, 18, 15, 21, 24];
/* Cumulative forecast over the next 7 days, ending at 82 units */
const FORECAST_CUMULATIVE = [11, 23, 35, 47, 59, 70, 82];
const LINE_MS = 1100; // forecast line drawing time
const READ_LINE = 0.72; // gate line, as a share of viewport height from the top
const MIN_GATE_GAP = 260; // px of extra scrolling between one stage and the next

/* gap: ms after the previous beat. stage: that stage must be in view first. */
const BEATS = [
  { id: 'know', gap: 0, stage: 0 },
  { id: 'knowSales', gap: 250 },
  { id: 'knowFacts', gap: 650 },
  { id: 'forecast', gap: 300, stage: 1 },
  { id: 'fcBars', gap: 250 },
  { id: 'fcLine', gap: 950 },
  { id: 'fcResult', gap: LINE_MS + 100 },
  { id: 'handoff', gap: 300, stage: 2 },
  { id: 'assess', gap: 450 },
  { id: 'asExpected', gap: 400 },
  { id: 'asDays', gap: 400 },
  { id: 'asBar', gap: 400 },
  { id: 'asRisk', gap: 450 },
  { id: 'act', gap: 300, stage: 3 },
  { id: 'rec1', gap: 350 },
  { id: 'rec2', gap: 350 },
  { id: 'rec3', gap: 350 },
  { id: 'note', gap: 450 },
  { id: 'final', gap: 600 },
];
const B = Object.fromEntries(BEATS.map((b, i) => [b.id, i]));
const LAST = BEATS.length - 1;
const STAGE_START = [B.know, B.forecast, B.assess, B.act];

function useMedia(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = (e) => setMatches(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

/* Runs the beats. Returns the index of the latest beat reached (-1 = not started). */
function useStory(sectionRef, stageRefs, reduced) {
  const [beat, setBeat] = useState(-1);
  const [reached, setReached] = useState(-1); /* highest stage whose scroll gate is passed */

  useEffect(() => {
    if (reduced || !('IntersectionObserver' in window)) return undefined;
    /* Reset once the whole section has left the viewport */
    const sectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        setBeat(-1);
        setReached(-1);
      }
    });
    if (sectionRef.current) sectionObserver.observe(sectionRef.current);

    /*
      Scroll gates (document px). Stage i opens when the read line (72% down
      the viewport) passes the upper part of its card, and never sooner than
      MIN_GATE_GAP px after the previous stage's gate. On the 2 x 2 layout
      this spaces the four stages evenly while each card is on screen.
    */
    let frame = 0;
    const update = () => {
      frame = 0;
      /* Only progress while the section is on screen */
      const box = sectionRef.current?.getBoundingClientRect();
      if (!box || box.bottom <= 0 || box.top >= window.innerHeight) return;
      const line = window.scrollY + window.innerHeight * READ_LINE;
      let gate = -Infinity;
      let passed = -1;
      stageRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const own = window.scrollY + rect.top + rect.height * 0.15;
        gate = Math.max(own, gate + MIN_GATE_GAP);
        if (line >= gate && passed === i - 1) passed = i;
      });
      setReached((r) => Math.max(r, passed));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced, sectionRef, stageRefs]);

  const next = BEATS[beat + 1];
  const gateOpen = !next || next.stage === undefined || reached >= next.stage;

  useEffect(() => {
    if (reduced || beat >= LAST || !gateOpen) return undefined;
    const t = setTimeout(() => setBeat((b) => b + 1), beat < 0 ? 100 : BEATS[beat + 1].gap);
    return () => clearTimeout(t);
  }, [beat, gateOpen, reduced]);

  return reduced ? LAST : beat;
}

/* lineState: 'hidden' | 'draw' | 'done'. The line draws left to right and
   the endpoint dot travels along it. */
function ForecastChart({ barsOn, lineState }) {
  const lineRef = useRef(null);
  const dotRef = useRef(null);
  const W = 260;
  const H = 120;
  const base = 104;
  const barW = 12;
  const histX = (i) => 10 + i * 20;
  const histH = (v) => (v / 24) * 56;
  const fx = (i) => 132 + i * 19;
  const fy = (v) => base - (v / 82) * 86;
  const points = [[fx(0) - 12, base], ...FORECAST_CUMULATIVE.map((v, i) => [fx(i), fy(v)])];
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const area = `${line} L${fx(6)},${base} Z`;

  useEffect(() => {
    const path = lineRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return undefined;
    const total = path.getTotalLength();
    const place = (p) => {
      path.style.strokeDashoffset = String(1 - p);
      const pt = path.getPointAtLength(total * p);
      dot.setAttribute('cx', pt.x);
      dot.setAttribute('cy', pt.y);
    };
    if (lineState === 'hidden') {
      place(0);
      dot.style.opacity = '0';
      return undefined;
    }
    dot.style.opacity = '1';
    if (lineState === 'done') {
      place(1);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / LINE_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      place(eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      place(1);
    };
  }, [lineState]);

  return (
    <svg
      className={`lp-fc-chart${barsOn ? ' is-bars' : ''}`}
      viewBox={`0 0 ${W} ${H}`}
      aria-hidden="true"
      focusable="false"
    >
      {HISTORY.map((v, i) => (
        <rect
          key={v + i}
          className="lp-fc-bar"
          style={{ '--i': i }}
          x={histX(i)}
          y={base - histH(v)}
          width={barW}
          height={histH(v)}
          rx="2"
        />
      ))}
      <line className="lp-fc-now" x1="116" x2="116" y1="10" y2={base} />
      <path className={`lp-fc-area${lineState === 'done' ? ' is-on' : ''}`} d={area} />
      <path ref={lineRef} className="lp-fc-line" d={line} pathLength="1" />
      <circle ref={dotRef} className="lp-fc-dot" cx={points[0][0]} cy={points[0][1]} r="4" />
      <line className="lp-fc-base" x1="4" x2={W - 4} y1={base} y2={base} />
      <text className="lp-fc-axis" x="10" y={H - 2}>
        Past sales
      </text>
      <text className="lp-fc-axis" x="124" y={H - 2}>
        Next 7 days
      </text>
    </svg>
  );
}

function FlowArrow({ n, lit }) {
  return (
    <li className={`lp-how-flow lp-how-flow--${n}${lit ? ' is-lit' : ''}`} aria-hidden="true" role="presentation">
      <svg viewBox="0 0 56 14">
        <path className="lp-how-flow-line" d="M2 7h50" pathLength="1" />
        <path className="lp-how-flow-head" d="M47 2l6 5-6 5" />
      </svg>
    </li>
  );
}

export default function LandingHowItWorks() {
  const sectionRef = useRef(null);
  const stageRefs = useRef([]);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const beat = useStory(sectionRef, stageRefs, reduced);

  let active = -1;
  STAGE_START.forEach((start, i) => {
    if (beat >= start) active = i;
  });
  const at = (id) => beat >= B[id];
  const rv = (id) => `lp-rv${at(id) ? ' is-on' : ''}`;
  const stageClass = (i, name) =>
    `lp-how-stage lp-how-stage--${name}${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`;
  const setStageRef = (i) => (el) => {
    stageRefs.current[i] = el;
  };
  let lineState = 'hidden';
  if (beat > B.fcLine) lineState = 'done';
  else if (beat === B.fcLine) lineState = 'draw';
  const handoff = beat >= B.handoff && beat < B.asExpected;
  const linked = beat >= B.asExpected && beat < B.asBar;

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className={`lp-how${reduced ? ' is-static' : ''}`}
      aria-labelledby="lp-how-title"
    >
      <div className="lp-container lp-how-inner">
        <header className="lp-how-head">
          <p className="lp-how-eyebrow">How Hifadhi works</p>
          <h2 id="lp-how-title" className="lp-how-title">
            From inventory data to an earlier decision.
          </h2>
        </header>

        <ol className="lp-how-journey">
          {/* 01 KNOW (top left) */}
          <li ref={setStageRef(0)} className={stageClass(0, 'know')}>
            <div className="lp-how-stage-head">
              <p className="lp-how-num">01</p>
              <h3 className="lp-how-name">Know</h3>
              <p className="lp-how-idea">Start with what the retailer already knows.</p>
            </div>
            <div className="lp-how-body">
              <p className={`lp-how-mini ${rv('knowSales')}`}>Historical sales</p>
              <p className="lp-know-sales">
                {HISTORY.map((v, i) => (
                  <span key={v + i} className={rv('knowSales')} style={{ '--i': i + 1 }}>
                    {v}
                  </span>
                ))}
              </p>
              <dl className="lp-know-facts">
                <div className={rv('knowFacts')}>
                  <dt>Current inventory</dt>
                  <dd>120 units</dd>
                </div>
                <div className={rv('knowFacts')} style={{ '--i': 3 }}>
                  <dt>Remaining shelf life</dt>
                  <dd>7 days</dd>
                </div>
              </dl>
            </div>
          </li>

          <FlowArrow n={1} lit={at('forecast')} />

          {/* 02 FORECAST (top right) */}
          <li ref={setStageRef(1)} className={stageClass(1, 'forecast')}>
            <div className="lp-how-stage-head">
              <p className="lp-how-num">02</p>
              <h3 className="lp-how-name">Forecast</h3>
              <p className="lp-how-idea">Estimate short-term demand from historical sales.</p>
            </div>
            <div className="lp-how-body">
              <ForecastChart barsOn={at('fcBars')} lineState={lineState} />
              <div className={`lp-fc-result ${rv('fcResult')}${handoff ? ' is-handoff' : ''}`}>
                <p className="lp-how-mini">Expected demand</p>
                <p className="lp-how-figure">
                  <strong>82</strong> units
                </p>
                <p className="lp-how-source">Demand forecast for the next 7 days</p>
              </div>
            </div>
          </li>

          <FlowArrow n={2} lit={at('handoff')} />

          {/* 03 ASSESS (bottom right) */}
          <li ref={setStageRef(2)} className={stageClass(2, 'assess')}>
            <div className="lp-how-stage-head">
              <p className="lp-how-num">03</p>
              <h3 className="lp-how-name">Assess</h3>
              <p className="lp-how-idea">Compare expected demand with inventory and remaining shelf life.</p>
            </div>
            <div className="lp-how-body">
              <ul className="lp-assess-inputs">
                <li className={rv('assess')}>
                  <strong>120</strong> units available
                </li>
                <li className={`lp-assess-link ${rv('asExpected')}${linked ? ' is-linked' : ''}`}>
                  <strong>82</strong> units expected demand
                  <span className="lp-assess-tag">from 02</span>
                </li>
                <li className={rv('asDays')}>
                  <strong>7</strong> days remaining
                </li>
              </ul>
              <div
                className={`lp-assess-bar ${rv('asBar')}`}
                role="img"
                aria-label="Of 120 units, 82 are expected to sell and 38 may not"
              >
                <span className="lp-assess-sell" />
                <span className="lp-assess-risk" />
              </div>
              <div className={`lp-assess-result ${rv('asRisk')}`}>
                <p className="lp-how-figure lp-how-figure-risk">
                  <strong>38</strong> units
                </p>
                <p className="lp-how-source">potentially at risk</p>
              </div>
            </div>
          </li>

          <FlowArrow n={3} lit={at('act')} />

          {/* 04 ACT (bottom left) */}
          <li ref={setStageRef(3)} className={stageClass(3, 'act')}>
            <div className="lp-how-stage-head">
              <p className="lp-how-num">04</p>
              <h3 className="lp-how-name">Act</h3>
              <p className="lp-how-idea">Turn identified risk into earlier decision support.</p>
            </div>
            <div className="lp-how-body">
              <p className={`lp-how-mini ${rv('rec1')}`}>Recommendations</p>
              <ul className="lp-act-list">
                {['Prioritise older stock', 'Consider markdown', 'Consider redistribution'].map((rec, i) => (
                  <li key={rec} className={rv(`rec${i + 1}`)}>
                    <span className="lp-act-dot" aria-hidden="true" />
                    {rec}
                  </li>
                ))}
              </ul>
              <p className={`lp-act-note ${rv('note')}`}>Suggestions for you to review. Nothing changes automatically.</p>
            </div>
          </li>
        </ol>

        <p className={`lp-how-final${at('final') ? ' is-shown' : ''}`}>
          You decide. <span>Hifadhi helps you decide earlier.</span>
        </p>
      </div>
    </section>
  );
}
