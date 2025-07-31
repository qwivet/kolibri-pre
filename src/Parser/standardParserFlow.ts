import { bracketParser } from './bracketParser';
import { Parser } from './interfaces';
import { operatorParser } from './operatorParser';
import { operatorsList } from './operatorsList';
import { pureParser } from './pureParser';

export const standardParserFlow: Array<Parser> = [
  bracketParser,
  operatorParser(operatorsList),
  pureParser,
];
