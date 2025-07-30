import { execSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('CLI E2E Test', () => {
  it('should display help text and exit gracefully when --help is used', () => {
    const command = `node dist/cli-entry.js --help`;

    // コマンドを実行し、出力を取得する
    // 正常終了 (exit code 0) するはずなので、エラーは発生しない想定
    const output = execSync(command, {
      stdio: ['inherit', 'pipe', 'ignore'],
    }).toString();

    // ヘルプの基本的な要素が含まれているかを確認
    expect(output).toContain('Usage: cli-entry [options]');
    expect(output).toContain('Options:');
    expect(output).toContain('--year <year>');
    expect(output).toContain('--output <path>');
    expect(output).toContain('--help');
  });
});
