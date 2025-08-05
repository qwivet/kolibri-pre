export const findLastIndex = <T>(arr: Array<T>, cond: (x: T) => boolean): number | undefined => {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (cond(arr[i])) return i;
  }
  return -1;
};
