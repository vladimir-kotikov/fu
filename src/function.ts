export const memo = <T>(fn: () => T): (() => T) => {
  let cache: T | undefined;
  return () => cache ?? (cache = fn());
};
