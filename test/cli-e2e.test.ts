import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_TIMEOUT = 30000; // 30秒

describe('CLI E2E Test', () => {
  const outputDir = path.resolve(__dirname, 'e2e-output');

  // テストの前に出力ディレクトリを作成
  beforeAll(() => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
  });

  // テストの後に出力ディレクトリをクリーンアップ
  afterAll(() => {
    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
    }
  });

  it('should generate a holiday file with a specified year and output path', { timeout: TEST_TIMEOUT }, () => {
    const year = 2026;
    const outputFile = path.join(outputDir, `holidays-from-${year}.ts`);
    const command = `node dist/cli.js --year ${year} --output ${outputFile}`;

    // CLIコマンドを実行
    execSync(command, { stdio: 'inherit' });

    // ファイルが生成されたかを確認
    expect(fs.existsSync(outputFile)).toBe(true);

    // ファイルの内容を検証
    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain(`holidays-jp-from-${year}.ts`); // ヘッダーコメント
    expect(content).toContain('export const holidays'); // export文
    expect(content).toContain(`"${year}-01-01": "元日"`); // 指定年の祝日
    expect(content).not.toContain(`"${year - 1}-01-01"`); // 前年の祝日が含まれていないこと
  });

  it('should generate a holiday file with the default year when no year is specified', { timeout: TEST_TIMEOUT }, () => {
    const defaultYear = 1955;
    const outputFile = path.join(outputDir, `holidays-from-default.ts`);
    const command = `node dist/cli.js --output ${outputFile}`;

    execSync(command, { stdio: 'inherit' });

    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf-8');
    expect(content).toContain(`holidays-jp-from-${defaultYear}.ts`);
    expect(content).toContain(`"${defaultYear}-04-29": "天皇誕生日"`); // 昭和の日（旧天皇誕生日）
  });

  it('should display help text and exit gracefully when --help is used', () => {
    const command = `node dist/cli.js --help`;

    // コマンドを実行し、出力を取得する
    // 正常終了 (exit code 0) するはずなので、エラーは発生しない想定
    const output = execSync(command, { stdio: ['inherit', 'pipe', 'ignore'] }).toString();

    // ヘルプの基本的な要素が含まれているかを確認
    expect(output).toContain('Usage: cli [options]');
    expect(output).toContain('Options:');
    expect(output).toContain('--year <year>');
    expect(output).toContain('--output <path>');
    expect(output).toContain('--help');
  });
});
