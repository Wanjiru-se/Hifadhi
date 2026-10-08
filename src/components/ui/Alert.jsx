/* Inline message. tone: success | info | warning */
import Icon from './Icon';

const ICON_FOR = { success: 'checkCircle', info: 'info', warning: 'alert' };

export default function Alert({ tone = 'info', children }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'warning' ? 'alert' : 'status'}>
      <Icon name={ICON_FOR[tone]} size={18} />
      <div>{children}</div>
    </div>
  );
}
