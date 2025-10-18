export type Fn<T extends any = any, R extends any = any> = (value: T) => R;
type VarFn<T extends any[] = any[], R extends any = any> = (...args: T) => R;
type NonEmptyArray<T> = [...T[], T];
type Fns = NonEmptyArray<Fn<any, any>>;

type RequiredFirstParam<Func extends VarFn> = Parameters<Func> extends [
  infer Head,
  ...infer Tail
]
  ? [Head, ...Partial<Tail>]
  : [];

type RemainingParameters<
  AppliedParams extends any[],
  ExpectedParams extends any[]
> = AppliedParams extends [any, ...infer ATail]
  ? ExpectedParams extends [any, ...infer ETail]
    ? RemainingParameters<ATail, ETail>
    : []
  : ExpectedParams;

export type CurriedFunction<Func extends VarFn> = <
  AppliedParams extends RequiredFirstParam<Func>
>(
  ...args: AppliedParams
) => RemainingParameters<AppliedParams, Parameters<Func>> extends [
  any,
  ...any[]
]
  ? CurriedFunction<
      (
        ...args: RemainingParameters<AppliedParams, Parameters<Func>>
      ) => ReturnType<Func>
    >
  : ReturnType<Func>;

export const curry = <Func extends VarFn>(
  f: Func,
  ...args: Partial<Parameters<Func>>
): CurriedFunction<Func> => {
  const curriedFunc = (...nextArgs: RequiredFirstParam<Func>) => {
    const allArgs = [...args, ...nextArgs];

    if (allArgs.length >= f.length) {
      return f(...args, ...nextArgs);
    } else {
      return curry(f, ...(allArgs as Parameters<Func>));
    }
  };

  return curriedFunc;
};

export const apply =
  <P extends readonly unknown[], R>(fn: (...args: P) => R) =>
  (args: P): R =>
    fn(...args);

type Compose<T extends Fns> = T extends [...infer Rest, Fn<infer A, infer B>]
  ? Rest extends Fns
    ? Compose<Rest> extends Fn<B, infer C>
      ? Fn<A, C>
      : never
    : Fn<A, B>
  : never;

export const compose = <T extends Fns>(...fns: T): Compose<T> =>
  (value => fns.reduceRight((acc, fn) => fn(acc), value)) as Compose<T>;

type Pipe<T extends Fns> = T extends [Fn<infer A, infer B>, ...infer Rest]
  ? Rest extends Fns
    ? Pipe<Rest> extends Fn<B, infer C>
      ? Fn<A, C>
      : never
    : Fn<A, B>
  : never;

export const pipe = <T extends Fns>(...fns: T): Pipe<T> =>
  (value => fns.reduce((acc, fn) => fn(acc), value)) as Pipe<T>;

export const memo = <T>(fn: () => T): (() => T) => {
  let cache: T | undefined;
  return () => cache ?? (cache = fn());
};
