import { clamp } from './clamp';

export const insertInto = <T>(arr: Array<T>, start: number, end: number, value: Array<T>): Array<T> => [
  ...arr.slice(0, clamp(start, 0, Math.min(arr.length, end))),
  ...value,
  ...arr.slice(Math.min(arr.length, end)),
];
