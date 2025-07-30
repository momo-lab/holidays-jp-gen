#!/usr/bin/env node

import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { downloadCsv, filterAndFormat, generateTs, parseCsv } from './core.js';

const DEFAULT_START_YEAR = 1955;

export function defineCommand(): Command {
  const program = new Command();
  program
    .addOption(
      new Option('-y, --year <year>', '開始年')
        .default(DEFAULT_START_YEAR)
        .argParser(Number)
    )
    .option('-o, --output <path>', '出力ファイルパス');
  return program;
}

export async function main(options: OptionValues) {
  const { year, output } = options;

  if (isNaN(year)) {
    console.error("error: option '-y, --year <year>' argument is not a number");
    process.exit(1);
  }

  console.log('祝日CSVをダウンロード中...');
  const buffer = await downloadCsv();

  console.log('CSVを解析中...');
  const rawHolidays = parseCsv(buffer);

  console.log(`指定年 ${year} 以降でフィルタリング中...`);
  const filtered = filterAndFormat(rawHolidays, year);

  const outputPath = output || `holidays-jp-from-${year}.ts`;
  console.log(`ファイルを出力中: ${outputPath}`);
  fs.writeFileSync(outputPath, generateTs(filtered, year), 'utf-8');

  console.log('完了しました！');
}

// このファイルが直接実行された場合のみ、CLIとして動作する
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const command = defineCommand();
  command.action(main);
  command.parseAsync(process.argv);
}
