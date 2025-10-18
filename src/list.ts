type Comparator<T> = (a: T, b: T) => number;

export function oneOf<T>(values: T[]): (value: T) => boolean;
export function oneOf<T>(values: T[], value: T): boolean;
export function oneOf<T>(
  values: T[],
  value?: T
): boolean | ((value: T) => boolean) {
  return value === undefined
    ? (value: T) => values.includes(value)
    : values.includes(value);
}

export function slice<T>(start: number, end?: number): (arr: T[]) => T[];
export function slice<T>(start: number, end: number | undefined, arr: T[]): T[];
export function slice<T>(
  start: number,
  end?: number,
  arr?: T[]
): ((arr: T[]) => T[]) | T[] {
  return arr !== undefined
    ? arr.slice(start, end)
    : (arr: T[]) => arr.slice(start, end);
}

export function zip<T, U>(arr1: T[], arr2: U[]): [T, U][];
export function zip<T>(arr1: T[]): <U>(arr2: U[]) => [T, U][];
export function zip<T, U>(arr1: T[], arr2?: U[]) {
  if (arr2) {
    return arr1.map((item, index) => [item, arr2[index]]);
  }
  return (arr2: U[]) => arr1.map((item, index) => [item, arr2[index]]);
}

export function map<T, U>(fn: (value: T) => U): (arr: T[]) => U[];
export function map<T, U>(fn: (value: T) => U, arr: T[]): U[];
export function map<T, U>(
  fn: (value: T) => U,
  arr?: T[]
): ((arr: T[]) => U[]) | U[] {
  return arr === undefined ? (arr: T[]) => arr.map(fn) : arr.map(fn);
}

export const filter =
  <T>(predicate: (value: T) => boolean) =>
  (arr: T[]): T[] =>
    arr.filter(predicate);

export const flat = <T>(arr: T[][]): T[] => arr.flat();

export const desc =
  <T>(fn: Comparator<T>): Comparator<T> =>
  (a, b) =>
    fn(b, a);

export const compareBy =
  <T>(keyFn: (obj: T) => {}) =>
  (a: T, b: T) =>
    keyFn(b) < keyFn(a) ? -1 : keyFn(b) > keyFn(a) ? 1 : 0;

export const sort =
  <T>(keyFn: (obj: T) => object) =>
  (arr: T[]): T[] =>
    arr.toSorted(compareBy(keyFn));

export const toDict =
  <const T, const K extends string | number>(keyFn: (obj: T) => K) =>
  (arr: T[]): Record<K, T> =>
    arr.reduce((acc, obj) => {
      acc[keyFn(obj)] = obj;
      return acc;
    }, {} as Record<K, T>);

export const uniq =
  <const T, const K extends string | number>(keyFn: (obj: T) => K) =>
  (arr: T[]): T[] =>
    Object.values(toDict(keyFn)(arr));
