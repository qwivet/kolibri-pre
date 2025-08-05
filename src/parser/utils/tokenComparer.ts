import { Expression, Token } from '../../interfaces';

export const tokenComparer = (value: string) => (x: Expression) =>
  (x as Token) !== undefined && (x as Token).value !== undefined && (x as Token).value === value;
