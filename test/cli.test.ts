import { Command } from 'commander';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { defineCommand, main } from '../src/cli';

const TEST_OUTPUT_DIR = path.resolve(os.tmpdir(), 'test-output');

beforeAll(() => {
  if (!fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.mkdirSync(TEST_OUTPUT_DIR);
  }
});

afterAll(() => {
  if (fs.existsSync(TEST_OUTPUT_DIR)) {
    fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
  }
});

describe('defineCommand', () => {
  it('should return a Command instance', () => {
    const program = defineCommand();
    expect(program).toBeInstanceOf(Command);
  });

  it('should define the --year option with a default value', () => {
    const program = defineCommand();
    const options = program.parse(['node', 'cli.js']).opts();
    expect(options.year).toBe(1955);
  });

  it('should parse numeric year input correctly', () => {
    const program = defineCommand();
    const options = program.parse(['node', 'cli.js', '--year', '2024']).opts();
    expect(options.year).toBe(2024);
  });

  it('should return NaN for non-numeric year input', () => {
    const program = defineCommand();
    const options = program.parse(['node', 'cli.js', '--year', 'abc']).opts();
    expect(options.year).toBeNaN();
  });

  it('should define the --output option', () => {
    const program = defineCommand();
    const options = program
      .parse(['node', 'cli.js', '--output', 'test.ts'])
      .opts();
    expect(options.output).toBe('test.ts');
  });
});

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a holiday file with a specified year and output path', async () => {
    const year = 2026;
    const outputFile = path.join(TEST_OUTPUT_DIR, `holidays-from-${year}.ts`);
    const options = { year, output: outputFile };

    await main(options);

    expect(fs.existsSync(outputFile)).toBe(true);
    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain(`holidays-jp-from-${year}.ts`); // ヘッダーコメント
    expect(content).toContain('export const holidays'); // export文
    expect(content).toContain(`"${year}-01-01": "元日"`); // 指定年の祝日
    expect(content).not.toContain(`"${year - 1}-01-01"`); // 前年の祝日が含まれていないこと
  });

  it('should generate a holiday file with the default year when no year is specified', async () => {
    const year = 1955;
    const outputFile = path.join(TEST_OUTPUT_DIR, `holidays-from-default.ts`);
    const options = { year, output: outputFile };

    await main(options);

    expect(fs.existsSync(outputFile)).toBe(true);
    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain(`holidays-jp-from-${year}.ts`);
    expect(content).toContain(`"${year}-04-29": "天皇誕生日"`); // 昭和の日（旧天皇誕生日）
  });

  it('should handle invalid year input', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const outputFile = path.join(TEST_OUTPUT_DIR, `holidays-from-default.ts`);
    const options = { year: NaN, output: outputFile };
    await main(options);

    expect(errorSpy).toHaveBeenCalledWith(
      "error: option '-y, --year <year>' argument is not a number"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
