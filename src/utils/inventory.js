/*
  Inventory and risk helpers.

  In this phase the forecast figures are demonstration values. The helpers
  below only combine them so every page shows the same numbers. The real
  forecasting and risk logic will replace these in a later phase.
*/
import { DEMO_TODAY, branches, demandSeries, otherBranchPositions } from '../data/demoData';
import { daysBetween, formatDate } from './format';

export const RISK_ORDER = { High: 0, Medium: 1, Low: 2 };

/* Share of stock that is at risk: 25% or more is High, 8% or more is Medium */
export const RISK_THRESHOLDS = { high: 0.25, medium: 0.08 };

/* Days-to-expiry window used for "Expiring soon" */
export const EXPIRING_SOON_DAYS = 7;

export function getRiskLevel(atRiskUnits, currentStock) {
  if (!currentStock || atRiskUnits <= 0) return 'Low';
  const share = atRiskUnits / currentStock;
  if (share >= RISK_THRESHOLDS.high) return 'High';
  if (share >= RISK_THRESHOLDS.medium) return 'Medium';
  return 'Low';
}

export function withDaysLeft(batch) {
  return { ...batch, daysLeft: daysBetween(DEMO_TODAY, batch.expiryDate) };
}

/* Sort batches First Expiry, First Out. Ties go to the oldest delivery. */
export function sortFefo(list) {
  return [...list].sort(
    (a, b) =>
      a.expiryDate.localeCompare(b.expiryDate) ||
      a.receivedDate.localeCompare(b.receivedDate),
  );
}

/* Combine a product with its batches into one risk summary row */
export function buildProductRisk(product, allBatches) {
  const productBatches = sortFefo(
    allBatches.filter((b) => b.productId === product.id).map(withDaysLeft),
  );
  const currentStock = productBatches.reduce((sum, b) => sum + b.quantity, 0);
  const atRiskUnits = productBatches.reduce((sum, b) => sum + b.atRiskUnits, 0);
  const daysToExpiry = productBatches.length ? productBatches[0].daysLeft : null;

  return {
    ...product,
    batches: productBatches,
    currentStock,
    atRiskUnits,
    daysToExpiry,
    valueAtRisk: atRiskUnits * product.unitCost,
    riskLevel: getRiskLevel(atRiskUnits, currentStock),
  };
}

export function buildRiskRows(products, allBatches) {
  return products
    .map((p) => buildProductRisk(p, allBatches))
    .filter((row) => row.currentStock > 0)
    .sort(
      (a, b) =>
        RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel] ||
        b.valueAtRisk - a.valueAtRisk,
    );
}

export function summariseRisk(rows) {
  const allBatches = rows.flatMap((r) => r.batches);
  return {
    valueAtRisk: rows.reduce((sum, r) => sum + r.valueAtRisk, 0),
    atRiskBatches: allBatches.filter((b) => b.atRiskUnits > 0).length,
    expiringSoon: rows.filter(
      (r) => r.daysToExpiry !== null && r.daysToExpiry <= EXPIRING_SOON_DAYS,
    ).length,
    highRisk: rows.filter((r) => r.riskLevel === 'High').length,
    mediumRisk: rows.filter((r) => r.riskLevel === 'Medium').length,
    lowRisk: rows.filter((r) => r.riskLevel === 'Low').length,
  };
}

/* Other branches that are short of this product (multi-branch only) */
export function getRedistributionOptions(productId) {
  const positions = otherBranchPositions[productId] || [];
  return positions
    .map((p) => ({
      ...p,
      branchName: branches.find((b) => b.id === p.branchId)?.name ?? p.branchId,
      shortfall: Math.max(0, p.forecastDemand - p.stock),
    }))
    .filter((p) => p.shortfall > 0);
}

/*
  Rule-based demo recommendations. Each has a type so the UI can pick an
  icon. Redistribution only appears when the business has several branches.
*/
export function buildRecommendations(row, { multiBranch }) {
  const recs = [];
  const first = row.batches[0];

  if (row.riskLevel === 'Low') {
    recs.push({
      type: 'monitor',
      title: 'No action needed',
      detail: 'Forecast demand covers current stock before expiry. Keep monitoring daily sales.',
    });
    return recs;
  }

  if (first) {
    recs.push({
      type: 'fefo',
      title: `Prioritise ${first.id} using FEFO`,
      detail: `Sell this batch first (expires ${formatDate(first.expiryDate)}). Move it to the front of the shelf.`,
    });
  }

  recs.push({
    type: 'promotion',
    title: 'Consider a promotion or markdown',
    detail: `About ${row.atRiskUnits} units may remain unsold before expiry. A short promotion could move them.`,
  });

  if (multiBranch) {
    const options = getRedistributionOptions(row.id);
    if (options.length) {
      const best = options.sort((a, b) => b.shortfall - a.shortfall)[0];
      const units = Math.min(best.shortfall, row.atRiskUnits);
      recs.push({
        type: 'redistribute',
        title: 'Check other branches for redistribution',
        detail: `${best.branchName} is forecast to be short by ${best.shortfall} units. Transferring up to ${units} units could reduce waste.`,
      });
    }
  }

  return recs;
}

/*
  Daily sales and forecast series for the demand chart.
  Returns null when a product has no time-series demo data.
*/
export function getDemandSeries(row) {
  return demandSeries[row.id] ?? null;
}
