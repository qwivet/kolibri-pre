import { describe, expect, test, vi } from 'vitest';
import { bracketParser } from './bracketParser';
import { Expression, TokenType } from '../interfaces';
import * as utils from './utils';
import { clamp } from '../common/clamp';

vi.mock('..', () => ({
  insertInto: vi.fn(
    <T>(arr: Array<T>, start: number, end: number, value: Array<T>): Array<T> => [
      ...arr.slice(0, clamp(start, 0, Math.min(arr.length, end))),
      ...value,
      ...arr.slice(Math.min(arr.length, end)),
    ]
  ),
}));

vi.mock('./findLastIndex', () => ({
  findLastIndex: vi.fn(<T>(arr: Array<T>, cond: (x: T) => boolean): number | undefined => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (cond(arr[i])) return i;
    }
    return -1;
  }),
}));

vi.mock('./utils', () => ({
  startParser: vi.fn((parser, units, start, end) => parser(units.slice(start, end), [])),
  tokenComparer: vi.fn(
    (value: string) => (x: Expression) =>
      (x as any)?.value !== undefined && (x as any).value === value
  ),
}));

const token = (value: string, type: TokenType): Expression => ({
  value: value,
  tokenType: type,
  file: null as any,
  index: -1,
});

const open = token('(', TokenType.Limiter);
const close = token(')', TokenType.Limiter);
const opencustom = token('((', TokenType.Limiter);
const closecustom = token('))', TokenType.Limiter);
const a = token('a', TokenType.Identifier);
const b = token('b', TokenType.Identifier);
const c = token('c', TokenType.Identifier);
const plus = token('+', TokenType.Operator);

const mockParser = vi.fn((tokens: Expression[]) => [opencustom, ...tokens, closecustom]);

describe('bracketParser', () => {
  test('should throw error if more than one parser is provided', () => {
    expect(() => bracketParser([], [mockParser, mockParser])).toThrow('bracketParser accept only one parser');
  });

  test('basic bracket removal', () => {
    const input = [open, a, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, a, closecustom]);
    expect(utils.startParser).toHaveBeenCalledWith(mockParser, input, 1, 2);
  });

  test('nested brackets', () => {
    const input = [open, open, a, close, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, opencustom, a, closecustom, closecustom]);
  });

  test('multiple separate brackets', () => {
    const input = [open, a, close, open, b, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, a, closecustom, opencustom, b, closecustom]);
  });

  test('brackets with operators', () => {
    const input = [open, a, plus, b, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, a, plus, b, closecustom]);
  });

  test('unmatched closing bracket', () => {
    const input = [a, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, a, closecustom]);
  });

  test('unmatched opening bracket', () => {
    const input = [open, a];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, a, closecustom]);
  });

  test('multiple unmatched closing brackets', () => {
    const input = [a, close, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, opencustom, a, closecustom, closecustom]);
  });

  test('mixed tokens and brackets', () => {
    const input = [a, open, b, close, c];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([a, opencustom, b, closecustom, c]);
  });

  test('empty brackets', () => {
    const input = [open, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, closecustom]);
  });

  test('complex nested structure', () => {
    const input = [a, open, b, open, c, close, plus, a, close];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([a, opencustom, b, opencustom, c, closecustom, plus, a, closecustom]);
  });

  test('should handle tokens after closing bracket', () => {
    const input = [open, a, close, b];
    const result = bracketParser(input, [mockParser]);
    expect(result).toEqual([opencustom, a, closecustom, b]);
  });
});
