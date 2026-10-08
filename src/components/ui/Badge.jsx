/*
  RiskBadge always shows a text label (High, Medium, Low) as well as colour,
  so risk is never communicated by colour alone.
*/
import Icon from './Icon';

export function RiskBadge({ level, size, withIcon = false, suffix = '' }) {
  const key = level.toLowerCase();
  return (
    <span className={`badge badge-${key}${size === 'lg' ? ' badge-lg' : ''}`}>
      {withIcon ? <Icon name="alert" size={16} /> : <span className="badge-dot" aria-hidden="true" />}
      {level}
      {suffix}
    </span>
  );
}

const STATUS_CLASS = {
  Active: 'badge-active',
  Invited: 'badge-info',
  Inactive: 'badge-neutral',
};

export function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_CLASS[status] ?? 'badge-neutral'}`}>{status}</span>;
}
