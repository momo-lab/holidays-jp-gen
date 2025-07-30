import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { holidays, isHoliday, getHolidayName } from './holidays-jp';

describe('Holiday Utilities', () => {
  // holidays-jp.tsが事前に生成されていることを確認
  beforeAll(() => {
    const filePath = path.resolve(__dirname, 'holidays-jp.ts');
    expect(fs.existsSync(filePath), 'test/holidays-jp.ts does not exist. Run `pnpm test:gen` first.').toBe(true);
  });

  describe('isHoliday', () => {
    it('should return true for a known holiday', () => {
      // 2024年の元日
      expect(isHoliday('2024-01-01')).toBe(true);
      expect(isHoliday(new Date(2024, 0, 1))).toBe(true);
    });

    it('should return false for a non-holiday', () => {
      expect(isHoliday('2024-01-02')).toBe(false);
      expect(isHoliday(new Date(2024, 0, 2))).toBe(false);
    });

    it('should return false for an invalid date string', () => {
      expect(isHoliday('invalid-date')).toBe(false);
    });
  });

  describe('getHolidayName', () => {
    it('should return the name of a known holiday', () => {
      expect(getHolidayName('2024-01-01')).toBe('元日');
      expect(getHolidayName(new Date(2024, 0, 1))).toBe('元日');
    });

    it('should return null for a non-holiday', () => {
      expect(getHolidayName('2024-01-02')).toBe(null);
      expect(getHolidayName(new Date(2024, 0, 2))).toBe(null);
    });

    it('should return null for an invalid date string', () => {
      expect(getHolidayName('invalid-date')).toBe(null);
    });
  });

  describe('holidays object', () => {
    it('should contain known holidays', () => {
      expect(holidays['2024-02-11']).toBe('建国記念の日');
      expect(holidays['2024-05-03']).toBe('憲法記念日');
    });

    it('should not contain non-holidays', () => {
      expect(holidays['2024-01-02']).toBeUndefined();
    });
  });
});