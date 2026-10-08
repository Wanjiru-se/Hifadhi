import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { products } from '../data/demoData';
import { formatDate, formatKSh } from '../utils/format';
import {
  buildProductRisk,
  buildRecommendations,
  getDemandSeries,
  getRedistributionOptions,
} from '../utils/inventory';
import Alert from '../components/ui/Alert';
import { RiskBadge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/ui/Icon';
import Placeholder from '../components/ui/Placeholder';
import Tabs from '../components/ui/Tabs';
import DemandChart from '../components/charts/DemandChart';
import BatchTable from '../components/risk/BatchTable';
import RecommendationList from '../components/risk/RecommendationList';
import RiskBreakdown from '../components/risk/RiskBreakdown';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'batches', label: 'Inventory Batches' },
  { id: 'recommendations', label: 'Recommendations' },
];

function KeyInformation({ row }) {
  const items = [
    ['Current stock', `${row.currentStock} units`],
    ['Days to expiry (earliest batch)', `${row.daysToExpiry} days`],
    ['Forecast demand before expiry', `${row.forecastDemand} units`],
    ['Estimated at-risk stock', `${row.atRiskUnits} units`, true],
    ['Unit cost', formatKSh(row.unitCost)],
    ['Estimated value at risk', formatKSh(row.valueAtRisk), true],
  ];
  return (
    <Card title="Key information">
      <dl className="kv-list" style={{ margin: 0 }}>
        {items.map(([label, value, danger]) => (
          <div className="kv-row" key={label}>
            <dt>{label}</dt>
            <dd className={danger && row.atRiskUnits > 0 ? 'text-danger' : ''}>{value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function ForecastCard({ row }) {
  const series = getDemandSeries(row);
  return (
    <Card title="Demand forecast" subtitle={`Forecast total: ${row.forecastDemand} units before expiry`}>
      {series ? (
        <DemandChart data={series} />
      ) : (
        <Placeholder icon="trending" title="No daily chart data yet">
          This demo only includes daily sales history for Strawberry Yoghurt 500ml. The forecast total above is
          still used in the risk estimate.
        </Placeholder>
      )}
    </Card>
  );
}

function BatchesCard({ row }) {
  return (
    <Card
      title="Inventory batches (FEFO)"
      subtitle="First Expiry, First Out: the batch at the top should be sold first"
      flush
      action={
        <ButtonLink to="/inventory/add-batch" variant="secondary" size="sm" icon="plus">
          Add Batch
        </ButtonLink>
      }
    >
      <BatchTable batches={row.batches} />
    </Card>
  );
}

function RedistributionTable({ productId }) {
  const options = getRedistributionOptions(productId);
  if (!options.length) {
    return <p className="text-muted" style={{ padding: 'var(--sp-5)' }}>No other branch is currently short of this product.</p>;
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Branch</th>
            <th scope="col" className="num">Stock</th>
            <th scope="col" className="num">Forecast Demand</th>
            <th scope="col" className="num">Shortfall</th>
          </tr>
        </thead>
        <tbody>
          {options.map((o) => (
            <tr key={o.branchId}>
              <td className="cell-title">{o.branchName}</td>
              <td className="num">{o.stock}</td>
              <td className="num">{o.forecastDemand}</td>
              <td className="num text-strong">{o.shortfall}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OtherBranchesCard({ productId }) {
  return (
    <Card title="Other branches" subtitle="Branches forecast to need more of this product" flush>
      <RedistributionTable productId={productId} />
    </Card>
  );
}

function RecommendationsCard({ row, isMultiBranch }) {
  return (
    <Card title="Recommended actions" subtitle="Decision support. You make the final decision." className="panel-warm">
      <RecommendationList items={buildRecommendations(row, { multiBranch: isMultiBranch })} />
      {!isMultiBranch && row.riskLevel !== 'Low' && (
        <p className="field-hint" style={{ marginTop: 'var(--sp-4)' }}>
          Redistribution suggestions appear when your business has more than one branch.
        </p>
      )}
    </Card>
  );
}

export default function ProductRiskDetailsPage() {
  const { productId } = useParams();
  const { batches, isMultiBranch, selectedBranch } = useApp();
  const [tab, setTab] = useState('overview');
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <Placeholder
        icon="package"
        title="Product not found"
        action={
          <ButtonLink to="/risk" variant="secondary" icon="arrowLeft">
            Back to Risk & Recommendations
          </ButtonLink>
        }
      >
        We could not find that product. It may have been removed.
      </Placeholder>
    );
  }

  const row = buildProductRisk(product, batches);
  const showRedistribution = isMultiBranch && row.riskLevel !== 'Low';

  return (
    <div className="stack">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link to="/risk">Risk & Recommendations</Link>
        <Icon name="chevronRight" size={14} />
        <span>Product Details</span>
      </nav>

      <div className="card">
        <div className="product-header">
          <div className="product-id">
            <span className="product-thumb">
              <Icon name="package" size={28} />
            </span>
            <div>
              <h1 style={{ fontSize: 'var(--fs-xl)' }}>{row.name}</h1>
              <div className="product-meta">
                <span>SKU: {row.sku}</span>
                <span>{row.category}</span>
                <span>{selectedBranch.name} Branch</span>
              </div>
            </div>
          </div>
          <RiskBadge level={row.riskLevel} size="lg" withIcon suffix=" Risk" />
        </div>
        <div style={{ padding: '0 var(--sp-5)' }}>
          <Tabs tabs={TABS} active={tab} onChange={setTab} label="Product risk sections" />
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <Card title="How the risk is estimated" subtitle="Current stock compared with the demand expected before the stock expires">
            <RiskBreakdown row={row} />
          </Card>
          <div className="grid-2">
            <KeyInformation row={row} />
            <ForecastCard row={row} />
          </div>
          <BatchesCard row={row} />
          <div className={showRedistribution ? 'grid-2' : undefined}>
            <RecommendationsCard row={row} isMultiBranch={isMultiBranch} />
            {showRedistribution && <OtherBranchesCard productId={row.id} />}
          </div>
        </>
      )}

      {tab === 'forecast' && (
        <>
          <ForecastCard row={row} />
          <Alert tone="info">
            Forecast values are demonstration data for this interface phase. The forecasting model will be connected
            later.
          </Alert>
        </>
      )}

      {tab === 'batches' && (
        <>
          <BatchesCard row={row} />
          <p className="text-muted">
            Earliest expiry: <strong className="text-strong">{formatDate(row.batches[0].expiryDate)}</strong>. Batches
            with the same expiry date are ordered by the date received.
          </p>
        </>
      )}

      {tab === 'recommendations' && (
        <div className="grid-2">
          <RecommendationsCard row={row} isMultiBranch={isMultiBranch} />
          {showRedistribution && <OtherBranchesCard productId={row.id} />}
        </div>
      )}
    </div>
  );
}
