/*
  Sales and inventory processing (Week 3 to 4).

  Stock lives on the inventory batches (batch.quantity = units remaining).
  A sale takes units from its product's batches First Expiry, First Out
  (FEFO) and remembers exactly where they came from:
    sale.allocations = [{ batchId, units }, ...]
  Deleting a sale returns those units to the same batches. Editing a sale
  first returns the old allocation, then takes the new quantity again with
  FEFO. Because stock always goes back to where it came from, repeated
  add, edit and delete operations cannot drift.

  Opening sales records (the demo history) have no allocations: they are
  already reflected in the opening batch quantities, so they never move
  stock.
*/
import { sortFefo } from './inventory';

/* Units currently available for a product across its batches */
export function availableUnits(batches, productId) {
  return batches.filter((b) => b.productId === productId).reduce((sum, b) => sum + b.quantity, 0);
}

/* Units a sale holds from a product (0 for opening records) */
export function heldUnits(sale, productId) {
  if (!sale?.allocations || sale.productId !== productId) return 0;
  return sale.allocations.reduce((sum, a) => sum + a.units, 0);
}

/* Take units from a product's batches, earliest expiry first */
export function allocateFefo(batches, productId, units) {
  const order = sortFefo(batches.filter((b) => b.productId === productId && b.quantity > 0));
  const taken = new Map();
  let left = units;
  for (const b of order) {
    if (left <= 0) break;
    const take = Math.min(b.quantity, left);
    taken.set(b.id, take);
    left -= take;
  }
  return {
    batches: batches.map((b) => (taken.has(b.id) ? { ...b, quantity: b.quantity - taken.get(b.id) } : b)),
    allocations: [...taken].map(([batchId, n]) => ({ batchId, units: n })),
    shortfall: left,
  };
}

/* Give a sale's units back to the batches they came from */
export function returnAllocations(batches, allocations = []) {
  if (!allocations.length) return batches;
  const back = new Map(allocations.map((a) => [a.batchId, a.units]));
  return batches.map((b) => (back.has(b.id) ? { ...b, quantity: b.quantity + back.get(b.id) } : b));
}
