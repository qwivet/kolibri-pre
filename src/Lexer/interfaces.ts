import { IKolibriFile, Token, TokenType } from '../interfaces';

export type Lexer = (file: IKolibriFile, pipeline: Array<[RegExp, TokenType]>) => Array<Token>;
