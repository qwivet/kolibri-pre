export enum TokenType {
  Identifier = 'id',
  Operator = 'op',
  Separator = 'sp',
  Limiter = 'lm',
  Patch = 'pt',
  Literal = 'lt',
}
export type Token = { value: string; tokenType: TokenType; file: IKolibriFile; index: number };

export type Expression = Application | Token;
export type Application = { applier: Expression; appliedTo: Expression };

export interface IKolibriFile {
  fullLocation: () => string;
  relativeLocation: () => string;
  fileType: () => string;

  readFile: () => string;
}

export enum Association {
  LR,
  RL,
}

export type Operator = { value: string; priority: number; association: Association };
