// import '../src/types/Promise.d.ts';

export type Pronad<E, T> = Promise<T>;

export const monadifyPromises = () => {
  Promise.prototype.map = function<E, T, R>(fn: (resolvedVal: T) => R): Pronad<E, R> {
    return this.then(fn);
  };
  Promise.prototype.rejMap = function<E, T, F>(fn: (rejectedVal: E | any) => F): Pronad<F, T> {
    return this.catch((e: E | any): Pronad<F, never> => Promise.reject(fn(e)));
  };

  Promise.prototype.bind = Promise.prototype.flatMap = function<E, T, R>(fn: (resolvedVal: T) => Pronad<E, R>): Pronad<E, R> {
    return this.then(fn);
  };
  Promise.prototype.rejBind = Promise.prototype.rejFlatMap = function<E, T, F>(fn: (rejectedVal: E | any) => Pronad<F, T>): Pronad<F, T> {
    return this.catch((e: E | any): Pronad<F, T> => fn(e));
  };

  Promise.prototype.cata = function<T, E, R>(
    rejFn: (rejectedVal: E | any) => R,
    resFn: (resolvedVal: T) => R,
  ): Pronad<never, R> {
    return this.then(resFn, rejFn);
  };

  Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
    return this.catch(fn);
  };
}
