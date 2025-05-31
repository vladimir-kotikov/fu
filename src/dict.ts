type Fn<T, R> = (obj: T) => R;

export function pick<
  const K extends string,
  const T extends { [key in K]: unknown }
>(keys: K[], obj: T): Pick<T, K>;

export function pick<
  const K extends string,
  const T extends { [key in K]: unknown }
>(keys: K[]): Fn<T, Pick<T, K>>;

export function pick<
  const K extends string,
  const T extends { [key in K]: unknown }
>(keys: K[], obj?: T): Pick<T, K> | Fn<T, Pick<T, K>> {
  const _pick =
    (keys: K[]) =>
    (obj: T): Pick<T, K> =>
      keys.reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {} as Pick<T, K>);

  return obj !== undefined ? _pick(keys)(obj) : _pick(keys);
}

export function omit<const K extends string | number>(
  key: K
): <const T extends Record<K, unknown>>(obj: T) => Omit<T, K>;

export function omit<
  const K extends string | number,
  const T extends Record<K, unknown>
>(key: K, obj: T): Omit<T, K>;

export function omit<
  const K extends string | number,
  const T extends Record<K, unknown>
>(key: K, obj?: T): Omit<T, K> | ((obj: T) => Omit<T, K>) {
  if (obj === undefined) {
    return (obj: T): Omit<T, K> => {
      const { [key]: _, ...rest } = obj;
      return rest;
    };
  }

  return omit(key)(obj);
}
