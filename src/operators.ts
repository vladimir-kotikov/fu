import { Fn } from "./function";

type Predicate<T> = (value: T) => boolean;

export const pass = <T>(value: T): T => value;
export const id = pass;

// Type guards

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined;

// Scalar operators

export const equals = (value: unknown) => (other: unknown) => value === other;

export const not =
  <T>(fn: Predicate<T>) =>
  (value: T) =>
    !fn(value);

// Predicate operators

export const anyOf =
  <T>(...predicates: Predicate<T>[]): Predicate<T> =>
  (value: T): boolean =>
    predicates.some(predicate => predicate(value));

export function tee<T>(fn: Fn<T, unknown>): (arg: T) => T;
export function tee<T>(fn: Fn<T, unknown>, arg: T): T;
export function tee<T>(fn: Fn<T, unknown>, arg?: T) {
  if (arguments.length === 2) {
    fn(arg as T);
    return arg as T;
  }
  return (a: T) => {
    fn(a);
    return a;
  };
}

export const tap =
  <T, U>(fn: Fn<T, U>) =>
  (arg: T) =>
    [arg, fn(arg)];

export const prop =
  <const K extends PropertyKey>(key: K) =>
  <const T extends object>(obj: T): K extends keyof T ? T[K] : undefined =>
    obj[key as unknown as keyof T] as K extends keyof T ? T[K] : undefined;
