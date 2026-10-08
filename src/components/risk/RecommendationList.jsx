/* List of decision-support recommendations with an icon per type */
import Icon from '../ui/Icon';

const ICON_FOR = {
  fefo: 'layers',
  promotion: 'tag',
  redistribute: 'truck',
  monitor: 'checkCircle',
};

export default function RecommendationList({ items }) {
  return (
    <ul className="rec-list">
      {items.map((rec) => (
        <li key={rec.type} className={`rec-item rec-${rec.type}`}>
          <span className="rec-icon">
            <Icon name={ICON_FOR[rec.type]} size={20} />
          </span>
          <div>
            <p className="rec-title">{rec.title}</p>
            <p className="rec-detail">{rec.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
