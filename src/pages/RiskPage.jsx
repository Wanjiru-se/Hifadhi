import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { products } from '../data/demoData';
import { formatKSh } from '../utils/format';
import { buildRecommendations, buildRiskRows, RISK_THRESHOLDS, summariseRisk } from '../utils/inventory';
import Alert from '../components/ui/Alert';
import { RiskBadge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import SegmentedControl from '../components/ui/SegmentedControl';
import RecommendationList from '../components/risk/RecommendationList';
import RiskTable from '../components/risk/RiskTable';

export default function RiskPage() {
  const { batches, isMultiBranch } = useApp();
  const [level, setLevel] = useState('All');
  const rows = buildRiskRows(products, batches);
  const summary = summariseRisk(rows);
  const priorityRows = rows.filter((r) => r.riskLevel !== 'Low').slice(0, 3);
  const filtered = level === 'All' ? rows : rows.filter((r) => r.riskLevel === level);

  const filterOptions = [
    { value: 'All', label: `All (${rows.length})` },
    { value: 'High', label: `High (${summary.highRisk})` },
    { value: 'Medium', label: `Medium (${summary.mediumRisk})` },
    { value: 'Low', label: `Low (${summary.lowRisk})` },
  ];

  return (
    <div className="stack">
      <PageHeader
        title="Risk & Recommendations"
        description="Products likely to expire before they sell, and what you can do about it."
        meta={
          <>
            Total estimated value at risk: <strong className="text-danger">{formatKSh(summary.valueAtRisk)}</strong>
          </>
        }
      />

      <Alert tone="info">
        Risk level is based on the share of stock expected to remain unsold at expiry: <strong>High</strong> is{' '}
        {RISK_THRESHOLDS.high * 100}% or more, <strong>Medium</strong> is {RISK_THRESHOLDS.medium * 100}% to{' '}
        {RISK_THRESHOLDS.high * 100 - 1}%, <strong>Low</strong> is below {RISK_THRESHOLDS.medium * 100}%.
      </Alert>

      <section aria-labelledby="priority-heading" className="stack" style={{ gap: 'var(--sp-4)' }}>
        <h2 id="priority-heading">Priority actions</h2>
        <div className={priorityRows.length >= 3 ? 'grid-3' : 'grid-2'}>
          {priorityRows.map((r) => (
            <Card
              key={r.id}
              title={r.name}
              subtitle={`${r.atRiskUnits} units at risk · ${formatKSh(r.valueAtRisk)}`}
              action={<RiskBadge level={r.riskLevel} />}
            >
              <RecommendationList items={buildRecommendations(r, { multiBranch: isMultiBranch }).slice(0, 2)} />
              <div style={{ marginTop: 'var(--sp-4)' }}>
                <ButtonLink to={`/risk/${r.id}`} variant="secondary" block iconRight="arrowRight">
                  View Risk Details
                </ButtonLink>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Card
        title="All products by risk"
        flush
        action={<SegmentedControl options={filterOptions} value={level} onChange={setLevel} label="Filter by risk level" />}
      >
        <RiskTable rows={filtered} showCategory />
      </Card>
    </div>
  );
}
