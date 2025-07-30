#!/usr/bin/env node

import { Command, Option, OptionValues } from 'commander';
import fs from 'fs';
import { pathToFileURL } from 'url';
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

  if (isNaN(year)) {
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

// Run as CLI only when this file is executed directly
const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const command = defineCommand();
  command.action(main);
  command.parseAsync(process.argv);
}
