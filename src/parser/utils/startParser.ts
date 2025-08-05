import { Expression } from '../../interfaces';
import { Parser } from '../interfaces';
import { standardParserFlow } from '../standardParserFlow';

export const startParser = (parser: Parser, units: Array<Expression>, start: number, end: number) => parser(units.slice(start, end), standardParserFlow);

