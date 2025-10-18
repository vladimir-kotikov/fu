import { compose } from "./function";
import { filter, map } from "./list";

export const allSettled = <T>(p: Promise<T>[]) => Promise.allSettled(p);

export const allSettledOrUndefined = <T>(p: Promise<T>[]) =>
  allSettled(p).then(
    map(res => (res.status === "fulfilled" ? res.value : undefined))
  );

export const settledOnly = <T>(p: Promise<T>[]) =>
  allSettled(p).then(
    compose(
      map<PromiseFulfilledResult<T>, T>(res => res.value),
      filter<PromiseSettledResult<T>>(res => res.status === "fulfilled")
    )
  );
