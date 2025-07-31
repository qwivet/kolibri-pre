export const findLastIndex = <T>(arr: Array<T>, cond: (x: T) => boolean): number | undefined => {
  let res: number | undefined = undefined;
  for (const [index, item] of arr.entries()) {
    if (cond(item)) res = index;
  }
  return res;
};
