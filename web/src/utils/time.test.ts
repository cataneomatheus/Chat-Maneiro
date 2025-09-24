import { describe, expect, it } from 'vitest';
import { formatTimestamp } from './time';

describe('formatTimestamp', () => {
  it('formats Date input to HH:mm', () => {
    const date = new Date(2024, 0, 1, 9, 5);
    expect(formatTimestamp(date)).toBe('09:05');
  });

  it('formats string input to HH:mm', () => {
    expect(formatTimestamp('2024-05-15T14:45:00')).toBe('14:45');
  });

  it('throws for invalid date', () => {
    expect(() => formatTimestamp('not-a-date')).toThrow('Invalid date value provided');
  });
});
