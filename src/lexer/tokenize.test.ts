import { describe, it, expect, beforeEach } from 'vitest';
import { IKolibriFile } from '../interfaces';
import { tokenize } from './tokenize';
import { TokenType } from '../interfaces';
import { pipeline } from './pipeline';

describe('tokenize', () => {
  let mockFile: IKolibriFile;

  const createMockFile = (content: string): IKolibriFile => {
    return { fullLocation: () => '', relativeLocation: () => '', fileType: () => '', readFile: () => content };
  };

  beforeEach(() => {
    mockFile = createMockFile('');
  });

  it('should tokenize an empty string correctly', () => {
    mockFile = createMockFile('');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([]);
  });

  it('should tokenize a simple patch', () => {
    mockFile = createMockFile('[patch content]');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '[patch content]', tokenType: TokenType.Patch, file: mockFile, index: 0 }]);
  });

  it('should tokenize a patch with escaped brackets', () => {
    mockFile = createMockFile('[patch \\[content\\]]');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '[patch \\[content\\]]', tokenType: TokenType.Patch, file: mockFile, index: 0 }]);
  });

  it('should tokenize a simple integer literal', () => {
    mockFile = createMockFile('123');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '123', tokenType: TokenType.Literal, file: mockFile, index: 0 }]);
  });

  it('should tokenize a simple float literal', () => {
    mockFile = createMockFile('123.45');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '123.45', tokenType: TokenType.Literal, file: mockFile, index: 0 }]);
  });

  it('should tokenize a float literal starting with a dot', () => {
    mockFile = createMockFile('.45');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '.45', tokenType: TokenType.Literal, file: mockFile, index: 0 }]);
  });

  it('should tokenize a float literal ending with a dot', () => {
    mockFile = createMockFile('123.');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '123.', tokenType: TokenType.Literal, file: mockFile, index: 0 }]);
  });

  it('should tokenize a simple operator', () => {
    mockFile = createMockFile('+-*/');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '+-*/', tokenType: TokenType.Operator, file: mockFile, index: 0 }]);
  });

  it('should tokenize a simple identifier', () => {
    mockFile = createMockFile('myVariable');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: 'myVariable', tokenType: TokenType.Identifier, file: mockFile, index: 0 }]);
  });

  it('should tokenize an identifier with numbers', () => {
    mockFile = createMockFile('func123');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: 'func123', tokenType: TokenType.Identifier, file: mockFile, index: 0 }]);
  });

  it('should tokenize whitespace as a separator', () => {
    mockFile = createMockFile('   \t\n');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([{ value: '   \t\n', tokenType: TokenType.Separator, file: mockFile, index: 0 }]);
  });

  it('should tokenize limiters', () => {
    mockFile = createMockFile('(){}');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([
      { value: '(', tokenType: TokenType.Limiter, file: mockFile, index: 0 },
      { value: ')', tokenType: TokenType.Limiter, file: mockFile, index: 1 },
      { value: '{', tokenType: TokenType.Limiter, file: mockFile, index: 2 },
      { value: '}', tokenType: TokenType.Limiter, file: mockFile, index: 3 },
    ]);
  });

  it('should tokenize a mixed expression', () => {
    mockFile = createMockFile('varaname = 123 + [patch] () {}');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([
      { value: 'varaname', tokenType: TokenType.Identifier, file: mockFile, index: 0 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 8 },
      { value: '=', tokenType: TokenType.Operator, file: mockFile, index: 9 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 10 },
      { value: '123', tokenType: TokenType.Literal, file: mockFile, index: 11 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 14 },
      { value: '+', tokenType: TokenType.Operator, file: mockFile, index: 15 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 16 },
      { value: '[patch]', tokenType: TokenType.Patch, file: mockFile, index: 17 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 24 },
      { value: '(', tokenType: TokenType.Limiter, file: mockFile, index: 25 },
      { value: ')', tokenType: TokenType.Limiter, file: mockFile, index: 26 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 27 },
      { value: '{', tokenType: TokenType.Limiter, file: mockFile, index: 28 },
      { value: '}', tokenType: TokenType.Limiter, file: mockFile, index: 29 },
    ]);
  });

  it('should tokenize @', () => {
    mockFile = createMockFile('abc @ def');
    expect(tokenize(mockFile, pipeline)).toEqual([
      { value: 'abc', tokenType: TokenType.Identifier, file: mockFile, index: 0 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 3 },
      { value: '@', tokenType: TokenType.Operator, file: mockFile, index: 4 },
      { value: ' ', tokenType: TokenType.Separator, file: mockFile, index: 5 },
      { value: 'def', tokenType: TokenType.Identifier, file: mockFile, index: 6 },
    ]);
  });

  it('should handle consecutive tokens without separators', () => {
    mockFile = createMockFile('123+abc[patch]');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([
      { value: '123', tokenType: TokenType.Literal, file: mockFile, index: 0 },
      { value: '+', tokenType: TokenType.Operator, file: mockFile, index: 3 },
      { value: 'abc', tokenType: TokenType.Identifier, file: mockFile, index: 4 },
      { value: '[patch]', tokenType: TokenType.Patch, file: mockFile, index: 7 },
    ]);
  });

  it('should correctly identify mixed operators and identifiers', () => {
    mockFile = createMockFile('a.b-c+d');
    const tokens = tokenize(mockFile, pipeline);
    expect(tokens).toEqual([
      { value: 'a', tokenType: TokenType.Identifier, file: mockFile, index: 0 },
      { value: '.', tokenType: TokenType.Operator, file: mockFile, index: 1 },
      { value: 'b', tokenType: TokenType.Identifier, file: mockFile, index: 2 },
      { value: '-', tokenType: TokenType.Operator, file: mockFile, index: 3 },
      { value: 'c', tokenType: TokenType.Identifier, file: mockFile, index: 4 },
      { value: '+', tokenType: TokenType.Operator, file: mockFile, index: 5 },
      { value: 'd', tokenType: TokenType.Identifier, file: mockFile, index: 6 },
    ]);
  });
});
