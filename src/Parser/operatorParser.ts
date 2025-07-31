import { Token, Expression, Association, Operator } from '../interfaces';
import { Parser } from '../interfaces';
import { standardParserFlow } from './standardParserFlow';
import { findLastIndex } from './findLastIndex';

export const operatorParser =
  (operatorsList: Array<Operator>): ((unitsValue: Array<Expression>, parsers: Array<Parser>) => Array<Expression>) =>
  (unitsValue: Array<Expression>, parsers: Array<Parser>) =>
    operatorParserRaw(operatorsList, unitsValue, parsers);

const operatorParserRaw = (
  operatorsList: Array<Operator>,
  unitsValue: Array<Expression>,
  parsers: Array<Parser>
): Array<Expression> => {
  if (unitsValue.length === 0 || unitsValue.length === 1) return unitsValue;
  if (parsers.length !== 1) throw new Error('operatorParser accept only one parser');
  let units = unitsValue.slice();
  const startParser = (start: number, end: number) => parsers[0](units.slice(start, end), standardParserFlow);
  const isEqual =
    (value: string): ((x: Expression) => boolean) =>
    x =>
      (x as Token) !== undefined && (x as Token).value !== undefined && (x as Token).value === value;

  if (units.every(x => !operatorsList.some(op => isEqual(op[0])(x)))) return units;

  let minPriority = Infinity;
  for (const op of operatorsList) {
    if (minPriority <= op[1]) continue;
    if (units.some(isEqual(op[0]))) minPriority = op[1];
  }
  const currentOperators = operatorsList.filter(op => op[1] == minPriority).filter(op => units.some(isEqual(op[0])));
  if (currentOperators.length === 0) return units;
  if (currentOperators.some(op => op[2] !== currentOperators[0][2]))
    throw new Error('u cannot use operators with same priority and association in same place');
  const operatorsAmount = units.filter(x => currentOperators.some(op => isEqual(op[0])(x))).length;
  if (currentOperators.some(op => isEqual(op[0])(units[0]))) {
    if (operatorsAmount > 1) return startParser(1, units.length);
    else return [{ applier: units[0], appliedTo: startParser(1, units.length)[0] }];
  }
  if (currentOperators.some(op => isEqual(op[0])(units[units.length - 1]))) return startParser(0, units.length - 1);

  let index: number | undefined;
  switch (currentOperators[0][2]) {
    case Association.RL:
      index = units.findIndex(x => currentOperators.some(op => isEqual(op[0])(x)));
    case Association.LR:
      index = findLastIndex(units, x => currentOperators.some(op => isEqual(op[0])(x)));
  }
  if (index === undefined) return units;
  return [
    {
      applier: { applier: units[index], appliedTo: startParser(0, index)[0] },
      appliedTo: startParser(index + 1, units.length)[0],
    },
  ];
};
