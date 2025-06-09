import { describe, it, expect } from 'vitest';
import { transformSync } from '@babel/core';
import plugin from '../index';

const executeTransformed = (code: string) => {
  const result = transformSync(code, { plugins: [plugin] });
  return eval(result?.code || 'null');
};

describe('exec', () => {
  it('should give output that is functionally equivalent to input', () => {
    expect(executeTransformed('[1, 2, 3].includes(1)')).toBe(true);
    expect(executeTransformed('[1, 2, 3].includes(0)')).toBe(false);
    expect(executeTransformed('const a = [1, 2, 3]; a.includes(1)')).toBe(true);
    expect(executeTransformed("({ includes: _ => 'a' }).includes(0)")).toBe('a');
  });
});
