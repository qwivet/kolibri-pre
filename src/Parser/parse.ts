import { Expression, Parser } from '../interfaces';

export const parse = (units: Array<Expression>, parsers: Array<Parser>): Array<Expression> => {
  for (const parser of parsers) {
    units = parser(units, [parse]);
  }

  return units;
};


