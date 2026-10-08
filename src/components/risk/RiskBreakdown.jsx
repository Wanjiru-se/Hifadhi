/*
  Explains how the at-risk estimate is reached:
  current stock - forecast demand before expiry = estimated at-risk stock,
  then at-risk stock x unit cost = estimated value at risk.
*/
import { formatKSh } from '../../utils/format';

export default function RiskBreakdown({ row }) {
  const sellable = Math.min(row.forecastDemand, row.currentStock);
  const sellPct = (sellable / row.currentStock) * 100;
  const riskPct = (row.atRiskUnits / row.currentStock) * 100;

  return (
    <div className="breakdown">
      <div className="equation" aria-label="Risk calculation">
        <div className="eq-term">
          <span className="eq-value">{row.currentStock}</span>
          <span className="eq-label">Current stock (units)</span>
        </div>
        <span className="eq-op" aria-hidden="true">−</span>
        <div className="eq-term">
          <span className="eq-value">{row.forecastDemand}</span>
          <span className="eq-label">Forecast demand in the next {row.daysToExpiry} days</span>
        </div>
        <span className="eq-op" aria-hidden="true">=</span>
        <div className="eq-term eq-risk">
          <span className="eq-value">{row.atRiskUnits}</span>
          <span className="eq-label">Estimated at-risk stock (units)</span>
        </div>
        <span className="eq-op" aria-hidden="true">×</span>
        <div className="eq-term">
          <span className="eq-value">{formatKSh(row.unitCost)}</span>
          <span className="eq-label">Unit cost</span>
        </div>
        <span className="eq-op" aria-hidden="true">=</span>
        <div className="eq-term eq-risk">
          <span className="eq-value">{formatKSh(row.valueAtRisk)}</span>
          <span className="eq-label">Estimated value at risk</span>
        </div>
      </div>

      <div className="stock-bar-block">
        <div className="stock-bar-head">
          <span className="text-strong">Stock outcome before expiry</span>
          <span className="text-muted">
            Shelf life remaining: <strong className="text-strong">{row.daysToExpiry} days</strong>
          </span>
        </div>
        <div className="stock-bar" role="img" aria-label={`${sellable} units expected to sell and ${row.atRiskUnits} units at risk out of ${row.currentStock}`}>
          <span className="stock-bar-sell" style={{ width: `${sellPct}%` }}>
            {sellable} expected to sell
          </span>
          {row.atRiskUnits > 0 && (
            <span className="stock-bar-risk" style={{ width: `${riskPct}%` }}>
              {row.atRiskUnits} at risk
            </span>
          )}
        </div>
        <div className="stock-bar-legend">
          <span><i className="swatch swatch-sell" /> Expected to sell ({Math.round(sellPct)}%)</span>
          <span><i className="swatch swatch-risk" /> At risk of expiring unsold ({Math.round(riskPct)}%)</span>
        </div>
      </div>
    </div>
  );
}
