export const pass = <T>(value: T): T => value;
export const id = pass;

// Scalar operators

export const isUndefined = (value: unknown): value is undefined =>
  value === undefined;

export const isDefined = <T>(value: T | undefined): value is T =>
  value !== undefined;

export const equals = (value: unknown) => (other: unknown) => value === other;

// Predicate operators

export const not =
  <T>(predicate: (value: T) => boolean) =>
  (value: T) =>
    !predicate(value);

export const either =
  <T>(...predicates: ((value: T) => boolean)[]): ((value: T) => boolean) =>
  (value: T): boolean =>
    predicates.some(predicate => predicate(value));

export const maybe =
  <T>(predicate: (value: T) => boolean) =>
  (value: T): boolean =>
    predicate(value);

export const apply =
  <P extends readonly unknown[], R>(fn: (...args: P) => R) =>
  (args: P): R =>
    fn(...args);

export const tee =
  <T>(fn: (arg: T) => unknown) =>
  (arg: T): T => {
    fn(arg);
    return arg;
  };

export const prop =
  <const K extends PropertyKey>(key: K) =>
  <const T extends Record<PropertyKey, unknown>>(
    obj: T
  ): K extends keyof T ? T[K] : undefined =>
    (key in obj ? obj[key as keyof T] : undefined) as K extends keyof T
      ? T[K]
      : undefined;

// Tests:
// const getFoo = prop("foo");
// const foo = getFoo({ foo: 1, bar: "2" });
// getFoo({ bar: "2" });

type Fn<T, U> = (val: T) => U;

type Pipe<T> = {
  to: <U>(fn: Fn<T, U>) => Pipe<U>;
  maybe: <U>(fn: Fn<Just<T>, U>) => MaybeIf<T, Pipe<U>, Pipe<T>>;
  value: () => T;
};

type StaticPipe<T, U> = {
  to: <V>(fn: Fn<U, V>) => StaticPipe<T, V>;
  call: (val: T) => U;
};

type MaybeIf<T, U, V> = T extends undefined ? V : U;
type Just<T> = Exclude<T, undefined>;
const isJust = <T>(value: T): value is Just<T> => value !== undefined;

// Poor man's monad
export const pipe = <T>(value: T): Pipe<T> => ({
  to: <U>(fn: Fn<T, U>): Pipe<U> => pipe(fn(value)),
  maybe: <U>(fn: Fn<Just<T>, U>): MaybeIf<T, Pipe<U>, Pipe<T>> =>
    (isJust<T>(value) ? pipe(fn(value)) : pipe(value)) as MaybeIf<
      T,
      Pipe<U>,
      Pipe<T>
    >,
  value: () => value,
});

// Static version
pipe.to = <T, U>(fn: Fn<T, U>): StaticPipe<T, U> => ({
  to: <V>(next: Fn<U, V>): StaticPipe<T, V> =>
    pipe.to((val: T) => next(fn(val))),
  call: fn,
});

// Some tests
// const logValue = pipe("foo").to(JSON.stringify).value();
// const logJson = pipe.to(JSON.stringify).to(console.log);
// const logged = logJson.call("foo");
