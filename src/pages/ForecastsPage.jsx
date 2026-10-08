import { useApp } from '../context/AppContext';
import { demandSeries, products } from '../data/demoData';
import { buildRiskRows } from '../utils/inventory';
import { RiskBadge } from '../components/ui/Badge';
import { ButtonLink } from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Placeholder from '../components/ui/Placeholder';
import DemandChart from '../components/charts/DemandChart';

export default function ForecastsPage() {
  const { batches } = useApp();
  const rows = buildRiskRows(products, batches);

  return (
    <div className="stack">
      <PageHeader title="Forecasts" description="Expected demand for each product before its stock expires." />

      <Card title="Demand forecast: Strawberry Yoghurt 500ml" subtitle="Last 7 days of sales and the next 7 days of forecast demand">
        <DemandChart data={demandSeries['strawberry-yoghurt-500ml']} />
      </Card>

      <Card title="Forecast summary" subtitle="Forecast demand covers the period until each product's earliest batch expires" flush>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col" className="num">Forecast Period</th>
                <th scope="col" className="num">Forecast Demand</th>
                <th scope="col" className="num">Current Stock</th>
                <th scope="col" className="num">Stock minus Demand</th>
                <th scope="col">Risk Level</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const gap = r.currentStock - r.forecastDemand;
                return (
                  <tr key={r.id}>
                    <td className="cell-title">{r.name}</td>
                    <td className="num">{r.daysToExpiry} days</td>
                    <td className="num">{r.forecastDemand}</td>
                    <td className="num">{r.currentStock}</td>
                    <td className={`num${gap > 0 ? ' text-strong' : ''}`}>{gap > 0 ? `+${gap}` : gap}</td>
                    <td><RiskBadge level={r.riskLevel} /></td>
                    <td><ButtonLink to={`/risk/${r.id}`} variant="secondary" size="sm">View</ButtonLink></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Placeholder icon="trending" title="Forecasting model not connected yet">
        These figures are demonstration values. The machine-learning forecast will be added in a later phase and will
        replace them automatically.
      </Placeholder>
    </div>
  );
}
