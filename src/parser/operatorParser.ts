import { Expression, Association, Operator } from '../interfaces';
import { Parser } from '../interfaces';
import { findLastIndex } from './findLastIndex';
import { startParser, tokenComparer } from './utils';

export const operatorParser =
  (operatorsList: Array<Operator>): ((unitsValue: Array<Expression>, parsers: Array<Parser>) => Array<Expression>) =>
    (unitsValue: Array<Expression>, parsers: Array<Parser>) =>
      operatorParserRaw(operatorsList, unitsValue, parsers);

const operatorParserRaw = (
  operatorsList: Array<Operator>,
  unitsValue: Array<Expression>,
  parsers: Array<Parser>
): Array<Expression> => {
  if (parsers.length !== 1) throw new Error('operatorParser accept only one parser');
  if (unitsValue.length === 0 || unitsValue.length === 1) return unitsValue;
  const parser = parsers[0];
  let units = unitsValue.slice();

  const isActiveOp = (opList: Array<Operator>) => (x: Expression) => opList.some(op => tokenComparer(op.value)(x));
  if (!units.some(isActiveOp(operatorsList))) return units;

  const isOpInUnits = (op: Operator) => units.some(tokenComparer(op.value));
  const minPriority = operatorsList.reduce((acc, x) => (isOpInUnits(x) ? Math.min(x.priority, acc) : acc), Infinity);

  const currentOperators = operatorsList.filter(op => op.priority == minPriority).filter(isOpInUnits);
  if (currentOperators.some(op => op.association !== currentOperators[0].association))
    throw new Error('u cannot use operators with same priority and different association in same place');

  const operatorsAmount = units.filter(isActiveOp(currentOperators)).length;
  if (isActiveOp(currentOperators)(units[0])) {
    if (operatorsAmount > 1) return startParser(parser, units, 1, units.length);
    else return [{ applier: units[0], appliedTo: startParser(parser, units, 1, units.length)[0] }];
  }

  if (isActiveOp(currentOperators)(units[units.length - 1])) return startParser(parser, units, 0, units.length - 1);

  const firstIndex = units.findIndex(x => currentOperators.some(op => tokenComparer(op.value)(x)));
  const lastIndex = findLastIndex(units, x => currentOperators.some(op => tokenComparer(op.value)(x)));
  let index = currentOperators[0].association === Association.RL ? firstIndex : lastIndex;

  if (index === undefined) throw new Error('how');
  const leftPart = startParser(parser, units, 0, index)[0];
  const rightPart = startParser(parser, units, index + 1, units.length)[0];
  return [{ applier: { applier: units[index], appliedTo: leftPart }, appliedTo: rightPart }];
};
