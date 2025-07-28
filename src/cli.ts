#!/usr/bin/env node

import { Command } from 'commander';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import https from 'https';
import iconv from 'iconv-lite';

interface HolidayRaw {
  date: string; // yyyy/M/d
  name: string; // Shift_JIS文字列（後でUTF-8化）
}

const HOLIDAY_CSV_URL =
  'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv';

const program = new Command();

program
  .option('-y, --year <year>', '開始年')
  .option('-o, --output <path>', '出力ファイルパス');

program.parse(process.argv);

const options = program.opts();

async function downloadCsv(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(HOLIDAY_CSV_URL, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

function parseCsv(buffer: Buffer): HolidayRaw[] {
  // Shift_JIS -> UTF-8
  const utf8Str = iconv.decode(buffer, 'Shift_JIS');

  const records = parse(utf8Str, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  // カラム名は日付と祝日名の想定、例： '国民の祝日・休日の日付', '名称'
  // 適宜調整してください

  return records.map((r) => ({
    date: r['国民の祝日・休日月日'], // yyyy/M/d形式
    name: r['国民の祝日・休日名称'],
  }));
}

function filterAndFormat(holidays: HolidayRaw[], fromYear: number): string[] {
  return holidays
    .filter((h) => {
      const y = Number(h.date.split('/')[0]);
      return y >= fromYear;
    })
    .map((h) => {
      // yyyy/M/d → yyyy-MM-dd
      const [y, m, d] = h.date.split('/');
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      return `"${y}-${mm}-${dd}": "${h.name}",`;
    });
}

function generateTs(holidays: string[], fromYear: number): string {
  const holidays_str = holidays
    .map((v) => `  ${v}`) // インデント
    .join('\n');
  return `// holidays-jp-from-${fromYear}.ts
/**
 * @file 日本の祝日データと関連ユーティリティ
 * @module holidays-jp
 */

/**
 * 祝日データを格納するオブジェクト。
 * キーは 'YYYY-MM-DD' 形式の日付文字列、値は祝日名。
 * @type { [key: string]: string }
 */
export const holidays: { [key: string]: string } = {
${holidays_str}
};

/**
 * Dateオブジェクトまたは日付文字列を 'YYYY-MM-DD' 形式の文字列に変換します。
 * @param {Date | string} date - 変換する日付。
 * @returns {string} 'YYYY-MM-DD' 形式の日付文字列。
 * @throws {Error} 無効な日付が指定された場合。
 */
const toDateString = (date: Date | string): string => {
  if (typeof date === "string") {
    date = new Date(date);
  } else if (!(date instanceof Date)) {
    throw new Error("Invalid date");
  }

  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, "0");
  const dd = date.getDate().toString().padStart(2, "0");
  return [yyyy, mm, dd].join("-");
};

/**
 * 指定された日付が祝日であるかどうかを判定します。
 * @param {Date | string} date - 判定する日付。
 * @returns {boolean} 祝日であれば \`true\`、そうでなければ \`false\`。
 */
export const isHoliday = (date: Date | string): boolean => {
  const key = toDateString(date);
  return key in holidays;
};

/**
 * 指定された日付の祝日名を取得します。
 * @param {Date | string} date - 祝日名を取得する日付。
 * @returns {string | null} 祝日名。祝日でない場合は \`null\`。
 */
export const getHolidayName = (date: Date | string): string | null => {
  const key = toDateString(date);
  return holidays[key] || null;
};
`;
}

async function main() {
  try {
    const fromYear = Number(options.year || '1955');
    if (isNaN(fromYear)) {
      console.error('年は数値で指定してください');
      process.exit(1);
    }

    console.log('祝日CSVをダウンロード中...');
    const buffer = await downloadCsv();

    console.log('CSVを解析中...');
    const rawHolidays = parseCsv(buffer);

    console.log(`指定年 ${fromYear} 以降でフィルタリング中...`);
    const filtered = filterAndFormat(rawHolidays, fromYear);

    const outputPath = options.output || `holidays-jp-from-${fromYear}.ts`;
    console.log(`ファイルを出力中: ${outputPath}`);
    fs.writeFileSync(outputPath, generateTs(filtered, fromYear), 'utf-8');

    console.log('完了しました！');
  } catch (e) {
    console.error('エラー:', e);
    process.exit(1);
  }
}

main();
