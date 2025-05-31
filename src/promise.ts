import { map } from "./list";

export const allSettled = <T>(p: Promise<T>[]) => Promise.allSettled(p);

export const allSettledOrUndefined = <T>(p: Promise<T>[]) =>
  allSettled(p).then(
    map(res => (res.status === "fulfilled" ? res.value : undefined))
  );
