import './types/Promise.d.ts';
import './types/Pronad.d.ts';

export const monadifyPromises = () => {
  Promise.prototype.map = function<T, R>(fn: (resolvedVal: T) => R): Promise<R> {
    return this.then(fn);
  };
  Promise.prototype.leftMap = function<T, E>(fn: (rejectedVal: E | any) => any): Promise<T> {
    return this.catch((e: E | any): Promise<T> => Promise.reject(fn(e)));
  };
}