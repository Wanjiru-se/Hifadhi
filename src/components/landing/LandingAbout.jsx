/*
  Landing page section 4: About Hifadhi (id="about").

  Scroll-driven horizontal showcase of four perishable categories.
  - Desktop (wide and tall enough, motion allowed): the showcase is pinned
    with position: sticky inside a taller wrapper. The wrapper's extra
    height equals how far the panel track needs to travel sideways, so
    normal vertical scrolling through that height moves the track from
    right to left. When the last panel is in place the wrapper ends and
    the page scrolls on as usual. Nothing intercepts the mouse wheel.
  - The four categories are examples, not a full list. A typographic
    closing message ("And beyond.") ends the horizontal journey; it fades
    in as it slides into view, holds briefly, then the section releases.
  - When the closing message is prominently visible, a soft wave of light
    runs once through the letters of "And beyond." (left to right). It
    re-arms only after the message has left view, and is skipped entirely
    with prefers-reduced-motion.
  - Mobile, short windows and prefers-reduced-motion: panels simply stack
    vertically.
  Category text and photos live in src/data/landingCategoriesDemo.js.
*/
import { useCallback, useEffect, useRef, useState } from 'react';
import { aboutCategories as CATEGORIES } from '../../data/landingCategoriesDemo';

const HOLD_VH = 25; // extra scroll (vh) that keeps the closing message pinned before release
const END_TITLE = 'And beyond.';
const WAVE_ON = 0.9; // closing message this far into view starts the wave
const WAVE_REARM = 0.4; // below this the wave can run again on the next entry
const PIN_QUERY = '(min-width: 1024px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)';

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

/* "And beyond." split into letters; the space is not animated */
function WaveTitle({ phase }) {
  let index = 0;
  const words = END_TITLE.split(' ');
  return (
    <p className={`lp-hs-end-title${phase === 'armed' ? ' is-armed' : ''}${phase === 'waving' ? ' is-waving' : ''}`}>
      <span className="sr-only">{END_TITLE}</span>
      <span aria-hidden="true">
        {words.map((word, w) => (
          <span key={word}>
            {w > 0 && ' '}
            <span className="lp-wave-word">
              {[...word].map((ch) => {
                const i = index;
                index += 1;
                return (
                  <span key={i} className="lp-wave-letter" style={{ '--i': i }}>
                    {ch}
                  </span>
                );
              })}
            </span>
          </span>
        ))}
      </span>
    </p>
  );
}

function Panel({ c }) {
  return (
    <article className={`lp-cat${c.image ? '' : ' is-placeholder'}`} aria-labelledby={`lp-cat-${c.id}`}>
      {c.image ? (
        <img
          className="lp-cat-img"
          src={c.image}
          alt={c.imageAlt}
          style={c.imagePosition ? { objectPosition: c.imagePosition } : undefined}
          loading="lazy"
          draggable="false"
        />
      ) : (
        <div className="lp-cat-img lp-cat-img-empty" role="img" aria-label={`${c.name} photo to be added`}>
          <span>Photo to be added</span>
        </div>
      )}
      <div className="lp-cat-copy">
        <p className="lp-cat-num">{c.number}</p>
        <h3 id={`lp-cat-${c.id}`} className="lp-cat-name">
          {c.name}
        </h3>
        <p className="lp-cat-statement">{c.statement}</p>
        <p className="lp-cat-items">{c.items.join(' · ')}</p>
      </div>
    </article>
  );
}

export default function LandingAbout() {
  const pinned = useMedia(PIN_QUERY);
  const reducedMotion = useMedia('(prefers-reduced-motion: reduce)');
  const [wave, setWave] = useState('armed');
  const waveRef = useRef('armed');
  const setWavePhase = useCallback((next) => {
    if (waveRef.current === next) return;
    waveRef.current = next;
    setWave(next);
  }, []);
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const endRef = useRef(null);
  const closeRef = useRef(null);
  const [closeShown, setCloseShown] = useState(false);

  /* Closing block: fades up once when it scrolls into view */
  useEffect(() => {
    const el = closeRef.current;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduced || !('IntersectionObserver' in window)) {
      setCloseShown(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCloseShown(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [travel, setTravel] = useState(0);
  const [active, setActive] = useState(0);

  /* Measure how far the track must move sideways */
  useEffect(() => {
    if (!pinned) return undefined;
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setTravel(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    if (ro && trackRef.current) ro.observe(trackRef.current);
    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, [pinned]);

  /* Map vertical scroll inside the wrapper to horizontal movement */
  useEffect(() => {
    if (!pinned) {
      if (trackRef.current) trackRef.current.style.transform = '';
      endRef.current?.style.removeProperty('--reveal');
      return undefined;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      /* Horizontal travel uses the first part of the scroll; the rest is a short hold */
      const scrolled = -wrap.getBoundingClientRect().top;
      const progress = travel > 0 ? Math.min(1, Math.max(0, scrolled / travel)) : 0;
      track.style.transform = `translate3d(${-progress * travel}px, 0, 0)`;
      setActive(Math.min(CATEGORIES.length - 1, Math.round(progress * CATEGORIES.length)));
      const end = endRef.current;
      if (end) {
        const rect = end.getBoundingClientRect();
        const reveal = Math.min(1, Math.max(0, (window.innerWidth - rect.left) / (rect.width * 0.9)));
        end.style.setProperty('--reveal', reveal.toFixed(3));
        if (reveal >= WAVE_ON) setWavePhase('waving');
        else if (reveal < WAVE_REARM) setWavePhase('armed');
      }
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
  }, [pinned, travel, setWavePhase]);

  /* Stacked layout: start the wave when the closing message is well in view */
  useEffect(() => {
    if (pinned || reducedMotion || !('IntersectionObserver' in window)) return undefined;
    const el = endRef.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6) setWavePhase('waving');
        else if (!entry.isIntersecting) setWavePhase('armed');
      },
      { threshold: [0, 0.6] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pinned, reducedMotion, setWavePhase]);

  return (
    <section id="about" className={`lp-about${pinned ? ' is-pinned' : ''}`} aria-labelledby="lp-about-title">
      <div className="lp-container lp-about-inner">
        <header className="lp-about-head">
          <p className="lp-about-eyebrow">About Hifadhi</p>
          <h2 id="lp-about-title" className="lp-about-title">
            Designed for inventory that doesn&apos;t wait.
          </h2>
          <p className="lp-about-lead">
            Hifadhi is designed around the short shelf lives and time-sensitive decisions that come with managing
            perishable inventory.
          </p>
        </header>
      </div>

      <div
        ref={wrapRef}
        className="lp-hs"
        style={pinned ? { height: `calc(${100 + HOLD_VH}vh + ${travel}px)` } : undefined}
      >
        <div className="lp-hs-sticky">
          {pinned && (
            <p className="lp-hs-count" aria-hidden="true">
              {CATEGORIES[active].number} <span>/ {String(CATEGORIES.length).padStart(2, '0')}</span>
            </p>
          )}
          <div ref={trackRef} className="lp-hs-track">
            {CATEGORIES.map((c) => (
              <Panel key={c.id} c={c} />
            ))}
            <div ref={endRef} className="lp-hs-end">
              <WaveTitle phase={reducedMotion ? 'static' : wave} />
              <p className="lp-hs-end-text">
                Hifadhi is designed to support a wide range of perishable inventory, beyond the categories shown
                here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiet conclusion of the About story */}
      <div ref={closeRef} className={`lp-container lp-about-inner lp-about-close${closeShown ? ' is-shown' : ''}`}>
        <h3 className="lp-about-close-title">Built to support earlier decisions.</h3>
        <p className="lp-about-close-text">
          Hifadhi brings together inventory, expiry information and historical sales to help identify potential risk
          while there is still time to respond.
        </p>
      </div>
    </section>
  );
}
