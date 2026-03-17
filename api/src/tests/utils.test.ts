import { describe, it, expect } from 'bun:test';
import {
  toNumber,
  getWeekStartIso,
  calcStockAlert,
  pickHighestAlert,
} from '../lib/utils';

// ── toNumber ───────────────────────────────────────────────────────────────

describe('toNumber', () => {
  it('converts numeric string', () => {
    expect(toNumber('42')).toBe(42);
  });

  it('converts float', () => {
    expect(toNumber(3.14)).toBeCloseTo(3.14);
  });

  it('returns fallback for null', () => {
    expect(toNumber(null, 99)).toBe(99);
  });

  it('returns fallback for undefined', () => {
    expect(toNumber(undefined, 5)).toBe(5);
  });

  it('returns fallback for NaN string', () => {
    expect(toNumber('abc', 0)).toBe(0);
  });

  it('returns fallback for empty string', () => {
    expect(toNumber('', 7)).toBe(7);
  });

  it('default fallback is 0', () => {
    expect(toNumber(null)).toBe(0);
  });
});

// ── getWeekStartIso ────────────────────────────────────────────────────────

describe('getWeekStartIso', () => {
  it('returns a Monday for a Wednesday input', () => {
    // 2026-03-18 is a Wednesday
    const wed = new Date('2026-03-18T10:00:00Z');
    const result = getWeekStartIso(wed);
    // Monday of that week = 2026-03-16
    expect(result).toBe('2026-03-16');
  });

  it('returns the same Monday for a Monday input', () => {
    const mon = new Date('2026-03-16T00:00:00Z');
    expect(getWeekStartIso(mon)).toBe('2026-03-16');
  });

  it('returns the previous Monday for a Sunday input', () => {
    // 2026-03-22 is a Sunday
    const sun = new Date('2026-03-22T00:00:00Z');
    const result = getWeekStartIso(sun);
    // Previous Monday = 2026-03-16
    expect(result).toBe('2026-03-16');
  });

  it('returns format YYYY-MM-DD', () => {
    const result = getWeekStartIso(new Date('2026-01-07T00:00:00Z'));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ── calcStockAlert ─────────────────────────────────────────────────────────

describe('calcStockAlert', () => {
  const base = {
    medication_id: 'test',
    threshold_warn: 14,
    threshold_critical: 7,
  };

  it('returns critical when days remaining <= 7', () => {
    const result = calcStockAlert({ ...base, quantity: 5, daily_consumption: 1 });
    expect(result.level).toBe('critical');
    expect(result.daysRemaining).toBe(5);
  });

  it('returns warning when days remaining <= 14 but > 7', () => {
    const result = calcStockAlert({ ...base, quantity: 10, daily_consumption: 1 });
    expect(result.level).toBe('warning');
    expect(result.daysRemaining).toBe(10);
  });

  it('returns normal when days remaining > 14', () => {
    const result = calcStockAlert({ ...base, quantity: 100, daily_consumption: 1 });
    expect(result.level).toBe('normal');
    expect(result.daysRemaining).toBe(100);
  });

  it('returns warning when row is null (unknown stock)', () => {
    expect(calcStockAlert(null).level).toBe('warning');
  });

  it('returns critical when quantity is 0 and no daily consumption', () => {
    const result = calcStockAlert({ ...base, quantity: 0, daily_consumption: 0 });
    expect(result.level).toBe('critical');
    expect(result.daysRemaining).toBeNull();
  });

  it('returns normal when quantity > 0 but no daily consumption tracked', () => {
    const result = calcStockAlert({ ...base, quantity: 50, daily_consumption: 0 });
    expect(result.level).toBe('normal');
    expect(result.daysRemaining).toBeNull();
  });

  it('handles exactly at critical threshold', () => {
    const result = calcStockAlert({ ...base, quantity: 7, daily_consumption: 1 });
    expect(result.level).toBe('critical');
  });

  it('handles exactly at warning threshold', () => {
    const result = calcStockAlert({ ...base, quantity: 14, daily_consumption: 1 });
    expect(result.level).toBe('warning');
  });

  it('handles fractional daily consumption', () => {
    // 10 tablets / 0.5 per day = 20 days → normal
    const result = calcStockAlert({ ...base, quantity: 10, daily_consumption: 0.5 });
    expect(result.level).toBe('normal');
    expect(result.daysRemaining).toBe(20);
  });

  it('handles string quantity/consumption (DB numeric type)', () => {
    const result = calcStockAlert({ ...base, quantity: '5', daily_consumption: '1' });
    expect(result.level).toBe('critical');
  });
});

// ── pickHighestAlert ───────────────────────────────────────────────────────

describe('pickHighestAlert', () => {
  it('returns critical if any is critical', () => {
    expect(pickHighestAlert(['normal', 'warning', 'critical'])).toBe('critical');
  });

  it('returns warning if any is warning but no critical', () => {
    expect(pickHighestAlert(['normal', 'warning', 'normal'])).toBe('warning');
  });

  it('returns normal if all are normal', () => {
    expect(pickHighestAlert(['normal', 'normal'])).toBe('normal');
  });

  it('returns normal for empty array', () => {
    expect(pickHighestAlert([])).toBe('normal');
  });

  it('returns critical over warning', () => {
    expect(pickHighestAlert(['critical', 'warning'])).toBe('critical');
  });
});
