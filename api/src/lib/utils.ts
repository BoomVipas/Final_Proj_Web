/**
 * Shared utility functions — used across multiple route files.
 * Keep this pure (no DB, no side effects).
 */

export type StockAlertLevel = 'normal' | 'warning' | 'critical';

export type StockRow = {
  medication_id: string;
  quantity: number | string | null;
  threshold_warn: number | null;
  threshold_critical: number | null;
  daily_consumption: number | string | null;
};

export type StockAlert = {
  level: StockAlertLevel;
  daysRemaining: number | null;
};

// ── Numbers ────────────────────────────────────────────────────────────────

export const toNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// ── Week helpers ───────────────────────────────────────────────────────────

/**
 * Returns the ISO date string (YYYY-MM-DD) for the Monday of the current week.
 * Week is defined as Monday–Sunday (ISO 8601).
 */
export const getWeekStartIso = (date = new Date()): string => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay(); // 0=Sun, 1=Mon … 6=Sat
  const offset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + offset);
  return copy.toISOString().slice(0, 10);
};

// ── Stock alert ────────────────────────────────────────────────────────────

export const calcStockAlert = (row: StockRow | null | undefined): StockAlert => {
  if (!row) return { level: 'warning', daysRemaining: null };

  const quantity = toNumber(row.quantity, 0);
  const dailyConsumption = toNumber(row.daily_consumption, 0);
  const warn = toNumber(row.threshold_warn, 14);
  const critical = toNumber(row.threshold_critical, 7);

  if (dailyConsumption <= 0) {
    return { level: quantity <= 0 ? 'critical' : 'normal', daysRemaining: null };
  }

  const daysRemaining = quantity / dailyConsumption;

  if (daysRemaining <= critical) return { level: 'critical', daysRemaining };
  if (daysRemaining <= warn) return { level: 'warning', daysRemaining };
  return { level: 'normal', daysRemaining };
};

export const pickHighestAlert = (levels: StockAlertLevel[]): StockAlertLevel => {
  if (levels.includes('critical')) return 'critical';
  if (levels.includes('warning')) return 'warning';
  return 'normal';
};

// ── Meal ordering ──────────────────────────────────────────────────────────

export const MEAL_ORDER = [
  'before_breakfast',
  'after_breakfast',
  'after_dinner',
  'bedtime',
] as const;

export const MEAL_LABELS: Record<string, string> = {
  before_breakfast: 'ก่อนอาหารเช้า',
  after_breakfast: 'หลังอาหารเช้า',
  after_dinner: 'หลังอาหารเย็น',
  bedtime: 'ก่อนนอน',
};
