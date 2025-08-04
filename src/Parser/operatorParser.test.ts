import { describe, expect, test, vi } from 'vitest';
import { operatorParser } from './operatorParser';
import { Expression, TokenType, Association, Operator } from '../interfaces';
import { clamp } from '../Common';

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
    (value: string) => (x: Expression) => (x as any)?.value !== undefined && (x as any).value === value
  ),
}));

const token = (value: string, type: TokenType = TokenType.Identifier): Expression => ({
  value,
  tokenType: type,
  file: null as any,
  index: -1,
});

// Operator factory
const op = (value: string, priority: number, association: Association): Operator => ({ value, priority, association });

// Common operators
const plusOp = op('+', 1, Association.LR);
const minusOp = op('-', 1, Association.LR);
const hatOp = op('^', 2, Association.RL);
const eqOp = op('=', 0, Association.RL);
const atOp = op('@', 1, Association.LR);
const hashOp = op('#', 1, Association.RL);

// Mock parser
const mockParser = vi.fn((tokens: Expression[]) => tokens);
const mockParserOp = (op: Operator[]) =>
  vi.fn((tokens: Expression[]) => operatorParser(op)(tokens, [mockParserOp(op)]));

describe('operatorParser', () => {
  test('should throw error for multiple parsers', () => {
    const parser = operatorParser([plusOp]);
    expect(() => parser([], [mockParser, mockParser])).toThrow('operatorParser accept only one parser');
  });

  test('empty input returns empty array', () => {
    const parser = operatorParser([plusOp]);
    expect(parser([], [mockParser])).toEqual([]);
  });

  test('single token returns itself', () => {
    const parser = operatorParser([plusOp]);
    const input = [token('a')];
    expect(parser(input, [mockParser])).toEqual(input);
  });

  test('basic binary operator (left-associative)', () => {
    const parser = operatorParser([plusOp]);
    const a = token('a');
    const plus = token('+');
    const b = token('b');
    const result = parser([a, plus, b], [mockParser]);

    expect(result).toEqual([{ applier: { applier: plus, appliedTo: a }, appliedTo: b }]);
  });

  test('basic binary operator (right-associative)', () => {
    const parser = operatorParser([hatOp]);
    const a = token('a');
    const hat = token('^');
    const b = token('b');
    const result = parser([a, hat, b], [mockParser]);

    expect(result).toEqual([{ applier: { applier: hat, appliedTo: a }, appliedTo: b }]);
  });

  test('unary operator at beginning', () => {
    const parser = operatorParser([minusOp]);
    const minus = token('-');
    const a = token('a');
    const result = parser([minus, a], [mockParser]);

    expect(result).toEqual([{ applier: minus, appliedTo: a }]);
  });

  test('operator at end is ignored', () => {
    const parser = operatorParser([plusOp]);
    const a = token('a');
    const plus = token('+');
    const result = parser([a, plus], [mockParser]);

    expect(result).toEqual([a]);
  });

  test('multiple operators same priority (left-associative)', () => {
    const parser = operatorParser([plusOp, minusOp]);
    const a = token('a');
    const plus = token('+');
    const b = token('b');
    const minus = token('-');
    const c = token('c');

    const result = parser([a, plus, b, minus, c], [mockParserOp([plusOp, minusOp])]);
    expect(result[0]).toMatchObject({
      applier: {
        applier: minus,
        appliedTo: expect.objectContaining({ applier: { applier: plus, appliedTo: a }, appliedTo: b }),
      },
      appliedTo: c,
    });
  });

  test('mixed priorities - higher priority first', () => {
    const parser = operatorParser([plusOp, hatOp]);
    const a = token('a');
    const hat = token('^');
    const b = token('b');
    const plus = token('+');
    const c = token('c');

    const result = parser([a, hat, b, plus, c], [mockParserOp([plusOp, hatOp])]);

    // Should parse as ((a ^ b) + c)
    expect(result[0]).toMatchObject({
      applier: {
        applier: plus,
        appliedTo: expect.objectContaining({ applier: { applier: hat, appliedTo: a }, appliedTo: b }),
      },
      appliedTo: c,
    });
  });

  test('right-associative operators', () => {
    const parser = operatorParser([eqOp]);
    const a = token('a');
    const eq1 = token('=');
    const b = token('b');
    const eq2 = token('=');
    const c = token('c');

    const result = parser([a, eq1, b, eq2, c], [mockParserOp([eqOp])]);

    // Should parse as (a = (b = c))
    expect(result[0]).toMatchObject({
      applier: { applier: eq1, appliedTo: a },
      appliedTo: expect.objectContaining({ applier: { applier: eq2, appliedTo: b }, appliedTo: c }),
    });
  });

  test('should throw for mixed associations same priority', () => {
    const parser = operatorParser([atOp, hashOp]);
    const a = token('a');
    const at = token('@');
    const b = token('b');
    const hash = token('#');
    const c = token('c');

    expect(() => parser([a, at, b, hash, c], [mockParser])).toThrow(
      'u cannot use operators with same priority and different association'
    );
  });

  test('complex nested expression', () => {
    const parser = operatorParser([plusOp, hatOp, eqOp]);
    const a = token('a');
    const eq = token('=');
    const b = token('b');
    const hat = token('^');
    const c = token('c');
    const plus = token('+');
    const d = token('d');

    const result = parser([a, eq, b, hat, c, plus, d], [mockParserOp([plusOp, hatOp, eqOp])]);

    // Should parse as (a = ((b ^ c) + d))
    expect(result[0]).toMatchObject({
      applier: { applier: eq, appliedTo: a },
      appliedTo: expect.objectContaining({
        applier: {
          applier: plus,
          appliedTo: expect.objectContaining({ applier: { applier: hat, appliedTo: b }, appliedTo: c }),
        },
        appliedTo: d,
      }),
    });
  });

  test('operator at beginning with multiple operators', () => {
    const parser = operatorParser([minusOp, plusOp]);
    const minus = token('-');
    const a = token('a');
    const plus = token('+');
    const b = token('b');

    const result = parser([minus, a, plus, b], [mockParserOp([minusOp, plusOp])]);

    // Should parse as (a + b)
    expect(result[0]).toMatchObject({ applier: { applier: plus, appliedTo: a }, appliedTo: b });
  });

  test('no active operators returns input', () => {
    const parser = operatorParser([plusOp]);
    const a = token('a');
    const b = token('b');
    const result = parser([a, b], [mockParser]);
    expect(result).toEqual([a, b]);
  });
});
