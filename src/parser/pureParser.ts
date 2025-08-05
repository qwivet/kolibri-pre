import { Expression, Application } from '../interfaces';

export const pureParser = (units: Array<Expression>): Array<Expression> => {
  if (units.length === 0) return [];
  if (units.length === 1) return units;

  let res: Application = { applier: units[units.length - 2], appliedTo: units[units.length - 1] };
  for (let i = units.length - 3; i >= 0; i--) {
    res = { applier: units[i], appliedTo: res };
  }
  return [res];
};
