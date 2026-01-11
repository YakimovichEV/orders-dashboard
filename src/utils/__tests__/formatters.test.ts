import { describe, expect, it } from 'vitest';

import { formatCurrency, formatDate, formatRelativeTime } from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('formats currency with default USD', () => {
      expect(formatCurrency(999.99)).toBe('$999.99');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });

    it('handles large numbers', () => {
      expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
    });
  });

  describe('formatDate', () => {
    it('formats date in short format', () => {
      const date = '2024-01-15T10:30:00.000Z';
      const result = formatDate(date, 'short');
      expect(result).toMatch(/Jan 1[45], 2024/);
    });

    it('formats date in long format', () => {
      const date = '2024-01-15T10:30:00.000Z';
      const result = formatDate(date, 'long');
      expect(result).toContain('2024');
      expect(result).toMatch(/January|Jan/);
    });

    it('uses short format by default', () => {
      const date = '2024-01-15T10:30:00.000Z';
      const result = formatDate(date);
      expect(result).toMatch(/Jan 1[45], 2024/);
    });
  });

  describe('formatRelativeTime', () => {
    it('returns "just now" for very recent dates', () => {
      const now = new Date();
      const result = formatRelativeTime(now.toISOString());
      expect(result).toBe('just now');
    });

    it('returns minutes ago for recent dates', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toBe('5 minutes ago');
    });

    it('returns hours ago for dates within a day', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toBe('3 hours ago');
    });

    it('returns days ago for dates within a month', () => {
      const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(date.toISOString());
      expect(result).toBe('5 days ago');
    });

    it('handles singular forms correctly', () => {
      const dateMinute = new Date(Date.now() - 1 * 60 * 1000);
      expect(formatRelativeTime(dateMinute.toISOString())).toBe('1 minute ago');

      const dateHour = new Date(Date.now() - 1 * 60 * 60 * 1000);
      expect(formatRelativeTime(dateHour.toISOString())).toBe('1 hour ago');

      const dateDay = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      expect(formatRelativeTime(dateDay.toISOString())).toBe('1 day ago');
    });
  });
});
