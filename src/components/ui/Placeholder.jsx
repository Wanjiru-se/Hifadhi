/* Clean placeholder for features planned in a later phase */
import Icon from './Icon';

export default function Placeholder({ icon = 'info', title, children, action }) {
  return (
    <div className="placeholder">
      <span className="placeholder-icon">
        <Icon name={icon} size={26} />
      </span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
