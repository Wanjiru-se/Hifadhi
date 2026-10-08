/*
  "Inventory Requiring Attention" table used on the Dashboard and the
  Risk & Recommendations page. rows come from buildRiskRows().
*/
import { useNavigate } from 'react-router-dom';
import { formatKSh } from '../../utils/format';
import { RiskBadge } from '../ui/Badge';
import { ButtonLink } from '../ui/Button';

export default function RiskTable({ rows, showValue = true, showCategory = false }) {
  const navigate = useNavigate();

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col" className="num">Current Stock</th>
            <th scope="col" className="num">Days to Expiry</th>
            <th scope="col" className="num">Forecast Demand</th>
            <th scope="col" className="num">Est. Units at Risk</th>
            {showValue && <th scope="col" className="num">Value at Risk</th>}
            <th scope="col">Risk Level</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onDoubleClick={() => navigate(`/risk/${row.id}`)}>
              <td>
                <span className="cell-title">{row.name}</span>
                {showCategory && <span className="cell-sub">{row.category} · {row.sku}</span>}
              </td>
              <td className="num">{row.currentStock}</td>
              <td className={`num${row.daysToExpiry <= 3 ? ' text-danger' : ''}`}>
                {row.daysToExpiry} {row.daysToExpiry === 1 ? 'day' : 'days'}
              </td>
              <td className="num">{row.forecastDemand}</td>
              <td className={`num${row.atRiskUnits > 0 ? ' text-strong' : ''}`}>{row.atRiskUnits}</td>
              {showValue && <td className="num">{formatKSh(row.valueAtRisk)}</td>}
              <td>
                <RiskBadge level={row.riskLevel} />
              </td>
              <td>
                <ButtonLink to={`/risk/${row.id}`} variant="secondary" size="sm" aria-label={`View risk details for ${row.name}`}>
                  View
                </ButtonLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
