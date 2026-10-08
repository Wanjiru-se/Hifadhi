/* Hifadhi logo: leaf mark, name and tagline */
export function LeafMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M34 4C18 4 7 13 7 25c0 3.4 1 6.4 2.6 8.8C12 22 19 15 27 11.5 19 17 13.5 24.5 11.6 35.6 13.6 36.5 15.8 37 18 37c11 0 18-9 18-21 0-4.4-.7-8.4-2-12Z"
        fill="var(--green-500)"
      />
      <path
        d="M27 11.5C19 17 13.5 24.5 11.6 35.6"
        fill="none"
        stroke="var(--green-900)"
        strokeOpacity="0.35"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/*
  Brand leaf used on light backgrounds (login and registration panel).
  Solid forest-green leaf with a light vein and a short stem.
  Colour follows `color` so it can be reused on other surfaces.
*/
export function BrandLeaf({ size = 72, color = 'var(--green-900)', veinColor = 'var(--cream-100)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <path
        d="M56 4C36 5 20 14 15.5 30c-2 7-.8 13.6 2.2 18.2C37 46 53 32 56 4Z"
        fill={color}
      />
      <path
        d="M17.7 48.2C24 38 31 29.5 42 19"
        fill="none"
        stroke={veinColor}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M17.7 48.2 12.5 59" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ variant = 'dark', stacked = false, showTagline = true }) {
  const classes = ['logo', variant === 'dark' ? 'on-dark' : 'on-light', stacked ? 'stacked' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <div className={classes}>
      <span className="logo-mark">
        {stacked ? <BrandLeaf /> : <LeafMark size={32} />}
        <span className="logo-name">Hifadhi</span>
      </span>
      {showTagline && (
        <span className="logo-tagline">
          Predict Demand.
          <br />
          Protect Stock.
          <br />
          Reduce Waste.
        </span>
      )}
    </div>
  );
}
