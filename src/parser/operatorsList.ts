import { Association, Operator } from '../interfaces';

export const operatorsList: Array<Operator> = [
  { value: '.', priority: 0, association: Association.RL },
  { value: '=', priority: 1, association: Association.RL },
  { value: ';', priority: 2, association: Association.RL },
  { value: ',', priority: 3, association: Association.RL },
  { value: ':', priority: 4, association: Association.RL },
  { value: '<', priority: 5, association: Association.RL },
  { value: '+', priority: 6, association: Association.RL },
  { value: '-', priority: 6, association: Association.RL },
  { value: '*', priority: 7, association: Association.RL },
  { value: '//', priority: 7, association: Association.RL },
  { value: '^', priority: 8, association: Association.LR },
];
