import { Expression } from '../interfaces';

export type Parser = (units: Array<Expression>, parsers: Array<Parser>) => Array<Expression>;
