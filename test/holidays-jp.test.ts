import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { beforeAll, describe, expect, it } from 'vitest';
import { filterAndFormat, generateTs, parseCsv } from '../src/core';

const HOLIDAYS_JP_PATH = path.resolve(os.tmpdir(), 'holidays-jp.ts');
const FIXTURES_CSV_PATH = path.resolve(__dirname, 'fixtures/syukujitsu.csv');

async function writeIfChanged(filePath: string, content: string) {
  try {
    const existing = await fs.readFile(filePath, 'utf-8');
    const hashOld = crypto.createHash('md5').update(existing).digest('hex');
    const hashNew = crypto.createHash('md5').update(content).digest('hex');
    if (hashOld === hashNew) return false; // 更新不要
  } catch {
    // ファイルがなければ書き込み必要
  }
  await fs.writeFile(filePath, content, 'utf-8');
  return true;
}

interface HolidaysJp {
  holidays: { [key: string]: string };
  isHoliday: (date: Date | string) => boolean;
  getHolidayName: (date: Date | string) => string | null;
}
let module: HolidaysJp;

describe('Holiday Utilities', () => {
  beforeAll(async () => {
    // ローカルのCSVファイルを読み込み、解析、フィルタリング、TSファイル生成
    const csvBuffer = await fs.readFile(FIXTURES_CSV_PATH);
    const holidays = parseCsv(csvBuffer);
    const tsContent = generateTs(holidays, 2024);
    writeIfChanged(HOLIDAYS_JP_PATH, tsContent);
    module = await import(pathToFileURL(HOLIDAYS_JP_PATH).href);
  });

  describe('isHoliday', () => {
    it('should return true for a known holiday', () => {
      // 2024年の元日
      expect(module.isHoliday('2024-01-01')).toBe(true);
      expect(module.isHoliday(new Date(2024, 0, 1))).toBe(true);
    });

    it('should return false for a non-holiday', () => {
      expect(module.isHoliday('2024-01-02')).toBe(false);
      expect(module.isHoliday(new Date(2024, 0, 2))).toBe(false);
    });

    it('should return false for an invalid date string', () => {
      expect(module.isHoliday('invalid-date')).toBe(false);
    });
  });

  describe('getHolidayName', () => {
    it('should return the name of a known holiday', () => {
      expect(module.getHolidayName('2024-01-01')).toBe('元日');
      expect(module.getHolidayName(new Date(2024, 0, 1))).toBe('元日');
    });

    it('should return null for a non-holiday', () => {
      expect(module.getHolidayName('2024-01-02')).toBe(null);
      expect(module.getHolidayName(new Date(2024, 0, 2))).toBe(null);
    });

    it('should return null for an invalid date string', () => {
      expect(module.getHolidayName('invalid-date')).toBe(null);
    });
  });

  describe('holidays object', () => {
    it('should contain known holidays', () => {
      expect(module.holidays['2024-02-11']).toBe('建国記念の日');
      expect(module.holidays['2024-05-03']).toBe('憲法記念日');
    });

    it('should not contain non-holidays', () => {
      expect(module.holidays['2024-01-02']).toBeUndefined();
    });
  });
});
