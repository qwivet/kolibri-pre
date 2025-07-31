import { Association, Operator } from "../interfaces";

export const operatorsList: Array<Operator> = [
  ['.', 0, Association.RL],
  ['=', 1, Association.RL],
  [';', 2, Association.RL],
  [',', 3, Association.RL],
  [':', 4, Association.RL],
  ['<', 5, Association.RL],
  ['+', 6, Association.RL],
  ['-', 6, Association.RL],
  ['*', 7, Association.RL],
  ['//', 7, Association.RL],
  ['^', 8, Association.LR],
];

