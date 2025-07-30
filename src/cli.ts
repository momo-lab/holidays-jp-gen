#!/usr/bin/env node

import fs from 'node:fs';
import { Command, Option, type OptionValues } from 'commander';
import { downloadCsv, generateTs, parseCsv } from './core.js';

const DEFAULT_START_YEAR = 1955;

export function defineCommand(): Command {
  const program = new Command();
  program
    .addOption(
      new Option('-y, --year <year>', 'Start year')
        .default(DEFAULT_START_YEAR)
        .argParser(Number)
    )
    .option('-o, --output <path>', 'Output file path');
  return program;
}

export async function main(options: OptionValues) {
  const { year, output } = options;

  if (Number.isNaN(year)) {
    console.error("error: option '-y, --year <year>' argument is not a number");
    process.exit(1);
  }

  const outputPath = output || `holidays-jp-from-${year}.ts`;
  console.log(`Generating a file for ${year} and beyond: ${outputPath}`);

  const buffer = await downloadCsv();
  const holidays = parseCsv(buffer);
  fs.writeFileSync(outputPath, generateTs(holidays, year), 'utf-8');

  console.log('Done!');
}
