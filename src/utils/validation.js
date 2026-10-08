/*
  Form validation helpers (Week 3 to 4: empty fields, format, length,
  numeric ranges and dates). Each helper returns an error message, or ''
  when the value is valid, so forms can show a message under each field.
*/

/* Empty or whitespace-only values count as empty */
export function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

export function required(value, label) {
  return isEmpty(value) ? `${label} is required.` : '';
}

export function textLength(value, label, { min = 0, max = Infinity } = {}) {
  const length = String(value ?? '').trim().length;
  if (length < min) return `${label} must be at least ${min} characters.`;
  if (length > max) return `${label} must be ${max} characters or fewer.`;
  return '';
}

export function matches(value, pattern, message) {
  return pattern.test(String(value ?? '').trim()) ? '' : message;
}

/* Whole numbers only, within a range */
export function wholeNumber(value, label, { min = 0, max = Infinity } = {}) {
  const text = String(value ?? '').trim();
  if (!/^\d+$/.test(text)) return `${label} must be a whole number.`;
  const n = Number(text);
  if (n < min) return `${label} must be at least ${min}.`;
  if (n > max) return `${label} must be no more than ${max.toLocaleString('en-KE')}.`;
  return '';
}

/* Money: positive number with up to two decimal places */
export function money(value, label, { min = 0.01, max = 1000000 } = {}) {
  const text = String(value ?? '').trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return `${label} must be a number with up to 2 decimal places.`;
  const n = Number(text);
  if (n < min) return `${label} must be greater than 0.`;
  if (n > max) return `${label} must be no more than KSh ${max.toLocaleString('en-KE')}.`;
  return '';
}

/* ISO date (YYYY-MM-DD) that is a real calendar date */
export function validDate(value, label) {
  const text = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${label} must be a valid date.`;
  const d = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== text) return `${label} must be a valid date.`;
  return '';
}

/* Runs checks in order and returns the first message */
export function firstError(...checks) {
  return checks.find((message) => message) || '';
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
