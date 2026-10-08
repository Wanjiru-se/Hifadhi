/* Metric tile used on the dashboard. tone: default | high | medium */
import Icon from './Icon';

export default function StatCard({ icon, value, label, hint, tone = 'default' }) {
  return (
    <div className="card stat-card">
      <span className={`stat-icon tone-${tone}`}>
        <Icon name={icon} size={24} />
      </span>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
