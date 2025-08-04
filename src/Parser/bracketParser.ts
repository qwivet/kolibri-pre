import { insertInto } from '..';
import { Expression } from '../interfaces';
import { Parser } from '../interfaces';
import { findLastIndex } from './findLastIndex';
import { startParser, tokenComparer } from './utils';

export const bracketParser = (unitsValue: Array<Expression>, parsers: Array<Parser>): Array<Expression> => {
  if (parsers.length !== 1) throw new Error('bracketParser accept only one parser');
  const parser = parsers[0];
  let units = unitsValue.slice();

  const startIndexGen = (searchTo?: number) => findLastIndex(units.slice(0, searchTo), tokenComparer('(')) ?? -1;

  while (units.some(tokenComparer('('))) {
    const startIndex = startIndexGen();
    if (startIndex === undefined) throw new Error('how tf is going');
    const lenUnchecked = units.slice(startIndex + 1).findIndex(tokenComparer(')'));
    const end = lenUnchecked === -1 ? units.length : startIndex + lenUnchecked + 1;
    units = insertInto(units, startIndex, end + 1, startParser(parser, units, startIndex + 1, end));
  }

  while (units.some(tokenComparer(')'))) {
    const endIndex = units.findIndex(tokenComparer(')'));
    if (endIndex === -1) throw new Error('how tf');
    const startIndex = startIndexGen(endIndex);
    units = insertInto(units, startIndex, endIndex + 1, startParser(parser, units, startIndex + 1, endIndex));
  }

  return units;
};
