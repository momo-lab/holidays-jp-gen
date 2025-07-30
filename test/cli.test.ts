import { Command } from 'commander';
import { describe, expect, it } from 'vitest';
import { defineCommand } from '../src/cli';

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
