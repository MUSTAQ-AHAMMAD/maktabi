// Shared formatting helpers (SAR-first, locale-aware).

const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

export const num = (v: unknown): number => (v == null ? 0 : Number(v));

export const money = (v: unknown, currency = 'SAR'): string =>
  `${currency} ${num(v).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export const moneyCompact = (v: unknown, currency = 'SAR'): string => `${currency} ${compact.format(num(v))}`;

export const formatDate = (v?: string | Date | null, locale = 'en'): string => {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
