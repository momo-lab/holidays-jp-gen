import iconv from 'iconv-lite';
import { describe, expect, it } from 'vitest';
import { filterAndFormat, parseCsv } from '../src/core';

describe('cli.ts business logic', () => {
  describe('parseCsv', () => {
    it('should parse Shift_JIS CSV buffer correctly', () => {
      const header = '国民の祝日・休日月日,国民の祝日・休日名称';
      const line1 = '2024/1/1,元日';
      const line2 = '2024/1/8,成人の日';
      const csvString = `${header}\n${line1}\n${line2}`;
      const buffer = iconv.encode(csvString, 'Shift_JIS');
      const result = parseCsv(buffer);
      expect(result).toEqual([
        { date: '2024/1/1', name: '元日' },
        { date: '2024/1/8', name: '成人の日' },
      ]);
    });
  });

  describe('filterAndFormat', () => {
    it('should filter holidays from the specified year and format them', () => {
      const holidays = [
        { date: '2023/12/23', name: '上皇誕生日' },
        { date: '2024/1/1', name: '元日' },
        { date: '2024/2/11', name: '建国記念の日' },
        { date: '2025/3/20', name: '春分の日' },
      ];
      const result = filterAndFormat(holidays, 2024);
      expect(result).toEqual([
        '"2024-01-01": "元日",',
        '"2024-02-11": "建国記念の日",',
        '"2025-03-20": "春分の日",',
      ]);
    });

    it('should return an empty array if no holidays match the year', () => {
      const holidays = [
        { date: '2022/1/1', name: '元日' },
        { date: '2023/1/1', name: '元日' },
      ];
      const result = filterAndFormat(holidays, 2024);
      expect(result).toEqual([]);
    });
  });
});
