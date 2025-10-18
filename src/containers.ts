import { Option as Maybe } from "@swan-io/boxed";
import { id } from "./operators";

type Fn<T, U> = (a: T) => U;
type Ctor<T> = (...args: any[]) => T;

type ValueType<F> = F extends Task<infer T>
  ? T
  : F extends List<infer T>
  ? T
  : F extends Applicative<infer T>
  ? T
  : F extends Functor<infer T>
  ? T
  : never;

type WithValueType<F, T> = F extends Task<unknown>
  ? Task<T>
  : F extends List<unknown>
  ? List<T>
  : F extends Applicative<unknown>
  ? Applicative<T>
  : F extends Functor<unknown>
  ? Functor<T>
  : never;

type WithListOfValueType<F> = WithValueType<F, List<ValueType<F>>>;

type Fork<T, E> = (resolve: (x: T) => void, reject: (x: E) => void) => void;

const isApplicative = <T>(x: unknown): x is Applicative<T> =>
  typeof (x as Applicative<T>).map === "function" &&
  typeof (x as Applicative<T>).ap === "function";

interface Functor<T> {
  map<U>(fn: (a: T) => U): Functor<U>;
}

interface Applicative<T> extends Functor<T> {
  // static of<T>(value: T): ThisType<T>;

  map<U>(fn: (a: T) => U): Applicative<U>;
  ap<U, V = T extends Fn<U, infer R> ? R : never>(
    other: Functor<U>
  ): Functor<V>;
}

interface Traversable<T> extends Functor<T> {
  traverse<U>(
    of: (init: Traversable<U>) => Applicative<Traversable<U>>,
    transform: (item: T) => Applicative<U>
  ): Applicative<Traversable<U>>;
}

export class List<T> extends Array<T> implements Traversable<T> {
  static of = <T>(...val: T[]) => new List(...val);

  map = <U>(fn: (a: T, i: number, arr: T[]) => U): List<U> => {
    return new List(...super.map(fn));
  };

  concat(...items: (T | ConcatArray<T>)[]): List<T> {
    return new List(...super.concat(...items));
  }

  head = () => Maybe.fromUndefined(this[0]);

  private isApplicativeList = <
    U extends Applicative<unknown>
  >(): this is List<U> => this.every(isApplicative);

  sequence = <
    V = T extends Applicative<infer U> ? WithListOfValueType<T> : never
  >(
    // TODO: fix any
    of: any
  ): V => {
    if (!this.isApplicativeList<Applicative<unknown>>()) {
      throw new Error("List is not an Applicative");
    }

    return this.traverse(of, id) as V;
  };

  traverse = <U extends Applicative<unknown>>(
    of: Ctor<WithListOfValueType<U>>,
    transform: (item: T) => U
  ): WithListOfValueType<U> => {
    const concatWith =
      <B>(b: B) =>
      (bs: List<B>): List<B> =>
        bs.concat(b);

    return this.reduce(
      (result, item) =>
        transform(item).map(concatWith).ap(result) as WithListOfValueType<U>,
      of(new List([]))
    );
  };
}

export class Task<T, E = never> implements Applicative<T> {
  constructor(private readonly fork: Fork<T, E>) {}
  static of<T, E = never>(value: T): Task<T, E> {
    return new Task(resolve => resolve(value));
  }
  static rejected<E>(error: E): Task<never, E> {
    return new Task((_, reject) => reject(error));
  }

  map<U>(fn: (a: T) => U): Task<U, E> {
    return new Task((resolve, reject) =>
      this.fork(value => resolve(fn(value)), reject)
    );
  }

  flatMap = <U, E1>(fn: (a: T) => Task<U, E1>): Task<U, E | E1> =>
    new Task((resolve, reject) =>
      this.fork(x => fn(x).fork(resolve, reject), reject)
    );

  ap<U, V = T extends Fn<U, infer R> ? R : never>(
    other: Task<U>
  ): T extends Fn<U, V> ? Task<V, E> : never {
    return this.flatMap(fn => other.map(fn as Fn<U, V>)) as T extends Fn<U, V>
      ? Task<V, E>
      : never;
  }

  tap = <U>(fn: (a: T) => U): Task<T, E> =>
    new Task((resolve, reject) =>
      this.fork(value => {
        fn(value);
        resolve(value);
      }, reject)
    );

  tapRejected = (fn: (e: E) => void): Task<T, E> =>
    new Task((resolve, reject) =>
      this.fork(resolve, e => {
        fn(e);
        reject(e);
      })
    );

  toPromise = (): Promise<T> => new Promise(this.fork);
}
