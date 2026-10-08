/* Card container with optional header (title, subtitle, action) */
export default function Card({ title, subtitle, action, flush = false, className = '', children }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || action) && (
        <header className="card-header">
          <div>
            {title && <h2>{title}</h2>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={`card-body${flush ? ' flush' : ''}`}>{children}</div>
    </section>
  );
}
