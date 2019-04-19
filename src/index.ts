import { Pnd } from './Pnd';

export { Pnd };

interface PronadConstructor {
  unit<T>(val: T): Pnd<never, T>,
  fromFalsey<E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T>,
  fromNull<E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T>,
}

export const Pronad: PronadConstructor = {
  unit: <T>(val: T): Pnd<any, T> => Promise.resolve(val),
  fromFalsey: <E, T>(val: T | undefined | null | false, ifFalsey?: E): Pnd<E, T> => {
    return val !== undefined && val !== null && val !== false
      ? Promise.resolve(val)
      : Promise.reject(typeof ifFalsey !== 'undefined' ? ifFalsey : null);
  },
  fromNull: <E, T>(val: T | undefined | null, ifNull?: E): Pnd<E, T> => {
    return val !== undefined && val !== null
      ? Promise.resolve(val)
      : Promise.reject(typeof ifNull !== 'undefined' ? ifNull : null);
  }
}

export const monadifyPromises = () => {
  Promise.prototype.map = function<E, T, R>(fn: (resVal: T) => R): Pnd<E, R> {
    return this.then(fn);
  };
  Promise.prototype.rejMap =
  Promise.prototype.leftMap = function<E, T, F>(fn: (rejVal: E | any) => F): Pnd<F, T> {
    return this.catch((e: E | any): Pnd<F, never> => Promise.reject(fn(e)));
  };

  Promise.prototype.chain = 
  Promise.prototype.flatMap =
  Promise.prototype.bind = function<E, T, R>(fn: (resVal: T) => Pnd<E, R>): Pnd<E, R> {
    return this.then(fn);
  };
  
  Promise.prototype.rejChain =
  Promise.prototype.rejFlatMap =
  Promise.prototype.rejBind =
  Promise.prototype.leftChain = 
  Promise.prototype.leftFlatMap =
  Promise.prototype.leftBind = function<E, T, F>(fn: (rejVal: E | any) => Pnd<F, T>): Pnd<F, T> {
    return this.catch((e: E | any): Pnd<F, T> => fn(e));
  };

  Promise.prototype.cata = function<T, E, R>(
    rejFn: (rejVal: E | any) => R,
    resFn: (resVal: T) => R,
  ): Pnd<never, R> {
    return this.then(resFn, rejFn);
  };

  Promise.prototype.tap = function<E, T>(fn: (val: T) => void): Pnd<E, T> {
    return this.then((val: T): T => {
      fn(val);
      return val;
    });
  };

  Promise.prototype.doubleTap = function<E, T>(fn: (rejVal: E | any | null, resVal: T | null, isResolved?: boolean) => void): Pnd<E, T> {
    return this.then(
      (resVal: T): T => {
        fn(null, resVal, true);
        return resVal;
      },
      (rejVal: E): Pnd<E, never> => {
        fn(rejVal, null, false);
        return Promise.reject(rejVal);
      },
    );
  };

  Promise.prototype.bimap = function<T, E, F, R>(
    rejFn: (rejVal: E | any) => F,
    resFn: (resVal: T) => R,
  ): Pnd<F, R> {
    return this.then(resFn, (e: E | any): Pnd<F, never> => Promise.reject(rejFn(e)));
  };

  Promise.prototype.recover = function<E, T>(fn: (rejVal: E | any) => T): Promise<T> {
    return this.catch(fn);
  };
}
