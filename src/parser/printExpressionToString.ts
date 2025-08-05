import { Application, Expression } from '../interfaces';

const isApplication = (expr: Expression): expr is Application =>
  (expr as Application) !== undefined && (expr as Application).applier !== undefined;

export const printExpressionToString = (expr: Expression, indentLevel: number = 0): string => {
  const indent = ' '.repeat(indentLevel);
  if (isApplication(expr)) {
    const applierStr = printExpressionToString(expr.applier, indentLevel);
    const appliedToStr = printExpressionToString(expr.appliedTo, indentLevel + 1);
    return `${applierStr}\n${indent}∟${appliedToStr.trimStart()}`;
  } else {
    return `${indent}${expr.value}`;
  }
};

export const printExpressionToStringBr = (expr: Expression): string => {
  if (expr === undefined) return '__err';
  if (isApplication(expr)) {
    const applierStr = printExpressionToStringBr(expr.applier);
    const appliedToStr = printExpressionToStringBr(expr.appliedTo);
    return `${applierStr} (${appliedToStr.trimStart()})`;
  } else {
    return `${expr.value}`;
  }
};
