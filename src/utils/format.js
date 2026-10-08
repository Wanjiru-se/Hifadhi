/* Formatting helpers used across the interface */

const kshFormatter = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 });

const kshCentsFormatter = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Whole shillings show no decimals; amounts with cents (e.g. 118.50) show two */
export function formatKSh(value) {
  const formatter = Number.isInteger(Math.round(value * 100) / 100) ? kshFormatter : kshCentsFormatter;
  return `KSh ${formatter.format(value)}`;
}

export function formatNumber(value) {
  return kshFormatter.format(value);
}

/* '2026-09-30' -> '30/09/2026' */
export function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

/* '2026-09-23' -> 'Wednesday, 23 September 2026' */
export function formatLongDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* '2026-09-23' -> '23 Sep' */
export function formatShortDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function daysBetween(fromIso, toIso) {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  return Math.round((to - from) / 86400000);
}

/* Add days to an ISO date string. Uses UTC so time zones cannot shift the date. */
export function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
