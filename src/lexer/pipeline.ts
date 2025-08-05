import { TokenType } from '../interfaces';

export const pipeline: Array<[RegExp, TokenType]> = [
  [/\[(([^\[\]\\])|(\\.))*\]/mu, TokenType.Patch],
  [/(\d+\.\d*)|\d+|(\d*\.\d+)/mu, TokenType.Literal],
  [/[\(\)\{\}]/mu, TokenType.Limiter],
  [/(?:(?!\(|\)|\[|\]\{|\})[\p{P}\p{S}])+/mu, TokenType.Operator],
  [/[\p{L}\p{N}]+/mu, TokenType.Identifier],
  [/\p{White_Space}+/mu, TokenType.Separator],
];
