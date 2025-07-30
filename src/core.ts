import { parse } from 'csv-parse/sync';
import https from 'https';
import iconv from 'iconv-lite';

export interface HolidayRaw {
  date: string; // yyyy/M/d
  name: string;
}

const HOLIDAY_CSV_URL =
  'https://www8.cao.go.jp/chosei/shukujitsu/syukujitsu.csv';

export async function downloadCsv(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(HOLIDAY_CSV_URL, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

export function parseCsv(buffer: Buffer): HolidayRaw[] {
  const utf8Str = iconv.decode(buffer, 'Shift_JIS');
  const records = parse(utf8Str, {
    columns: true,
    skip_empty_lines: true,
  }) as Record<string, string>[];

  return records.map((r) => ({
    date: r['国民の祝日・休日月日'],
    name: r['国民の祝日・休日名称'],
  }));
}

export function filterAndFormat(
  holidays: HolidayRaw[],
  fromYear: number
): string[] {
  return holidays
    .filter((h) => {
      const y = Number(h.date.split('/')[0]);
      return y >= fromYear;
    })
    .map((h) => {
      const [y, m, d] = h.date.split('/');
      const mm = m.padStart(2, '0');
      const dd = d.padStart(2, '0');
      return `"${y}-${mm}-${dd}": "${h.name}",`;
    });
}

export function generateTs(holidays: string[], fromYear: number): string {
  const holidays_str = holidays.map((v) => `  ${v}`).join('\n');
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
